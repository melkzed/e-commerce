# Melkzedek Store Platform

Plataforma para clientes pedirem uma loja online com login, perfil, pedido guiado, resumo simples, envio por EmailJS e painel admin.

## Paginas

- `/`: apresentacao da plataforma com tema escuro, imagens e rede neural visual.
- `/orcamento`: pedido guiado com 5 perguntas simples.
- `/perfil`: dados do cliente, liberado apenas depois do login.
- `/assinaturas`: os 3 planos, sem preco publico.
- `/admin`: painel de pedidos liberado apenas para `melkzedd@gmail.com`.

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

## Variaveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_CLIENT_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_ADMIN_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=
```

Sem essas variaveis, Supabase, login e EmailJS ficam sinalizados como pendentes.

## Supabase

1. Crie o projeto no Supabase.
2. Rode o SQL de `supabase/schema.sql` no SQL Editor.
3. Ative Google em Authentication > Providers.
4. Configure as URLs de redirect do Google/Supabase para `http://127.0.0.1:3000` e a URL de producao.

Tabelas criadas:

- `profiles`: dados do cliente, documento e empresa.
- `quote_requests`: solicitacoes de orcamento, respostas e status.

O painel admin libera a lista completa para `melkzedd@gmail.com`.

## EmailJS

Crie um service e dois templates:

- Template do cliente: confirmacao do pedido.
- Template do admin: nova solicitacao recebida.

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
admin_email
to_email
```
