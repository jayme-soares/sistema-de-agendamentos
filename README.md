# Sistema de Agendamento de Ordens de Serviço

Aplicação web para registrar e acompanhar agendamentos de ordens de serviço:
cadastro (nº da OS, tipo de serviço, cliente, contato, data), controle de
status (pendente / cancelado / realizado / adiado — com reagendamento
automático), painel de resumo com notificações de agendamentos de hoje e
próximos, relatórios com exportação em CSV, lembretes diários por e-mail para
os usuários do sistema, e um painel de administração para aprovar novos
cadastros e gerenciar papéis de usuário.

Stack: [Next.js](https://nextjs.org) 16 (App Router, TypeScript) +
[Supabase](https://supabase.com) (Postgres + Auth) + [Resend](https://resend.com)
(e-mail) + [shadcn/ui](https://ui.shadcn.com) (com modo claro/escuro) —
hospedado na [Vercel](https://vercel.com).
