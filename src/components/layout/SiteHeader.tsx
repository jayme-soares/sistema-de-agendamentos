"use client";

import { usePathname } from "next/navigation";

import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const TITULOS: Record<string, string> = {
  "/dashboard": "Resumo",
  "/agendamentos": "Agendamentos",
  "/relatorios": "Relatórios",
  "/admin": "Administração",
};

function tituloDaRota(pathname: string): string {
  const chave = Object.keys(TITULOS).find((prefixo) => pathname.startsWith(prefixo));
  return chave ? TITULOS[chave] : "Agendamentos";
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 h-4" />
      <h1 className="text-sm font-medium">{tituloDaRota(pathname)}</h1>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
