import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Informe o e-mail").email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const signupSchema = z.object({
  nome: z.string().trim().min(1, "Informe seu nome").max(150),
  email: z.string().trim().min(1, "Informe o e-mail").email("E-mail inválido"),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .max(72, "Máximo de 72 caracteres"),
});
