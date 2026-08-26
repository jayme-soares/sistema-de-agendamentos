import { CalendarClock, CircleAlert, Hourglass } from "lucide-react";
import { redirect } from "next/navigation";

import { signOut } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buscarPerfilAtual } from "@/lib/data/usuarios";

export default async function AguardandoAprovacaoPage() {
  const perfil = await buscarPerfilAtual();

  if (!perfil) redirect("/login");
  if (perfil.status_conta === "aprovado") redirect("/dashboard");

  const rejeitado = perfil.status_conta === "rejeitado";

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-gradient-to-b from-background to-muted/40 p-6">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="flex items-center gap-2 text-lg font-semibold">
        <CalendarClock className="size-6 text-primary" />
        Agendamentos de Ordens de Serviço
      </div>

      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center gap-2">
          <div
            className={
              rejeitado
                ? "flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                : "flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"
            }
          >
            {rejeitado ? <CircleAlert className="size-6" /> : <Hourglass className="size-6" />}
          </div>
          <CardTitle>{rejeitado ? "Acesso não autorizado" : "Cadastro em análise"}</CardTitle>
          <CardDescription>
            {rejeitado
              ? "Um administrador revisou seu cadastro e não liberou o acesso a este sistema."
              : "Sua conta foi criada e está aguardando a aprovação de um administrador. Você receberá acesso assim que ela for revisada."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Entrou com <span className="font-medium text-foreground">{perfil.email}</span>
          </p>
        </CardContent>
      </Card>

      <form action={signOut}>
        <Button type="submit" variant="outline">
          Sair
        </Button>
      </form>
    </div>
  );
}
