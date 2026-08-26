"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { aprovarUsuario, definirPapel, rejeitarUsuario } from "@/app/actions/usuarios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PAPEL_LABELS,
  STATUS_CONTA_BADGE_VARIANT,
  STATUS_CONTA_LABELS,
} from "@/lib/constants";
import type { Profile } from "@/lib/types/database.types";
import { formatarDataHora } from "@/lib/utils/date";

export function UsuariosAdminPanel({
  usuarios,
  perfilAtualId,
}: {
  usuarios: Profile[];
  perfilAtualId: string;
}) {
  const pendentes = usuarios.filter((u) => u.status_conta === "pendente");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function executar(promessa: Promise<{ error?: string }>, mensagemSucesso: string) {
    startTransition(async () => {
      const resultado = await promessa;
      if (resultado.error) toast.error(resultado.error);
      else {
        toast.success(mensagemSucesso);
        router.refresh();
      }
    });
  }

  return (
    <Tabs defaultValue={pendentes.length > 0 ? "pendentes" : "todos"} className="flex flex-col gap-4">
      <TabsList className="w-fit">
        <TabsTrigger value="pendentes">
          Pendentes
          {pendentes.length > 0 && (
            <Badge variant="destructive" className="ml-1">
              {pendentes.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="todos">Todos os usuários</TabsTrigger>
      </TabsList>

      <TabsContent value="pendentes" className="flex flex-col gap-4">
        {pendentes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum cadastro aguardando aprovação.
          </p>
        ) : (
          pendentes.map((usuario) => (
            <Card key={usuario.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">{usuario.nome}</CardTitle>
                  <CardDescription>
                    {usuario.email} · cadastrado em {formatarDataHora(usuario.created_at)}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      executar(aprovarUsuario(usuario.id), `${usuario.nome} aprovado(a).`)
                    }
                  >
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={pending}
                    onClick={() =>
                      executar(rejeitarUsuario(usuario.id), `${usuario.nome} rejeitado(a).`)
                    }
                  >
                    Rejeitar
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="todos">
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((usuario) => {
                const ehVoceMesmo = usuario.id === perfilAtualId;
                return (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">
                      {usuario.nome}
                      {ehVoceMesmo && (
                        <span className="ml-2 text-xs text-muted-foreground">(você)</span>
                      )}
                    </TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Badge variant={usuario.role === "admin" ? "default" : "outline"}>
                        {PAPEL_LABELS[usuario.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_CONTA_BADGE_VARIANT[usuario.status_conta]}>
                        {STATUS_CONTA_LABELS[usuario.status_conta]}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {formatarDataHora(usuario.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {usuario.status_conta === "pendente" && (
                          <Button
                            size="sm"
                            disabled={pending}
                            onClick={() =>
                              executar(aprovarUsuario(usuario.id), `${usuario.nome} aprovado(a).`)
                            }
                          >
                            Aprovar
                          </Button>
                        )}
                        {usuario.status_conta === "aprovado" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={pending}
                            onClick={() =>
                              executar(rejeitarUsuario(usuario.id), `${usuario.nome} rejeitado(a).`)
                            }
                          >
                            Rejeitar
                          </Button>
                        )}
                        {usuario.status_conta === "rejeitado" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={() =>
                              executar(aprovarUsuario(usuario.id), `${usuario.nome} reaprovado(a).`)
                            }
                          >
                            Reaprovar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending || ehVoceMesmo}
                          onClick={() =>
                            executar(
                              definirPapel(
                                usuario.id,
                                usuario.role === "admin" ? "usuario" : "admin"
                              ),
                              usuario.role === "admin"
                                ? `${usuario.nome} agora é usuário comum.`
                                : `${usuario.nome} agora é administrador(a).`
                            )
                          }
                        >
                          {usuario.role === "admin" ? "Remover admin" : "Tornar admin"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
