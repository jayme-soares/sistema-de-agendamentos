import { CalendarClock } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center gap-8 overflow-hidden bg-gradient-to-b from-background to-muted/40 p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-primary/10 blur-3xl"
      />
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="relative flex items-center gap-2 text-lg font-semibold">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CalendarClock className="size-5" />
        </div>
        Agendamentos de Ordens de Serviço
      </div>
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
