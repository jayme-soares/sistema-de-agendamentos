import { redirect } from "next/navigation";

// A raiz do site não tem UI própria: usuários autenticados vão para o
// dashboard, e o proxy (src/proxy.ts) já redireciona não-autenticados
// para /login antes mesmo de chegar aqui.
export default function Home() {
  redirect("/dashboard");
}
