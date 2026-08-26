import { Resend } from "resend";

let instancia: Resend | null = null;

/** Cliente Resend (lazy) — evita erro em build/dev quando a API key ainda não foi configurada. */
export function getResendClient(): Resend {
  if (!instancia) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RESEND_API_KEY não configurada. Defina-a em .env.local (veja .env.example)."
      );
    }
    instancia = new Resend(apiKey);
  }
  return instancia;
}
