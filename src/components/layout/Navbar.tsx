"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, LogOut, Menu } from "lucide-react";
import { useState } from "react";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Resumo" },
  { href: "/agendamentos", label: "Agendamentos" },
  { href: "/relatorios", label: "Relatórios" },
];

export function Navbar({ nome, email }: { nome: string; email: string }) {
  const pathname = usePathname();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <CalendarClock className="size-5" />
          <span className="hidden sm:inline">Agendamentos</span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith(link.href) && "bg-accent text-accent-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="ml-auto md:hidden"
          onClick={() => setMenuAberto((v) => !v)}
          aria-label="Abrir menu"
        >
          <Menu className="size-5" />
        </Button>

        <div className="ml-auto hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                {nome}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-normal text-muted-foreground">
                {email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <form action={signOut}>
                <DropdownMenuItem asChild>
                  <button type="submit" className="flex w-full items-center gap-2">
                    <LogOut className="size-4" />
                    Sair
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {menuAberto && (
        <nav className="flex flex-col gap-1 border-t px-4 py-2 md:hidden">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuAberto(false)}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                pathname.startsWith(link.href) && "bg-accent text-accent-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center justify-between px-3 py-2 text-sm text-muted-foreground">
            <span>{email}</span>
            <form action={signOut}>
              <Button variant="ghost" size="sm" type="submit" className="gap-2">
                <LogOut className="size-4" />
                Sair
              </Button>
            </form>
          </div>
        </nav>
      )}
    </header>
  );
}
