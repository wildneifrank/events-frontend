# EventFlow — Frontend

Plataforma de venda e emissão de ingressos para eventos. Este repositório contém **apenas o frontend**, totalmente navegável com **dados mockados**, e estruturado para trocar os mocks pela API Express sem alterar as páginas.

> Trabalho Prático 1 — Desenvolvimento de Software para Nuvem (UFC). O backend (Express + RDS, S3, ElastiCache, DynamoDB, SNS/SQS) é desenvolvido separadamente.

## Stack

| Camada     | Tecnologia                                              |
| ---------- | ------------------------------------------------------- |
| Build      | Vite 8                                                  |
| UI         | React 19 + TypeScript 6 (strict)                        |
| Estilo     | Tailwind CSS 4 (tokens em `src/styles/index.css`)       |
| Roteamento | React Router 7 (páginas com lazy loading)               |
| Ícones     | lucide-react                                            |
| Tipografia | Inter (`@fontsource-variable/inter`, sem CDN)           |
| Qualidade  | ESLint 10 + typescript-eslint + react-hooks, Prettier 3 |

Nenhuma biblioteca de estado, formulários ou gráficos: `useAsync`, `useForm` e os gráficos do dashboard são implementações pequenas do próprio projeto.

## Como executar

```bash
npm install
cp .env.example .env   # opcional — os valores padrão já usam os mocks
npm run dev            # http://localhost:5173
```

### Contas de demonstração

| Perfil        | E-mail                | Senha      |
| ------------- | --------------------- | ---------- |
| Cliente       | `ana@eventflow.com`   | `demo123`  |
| Administrador | `admin@eventflow.com` | `admin123` |

A tela de login mostra atalhos para preencher essas contas enquanto os mocks estão ativos.

### Roteiros de demonstração

- **Compra:** Home → Eventos → Evento → selecionar lotes → Continuar para compra → login → Checkout → Confirmar compra → Meus ingressos → Ingresso com QR code.
  O ingresso nasce como **“Em preparação”** e vira **“Válido”** ~8 s depois, simulando o worker assíncrono (SNS/SQS) que gera o PDF/QR code. As telas atualizam sozinhas.
- **Admin:** Login (admin) → Painel → Eventos → Novo evento → Publicar → Editar → Pedidos.

## Comandos

| Comando             | Descrição                                   |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                 |
| `npm run build`     | Checagem de tipos + build de produção       |
| `npm run preview`   | Serve o build de produção                   |
| `npm run typecheck` | Apenas TypeScript                           |
| `npm run lint`      | ESLint (`lint:fix` para corrigir)           |
| `npm run format`    | Prettier (`format:check` para só verificar) |

## Variáveis de ambiente

Todas são públicas (o frontend nunca guarda segredos) e lidas somente em `src/config/env.ts`.

| Variável                 | Padrão                      | Uso                                                     |
| ------------------------ | --------------------------- | ------------------------------------------------------- |
| `VITE_API_URL`           | `http://localhost:3000/api` | Base da API Express                                     |
| `VITE_USE_MOCKS`         | `true`                      | `false` passa a usar a API real                         |
| `VITE_MOCK_DELAY`        | `450`                       | Latência artificial (ms) dos mocks                      |
| `VITE_MOCK_FAILURE_RATE` | `0`                         | Probabilidade (0–1) de falha — para ver estados de erro |
| `VITE_APP_NAME`          | `EventFlow`                 | Nome do produto na interface                            |

## Estrutura

```
src/
├── app/               # App, providers e router (rotas + guards)
├── components/
│   ├── ui/            # Design system: Button, Input, Select, Modal, Tabs, Table, DatePicker…
│   ├── layout/        # Header, Footer, PublicLayout, CustomerLayout, AdminLayout, AuthLayout
│   ├── events/        # EventCard, EventBanner, BatchSelector, BannerUpload…
│   ├── tickets/       # TicketCard, TicketPass, QrCode
│   ├── checkout/      # OrderSummary, PaymentMethodSelector, PurchaseSuccess
│   └── dashboard/     # StatCard, SalesChart, RankedBars
├── pages/             # public/ auth/ customer/ admin/ — uma página por rota
├── features/          # Lógica por domínio: hooks de dados, auth, seleção do checkout, form de evento
├── hooks/             # useAsync, useForm, useDebouncedValue…
├── services/
│   ├── contracts.ts   # Interfaces dos serviços (o que as páginas conhecem)
│   ├── *.service.ts   # Escolhe mock ou HTTP conforme VITE_USE_MOCKS
│   ├── api/           # apiClient (fetch + Bearer token), implementações HTTP
│   └── mocks/         # Dados e implementações mock (persistidos no localStorage)
├── types/             # User, Event, TicketBatch, Ticket, Order, Purchase, Payment, DashboardStats…
├── constants/         # Rotas, categorias, status, filtros, marca
├── config/env.ts      # Acesso tipado às variáveis de ambiente
├── utils/             # Formatação pt-BR, validação (CPF, e-mail), regras de evento, preços
└── styles/index.css   # Tokens de cor, escala tipográfica, utilitários
```

