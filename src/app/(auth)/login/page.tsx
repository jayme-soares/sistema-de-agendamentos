import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ cadastrado?: string }>;
}) {
  const { cadastrado } = await searchParams;
  const mensagem = cadastrado
    ? "Conta criada! Confirme seu e-mail e depois faça login. Um administrador ainda precisa aprovar seu acesso antes que você possa usar o sistema."
    : undefined;

  return <LoginForm mensagem={mensagem} />;
}
