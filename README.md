# Sistema de Agendamento de Ordens de Serviço

Aplicação web para registrar e acompanhar agendamentos de ordens de serviço:
cadastro (nº da OS, tipo de serviço, cliente, contato, data), controle de
status (pendente / cancelado / realizado / adiado — com reagendamento
automático), painel de resumo com notificações de agendamentos de hoje e
próximos, relatórios com exportação em CSV, e lembretes diários por e-mail.

Stack: [Next.js](https://nextjs.org) 16 (App Router, TypeScript) +
[Supabase](https://supabase.com) (Postgres + Auth) + [Resend](https://resend.com)
(e-mail) + [shadcn/ui](https://ui.shadcn.com) — hospedado na [Vercel](https://vercel.com).

## 1. Pré-requisitos

- Node.js 20+ e npm.
- Uma conta em [supabase.com](https://supabase.com) (grátis).
- Uma conta em [resend.com](https://resend.com) (grátis) — só é necessária
  quando for configurar os lembretes por e-mail.

## 2. Configurar o Supabase

1. Crie um projeto em https://supabase.com/dashboard.
2. Em **Project Settings → API**, copie a `Project URL`, a `anon public key`
   e a `service_role key`.
3. Aplique as migrations de `supabase/migrations/` **na ordem** (`0001`,
   `0002`, `0003`) pelo **SQL Editor** do painel do Supabase (cole o
   conteúdo de cada arquivo e execute), ou via [Supabase CLI](https://supabase.com/docs/guides/cli):

   ```bash
   npx supabase login
   npx supabase link --project-ref <ID_DO_PROJETO>
   npx supabase db push
   ```

4. (Opcional, recomendado) Regenere os tipos TypeScript a partir do schema
   real do banco — o arquivo `src/lib/types/database.types.ts` foi escrito à
   mão para acompanhar as migrations, mas fica mais seguro mantê-lo em sincronia:

   ```bash
   npx supabase gen types typescript --project-id <ID_DO_PROJETO> > src/lib/types/database.types.ts
   ```

5. Crie os primeiros usuários da equipe. Como o cadastro (`/signup`) é
   aberto, qualquer pessoa com o link pode criar conta — se preferir
   restringir, crie os usuários manualmente em **Authentication → Users →
   Add user** e não divulgue a página de cadastro.

## 3. Configurar o Resend (lembretes por e-mail)

1. Crie uma API key em https://resend.com/api-keys.
2. Em desenvolvimento, use o remetente de teste `onboarding@resend.dev` (não
   precisa verificar domínio). Em produção, verifique um domínio próprio em
   **Domains** e use um remetente desse domínio.
3. Defina `EMAIL_NOTIFICACOES_DESTINO` com o e-mail da equipe que deve
   receber o resumo diário de agendamentos pendentes de hoje.

## 4. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha os valores:

```bash
cp .env.example .env.local
```

| Variável | Descrição |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Do painel do Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Idem — **nunca** commitar ou expor ao client. |
| `RESEND_API_KEY` | Do painel do Resend. |
| `EMAIL_REMETENTE` / `EMAIL_NOTIFICACOES_DESTINO` | Remetente e destinatário dos lembretes. |
| `CRON_SECRET` | String aleatória (ex.: `openssl rand -hex 32`); protege a rota de cron. |

## 5. Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000 — você será redirecionado para `/login`. Crie uma
conta em `/signup` (o Supabase pede confirmação por e-mail por padrão antes
do primeiro login).

### Testando o lembrete por e-mail localmente

O Vercel Cron **só roda em produção**. Para testar em desenvolvimento, crie
um agendamento com data de hoje e chame a rota manualmente:

```bash
curl http://localhost:3000/api/cron/lembretes -H "Authorization: Bearer SEU_CRON_SECRET"
```

Rodar duas vezes seguidas não deve reenviar o e-mail (verifique a tabela
`notificacoes_enviadas` no Supabase).

## 6. Deploy na Vercel

1. Suba o repositório para o GitHub/GitLab/Bitbucket e importe o projeto em
   https://vercel.com/new.
2. Em **Project Settings → Environment Variables**, cadastre as mesmas
   variáveis do `.env.local` (para Production, Preview e Development).
3. Após o primeiro deploy, confira em **Project Settings → Cron Jobs** que o
   job definido em `vercel.json` está ativo.

## Sobre o fluxo de "Adiar"

Adiar um agendamento **pendente** não altera a data do registro atual:

1. O registro atual passa para o status **Adiado** (fica como histórico,
   não pode mais ser editado).
2. Um **novo registro** é criado automaticamente com a nova data, mesma OS/
   cliente/tipo de serviço, e status **Pendente**.

Isso é feito atomicamente pela função `adiar_agendamento` no banco (veja
`supabase/migrations/0001_init_schema.sql`), evitando estados inconsistentes.
A tela de detalhe de qualquer agendamento (`/agendamentos/[id]`) mostra a
cadeia completa de reagendamentos de uma mesma OS.

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/login, (auth)/signup      # páginas públicas
│   ├── (app)/dashboard, agendamentos,   # páginas autenticadas
│   │   relatorios
│   ├── actions/                         # Server Actions (mutações)
│   └── api/cron, api/relatorios/export  # Route Handlers
├── components/
│   ├── agendamentos/, dashboard/, auth/, layout/, ui/ (shadcn)
├── lib/
│   ├── supabase/  (clients: server, client, admin, proxy/middleware)
│   ├── data/      (queries reutilizadas pelas páginas)
│   ├── validations/ (schemas Zod)
│   ├── utils/     (datas com fuso America/Sao_Paulo, CSV)
│   └── email/, resend/
└── proxy.ts        # protege as rotas autenticadas (substitui o antigo middleware.ts)
```
