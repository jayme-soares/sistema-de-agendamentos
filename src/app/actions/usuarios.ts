"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { PapelUsuario } from "@/lib/types/database.types";

export interface ActionState {
  error?: string;
}

async function exigirAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, ehAdmin: false as const };

  const { data: perfil } = await supabase
    .from("profiles")
    .select("role, status_conta")
    .eq("id", user.id)
    .maybeSingle();

  const ehAdmin = perfil?.role === "admin" && perfil?.status_conta === "aprovado";
  return { supabase, ehAdmin };
}

function revalidarAdmin() {
  revalidatePath("/admin");
}

/** Aprova o cadastro de um usuário, liberando o acesso ao sistema. */
export async function aprovarUsuario(id: string): Promise<ActionState> {
  const { supabase, ehAdmin } = await exigirAdmin();
  if (!ehAdmin) return { error: "Apenas administradores podem aprovar usuários." };

  const { error } = await supabase
    .from("profiles")
    .update({ status_conta: "aprovado" })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidarAdmin();
  return {};
}

/** Rejeita o cadastro de um usuário (bloqueia o acesso ao sistema). */
export async function rejeitarUsuario(id: string): Promise<ActionState> {
  const { supabase, ehAdmin } = await exigirAdmin();
  if (!ehAdmin) return { error: "Apenas administradores podem rejeitar usuários." };

  const { error } = await supabase
    .from("profiles")
    .update({ status_conta: "rejeitado" })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidarAdmin();
  return {};
}

/** Reverte um usuário rejeitado de volta para aprovado. */
export async function reaprovarUsuario(id: string): Promise<ActionState> {
  return aprovarUsuario(id);
}

/** Promove ou rebaixa um usuário entre os papéis "admin" e "usuario". */
export async function definirPapel(id: string, papel: PapelUsuario): Promise<ActionState> {
  const { supabase, ehAdmin } = await exigirAdmin();
  if (!ehAdmin) return { error: "Apenas administradores podem alterar papéis de usuário." };

  const { error } = await supabase.from("profiles").update({ role: papel }).eq("id", id);

  if (error) return { error: error.message };
  revalidarAdmin();
  return {};
}
