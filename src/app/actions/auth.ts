"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validations/auth.schema";

export interface AuthState {
  error?: string;
}

export async function signIn(
  _prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { error: "E-mail ou senha inválidos" };
  }

  redirect("/dashboard");
}

export async function signUp(
  _prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  const parsed = signupSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { nome: parsed.data.nome } },
  });
  if (error) {
    return { error: error.message };
  }

  // Se a confirmação por e-mail estiver desativada no projeto Supabase, o
  // signUp já retorna uma sessão válida (usuário fica autenticado na hora).
  // Mandamos direto pro /dashboard: o layout do grupo (app) cuida de
  // redirecionar para /aguardando-aprovacao se o cadastro ainda não tiver
  // sido aprovado por um admin. Se a confirmação estiver ativada, não há
  // sessão ainda — mostramos o aviso de "verifique seu e-mail" no login.
  if (data.session) {
    redirect("/dashboard");
  }

  redirect("/login?cadastrado=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
