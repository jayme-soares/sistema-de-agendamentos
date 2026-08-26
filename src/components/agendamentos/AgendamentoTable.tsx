"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

import { cancelarAgendamento, marcarRealizado } from "@/app/actions/agendamentos";
import { AdiarModal } from "@/components/agendamentos/AdiarModal";
import { StatusBadge } from "@/components/agendamentos/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Agendamento } from "@/lib/types/database.types";
import { formatarDataHora } from "@/lib/utils/date";

export function AgendamentoTable({ agendamentos }: { agendamentos: Agendamento[] }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleCancelar(id: string) {
    startTransition(async () => {
      const resultado = await cancelarAgendamento(id);
      if (resultado.error) {
        toast.error(resultado.error);
      } else {
        toast.success("Agendamento cancelado.");
        router.refresh();
      }
    });
  }

  function handleRealizado(id: string) {
    startTransition(async () => {
      const resultado = await marcarRealizado(id);
      if (resultado.error) {
        toast.error(resultado.error);
      } else {
        toast.success("Agendamento marcado como realizado.");
        router.refresh();
      }
    });
  }

  if (agendamentos.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Nenhum agendamento encontrado.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº OS</TableHead>
            <TableHead>Tipo de serviço</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {agendamentos.map((agendamento) => {
            const podeAgir = agendamento.status === "pendente";
            return (
              <TableRow key={agendamento.id}>
                <TableCell className="font-medium">{agendamento.numero_os}</TableCell>
                <TableCell>{agendamento.tipo_servico}</TableCell>
                <TableCell>{agendamento.cliente_nome}</TableCell>
                <TableCell>{agendamento.cliente_contato}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatarDataHora(agendamento.data_agendamento)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={agendamento.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" disabled={pending}>
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/agendamentos/${agendamento.id}`}>Ver detalhes</Link>
                      </DropdownMenuItem>
                      {podeAgir && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link href={`/agendamentos/${agendamento.id}/editar`}>Editar</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleRealizado(agendamento.id)}>
                            Marcar como realizado
                          </DropdownMenuItem>
                          <AdiarModal
                            agendamento={agendamento}
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                Adiar
                              </DropdownMenuItem>
                            }
                          />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => handleCancelar(agendamento.id)}
                          >
                            Cancelar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