## Mocks

- Dados em `src/services/mocks/` — `mockEvents.ts` (15 eventos: 12 publicados, 1 rascunho, 2 encerrados), `mockUsers.ts`, `mockOrders.ts` (pedidos e ingressos gerados de forma determinística), `mockDashboard.ts`.
- As datas são **relativas ao dia atual**, então a demonstração nunca fica “no passado”.
- `mockDb.ts` persiste o estado no `localStorage` (`eventflow:mock-db`): eventos criados, compras e contas sobrevivem ao recarregar. Para resetar, apague essa chave. O seed é recriado automaticamente a cada 3 dias ou quando a versão do schema muda.
- `mockServices.ts` implementa os mesmos contratos da API: filtros, paginação, ordenação, autenticação, validação de estoque (inclusive “esgotado” e limite de 10 ingressos por pedido).

## Trocando mocks pela API

As páginas nunca importam mocks. O fluxo é:

```
página → features/*/hooks → services/index.ts → events.service.ts → (mock | HTTP)
```

1. Defina `VITE_USE_MOCKS=false` e `VITE_API_URL` no `.env`.
2. Ajuste, se necessário, os caminhos em `src/services/api/httpServices.ts` — é o único arquivo que conhece os endpoints:

   | Serviço   | Endpoints esperados                                                                  |
   | --------- | ------------------------------------------------------------------------------------ |
   | Eventos   | `GET/POST /events`, `GET/PUT/DELETE /events/:id`, `GET /events/cities`               |
   | Ingressos | `GET /me/tickets?scope=`, `GET /me/tickets/:id`, `GET /tickets` (admin)              |
   | Pedidos   | `GET /orders`, `GET /orders/:id`, `POST /orders` (compra)                            |
   | Dashboard | `GET /admin/dashboard`                                                               |
   | Auth      | `POST /auth/login`, `POST /auth/register`, `GET/PATCH /auth/me`, `POST /auth/logout` |

3. As respostas devem seguir os tipos de `src/types` (listas paginadas usam `Paginated<T>`); erros devem retornar `{ "message": "..." }` com o status HTTP adequado — `apiClient` converte em `ApiError` e as telas exibem a mensagem.

Pontos já preparados para o backend:

- **S3:** `BannerUpload` hoje gera um data URL; na integração, envie o arquivo (ex.: `FormData` ou URL pré-assinada) e grave a URL retornada em `bannerUrl`. `apiClient` já aceita `FormData`.
- **SNS/SQS:** o status `processing` do ingresso e o polling (`useProcessingPoll`) já refletem o processamento assíncrono do PDF/QR code.
- **ElastiCache:** consultas frequentes (vitrine, destaques, cidades) já estão isoladas em chamadas próprias, prontas para cache no backend.
- **DynamoDB (log de CRUD):** todas as mutações passam por `eventsService` / `ordersService`, pontos únicos para o backend registrar ações.
- **Concorrência na compra:** o mock valida o estoque antes de gravar e responde `409` quando o lote esgota — o mesmo contrato esperado da transação no RDS.

## Rotas

| Público                       | Cliente (login)                  | Admin (perfil admin)                                               |
| ----------------------------- | -------------------------------- | ------------------------------------------------------------------ |
| `/`, `/events`, `/events/:id` | `/checkout/:eventId`             | `/admin`, `/admin/events`                                          |
| `/login`, `/register`         | `/my-tickets`, `/my-tickets/:id` | `/admin/events/new`, `/admin/events/:id`, `/admin/events/:id/edit` |
|                               | `/profile`                       | `/admin/tickets`, `/admin/orders`                                  |

Rotas protegidas redirecionam para `/login?redirect=…` e retornam ao destino após o login.

## Acessibilidade e UX

Labels em todos os campos, foco visível, navegação por teclado (menus, abas, calendário, diálogos nativos `<dialog>`), link “Pular para o conteúdo”, `aria-live` para toasts e estados de carregamento, tabelas com versão em cartões no mobile e `prefers-reduced-motion` respeitado. Toda página com dados tem estados de carregamento (skeleton), vazio, erro (com “Tentar novamente”) e sucesso.
