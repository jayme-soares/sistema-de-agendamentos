import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ cadastrado?: string }>;
}) {
  const { cadastrado } = await searchParams;
  const mensagem = cadastrado
    ? "Conta criada! Verifique seu e-mail para confirmar o cadastro e depois faça login."
    : undefined;

  return <LoginForm mensagem={mensagem} />;
}
