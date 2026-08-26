import { redirect } from "next/navigation";

import { Navbar } from "@/components/layout/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Segunda checagem server-side (defesa em profundidade), além do proxy
  // (src/proxy.ts) que já protege as rotas deste grupo.
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nome, email")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar nome={profile?.nome ?? user.email ?? "Usuário"} email={profile?.email ?? user.email ?? ""} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
