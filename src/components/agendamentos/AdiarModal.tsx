"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { adiarAgendamento } from "@/app/actions/agendamentos";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Agendamento } from "@/lib/types/database.types";
import { formatarDataHora, paraDatetimeLocalValue } from "@/lib/utils/date";

export function AdiarModal({
  agendamento,
  trigger,
}: {
  agendamento: Agendamento;
  trigger: React.ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const [novaData, setNovaData] = useState(() =>
    paraDatetimeLocalValue(agendamento.data_agendamento)
  );
  const [motivo, setMotivo] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirmar() {
    setErro(null);
    startTransition(async () => {
      const resultado = await adiarAgendamento(agendamento.id, novaData, motivo);
      if (resultado.error) {
        setErro(resultado.error);
        return;
      }
      toast.success("Agendamento adiado. Um novo agendamento pendente foi criado.");
      setAberto(false);
      setNovaData("");
      setMotivo("");
      if (resultado.novoId) {
        router.push(`/agendamentos/${resultado.novoId}`);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adiar agendamento</DialogTitle>
          <DialogDescription>
            OS {agendamento.numero_os} — {agendamento.cliente_nome}. Data atual:{" "}
            {formatarDataHora(agendamento.data_agendamento)}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="nova_data">Nova data do agendamento</Label>
            <Input
              id="nova_data"
              type="datetime-local"
              value={novaData}
              onChange={(e) => setNovaData(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="motivo">Motivo do adiamento (opcional)</Label>
            <Textarea
              id="motivo"
              rows={3}
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setAberto(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar} disabled={pending || !novaData}>
            {pending ? "Adiando..." : "Confirmar adiamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
