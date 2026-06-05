# Melkzedek Store Platform

Plataforma para clientes solicitarem uma loja online com login, perfil, orçamento guiado, resumo simples, envio por EmailJS e painel admin.

## Páginas

- `/`: apresentação da plataforma com tema escuro, imagens e rede neural visual.
- `/orcamento`: orçamento guiado com 5 perguntas simples.
- `/perfil`: dados do cliente, liberado apenas depois do login.
- `/suporte`: tickets, respostas do admin e avaliações do cliente.
- `/assinaturas`: os 3 planos, sem preço público.
- `/admin`: painel completo liberado apenas para `melkzedd@gmail.com`.

## Rodar localmente

```bash
npm install
npm run dev
```

URL local: `http://127.0.0.1:3000`

Se o CSS do Next ficar preso em cache depois de alternar entre `build` e `dev`, use:

```bash
npm run dev:fresh
```

## Variáveis de ambiente

Crie `.env.local` na raiz do projeto e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_CLIENT_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
```

Sem essas variáveis, Supabase, login e EmailJS ficam sinalizados como pendentes.

## Supabase

1. Crie o projeto no Supabase.
2. Rode o SQL de `supabase/schema.sql` no SQL Editor.
3. Ative Google em Authentication > Providers.
4. Configure as URLs de redirect do Google/Supabase para `http://127.0.0.1:3000` e a URL de produção.

Tabelas criadas:

- `profiles`: dados do cliente, documento e empresa.
- `quote_requests`: solicitações de orçamento, respostas e status.
- `client_subscriptions`: planos solicitados/ativos por cliente.
- `support_tickets`: tickets e respostas do admin dentro da plataforma.
- `client_reviews`: avaliações dos clientes.

O painel admin libera orçamentos, clientes, assinaturas, suporte e avaliações para
`melkzedd@gmail.com`.

## EmailJS

Crie um service e dois templates:

- Template do cliente: confirmação do orçamento.
- Template do admin: nova solicitação recebida.

Em cada template, configure o campo `To Email` como `{{to_email}}`. O app envia
primeiro para o cliente e depois para o admin, respeitando o limite do EmailJS
de 1 envio por segundo.

Variaveis usadas nos templates:

```txt
request_id
client_name
client_email
company_name
tax_id
phone
segment
store_name
recommended_plan
answers_summary
reference_links
service_note
additional_notes
admin_email
to_email
```
