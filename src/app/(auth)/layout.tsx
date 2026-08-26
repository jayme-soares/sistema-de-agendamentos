import { CalendarClock } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 p-6">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <CalendarClock className="size-6" />
        Agendamentos de Ordens de Serviço
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
