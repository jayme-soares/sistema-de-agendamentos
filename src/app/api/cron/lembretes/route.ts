import { NextResponse, type NextRequest } from "next/server";

import { TIPO_NOTIFICACAO_LEMBRETE_DIA } from "@/lib/constants";
import { montarEmailLembreteDia } from "@/lib/email/templates/lembreteAgendamento";
import { getResendClient } from "@/lib/resend/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { rangeHoje } from "@/lib/utils/date";

/**
 * Disparado diariamente pelo Vercel Cron (ver `vercel.json`). Busca os
 * agendamentos pendentes de hoje que ainda não geraram um lembrete e envia
 * um único e-mail-resumo para a equipe interna.
 *
 * Em desenvolvimento local, o Vercel Cron não roda — chame esta rota
 * manualmente (veja o README) para testar.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const destino = process.env.EMAIL_NOTIFICACOES_DESTINO;
  if (!destino) {
    return NextResponse.json(
      { error: "EMAIL_NOTIFICACOES_DESTINO não configurado" },
      { status: 500 }
    );
  }

  const supabase = createAdminClient();
  const { inicio, fim } = rangeHoje();

  const { data: agendamentosHoje, error: fetchError } = await supabase
    .from("agendamentos")
    .select("*")
    .eq("status", "pendente")
    .gte("data_agendamento", inicio.toISOString())
    .lt("data_agendamento", fim.toISOString())
    .order("data_agendamento", { ascending: true });

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!agendamentosHoje || agendamentosHoje.length === 0) {
    return NextResponse.json({ enviados: 0, pulados: 0, mensagem: "Nenhum agendamento hoje." });
  }

  // Idempotência: não reenviar para agendamentos que já geraram o lembrete de hoje.
  const { data: jaNotificados } = await supabase
    .from("notificacoes_enviadas")
    .select("agendamento_id")
    .eq("tipo", TIPO_NOTIFICACAO_LEMBRETE_DIA)
    .in(
      "agendamento_id",
      agendamentosHoje.map((a) => a.id)
    );

  const idsJaNotificados = new Set((jaNotificados ?? []).map((n) => n.agendamento_id));
  const pendentesDeNotificar = agendamentosHoje.filter((a) => !idsJaNotificados.has(a.id));

  if (pendentesDeNotificar.length === 0) {
    return NextResponse.json({
      enviados: 0,
      pulados: agendamentosHoje.length,
      mensagem: "Lembrete de hoje já havia sido enviado.",
    });
  }

  try {
    const resend = getResendClient();
    const { assunto, html } = montarEmailLembreteDia(pendentesDeNotificar);

    const { error: sendError } = await resend.emails.send({
      from: process.env.EMAIL_REMETENTE ?? "onboarding@resend.dev",
      to: destino,
      subject: assunto,
      html,
    });

    if (sendError) {
      return NextResponse.json({ error: sendError.message }, { status: 502 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao enviar e-mail";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { error: insertError } = await supabase.from("notificacoes_enviadas").insert(
    pendentesDeNotificar.map((a) => ({
      agendamento_id: a.id,
      tipo: TIPO_NOTIFICACAO_LEMBRETE_DIA,
    }))
  );

  if (insertError) {
    // O e-mail já foi enviado; o `unique` constraint na tabela protege contra
    // duplicidade caso o cron rode de novo antes deste insert ser reprocessado.
    return NextResponse.json(
      {
        enviados: pendentesDeNotificar.length,
        avisoRegistro: `E-mail enviado, mas falhou ao registrar: ${insertError.message}`,
      },
      { status: 207 }
    );
  }

  return NextResponse.json({
    enviados: pendentesDeNotificar.length,
    pulados: idsJaNotificados.size,
  });
}
