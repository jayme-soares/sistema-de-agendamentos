import { NextResponse, type NextRequest } from "next/server";

import { TIPO_NOTIFICACAO_LEMBRETE_DIA } from "@/lib/constants";
import { montarEmailLembreteDia } from "@/lib/email/templates/lembreteAgendamento";
import { getResendClient } from "@/lib/resend/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { rangeHoje } from "@/lib/utils/date";

/**
 * Disparado diariamente pelo Vercel Cron (ver `vercel.json`). Busca os
 * agendamentos pendentes de hoje que ainda não geraram um lembrete e envia
 * um e-mail-resumo para cada usuário com cadastro aprovado no sistema.
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

  // Destinatários: todos os usuários com cadastro aprovado no sistema.
  const { data: destinatarios, error: usuariosError } = await supabase
    .from("profiles")
    .select("nome, email")
    .eq("status_conta", "aprovado");

  if (usuariosError) {
    return NextResponse.json({ error: usuariosError.message }, { status: 500 });
  }

  if (!destinatarios || destinatarios.length === 0) {
    return NextResponse.json({
      enviados: 0,
      mensagem: "Nenhum usuário aprovado para notificar.",
    });
  }

  const resend = getResendClient();
  const remetente = process.env.EMAIL_REMETENTE ?? "onboarding@resend.dev";

  const resultados = await Promise.allSettled(
    destinatarios.map((destinatario) => {
      const { assunto, html } = montarEmailLembreteDia(pendentesDeNotificar, destinatario.nome);
      return resend.emails.send({
        from: remetente,
        to: destinatario.email,
        subject: assunto,
        html,
      });
    })
  );

  const falhas = resultados
    .map((resultado, i) => ({ resultado, email: destinatarios[i].email }))
    .filter(
      ({ resultado }) => resultado.status === "rejected" || !!resultado.value.error
    );

  if (falhas.length === destinatarios.length) {
    return NextResponse.json(
      { error: "Falha ao enviar e-mail para todos os destinatários", detalhes: falhas },
      { status: 502 }
    );
  }

  const { error: insertError } = await supabase.from("notificacoes_enviadas").insert(
    pendentesDeNotificar.map((a) => ({
      agendamento_id: a.id,
      tipo: TIPO_NOTIFICACAO_LEMBRETE_DIA,
    }))
  );

  if (insertError) {
    // Os e-mails já foram enviados; o `unique` constraint na tabela protege
    // contra duplicidade caso o cron rode de novo antes deste insert ser
    // reprocessado.
    return NextResponse.json(
      {
        enviados: destinatarios.length - falhas.length,
        avisoRegistro: `E-mails enviados, mas falhou ao registrar: ${insertError.message}`,
      },
      { status: 207 }
    );
  }

  return NextResponse.json({
    enviados: destinatarios.length - falhas.length,
    falhas: falhas.length,
    pulados: idsJaNotificados.size,
  });
}
