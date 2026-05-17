# 🎓 AprendeMais

Uma plataforma inclusiva de aprendizado criada especialmente para pessoas com TEA (Transtorno do Espectro Autista), focada no ensino de alfabetização e leitura de forma interativa e gamificada.

## 📋 Sobre o Projeto

O **AprendeMais** é uma aplicação web educacional que oferece:

- **Módulos de Aprendizado Interativos**: Descobrindo as Letras, Sons e Palavras, e Primeiras Palavras
- **Sistema de Gamificação**: Pontos, níveis e conquistas (badges) para motivar o aprendizado
- **Atividades Dinâmicas**: Jogos interativos que adaptam o conteúdo conforme o progresso
- **Acompanhamento de Progresso**: Visualização detalhada do desempenho e tempo de estudo

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca de interface
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes UI baseados em Radix UI
- **Lucide React** - Ícones

### Backend & Banco de Dados
- **Supabase** - Backend as a Service (BaaS)
  - PostgreSQL como banco de dados
  - Autenticação de usuários
  - Server Actions

### Outras Ferramentas
- **Web Speech API** - Síntese de voz para leitura de textos
- **Session Storage** - Persistência de estado do cliente

## 📁 Estrutura do Projeto

```
PI_Grupo_35/
├── src/
│   ├── actions/                # Server Actions (lógica do servidor)
│   │   ├── activity.js
│   │   ├── progress.js
│   │   ├── student.js
│   │   ├── auth-confirm.js
│   │   └── ...
│   ├── app/                    # Rotas e páginas (Next.js App Router)
│   │   ├── (auth)/            # Route group para rotas autenticadas
│   │   │   ├── activity/      # Página de atividades
│   │   │   ├── admin/         # Painel administrativo
│   │   │   ├── home/          # Página inicial
│   │   │   ├── progress/      # Página de progresso
│   │   │   ├── questionnaire/ # Questionário de interesses
│   │   │   └── support/       # Página de suporte
│   │   ├── api/               # API Routes
│   │   ├── fonts/             # Fontes locais (Geist)
│   │   ├── layout.jsx         # Layout raiz
│   │   └── page.jsx           # Página inicial (login)
│   ├── components/
│   │   ├── pages/             # Componentes específicos de páginas
│   │   │   ├── activity.jsx
│   │   │   ├── home.jsx
│   │   │   ├── login.jsx
│   │   │   └── ...
│   │   └── ui/               # Componentes UI reutilizáveis (Shadcn)
│   ├── contexts/              # Context API (UserContext)
│   └── lib/
│       └── supabase/          # Configuração do Supabase
│           ├── admin.js
│           ├── client.js
│           ├── server.js
│           └── middleware.js
├── supabase/
│   └── migrations/            # Scripts SQL
│       ├── 20260517000001_create_initial_schema.sql
│       └── 20260517000002_seed_initial_data.sql
└── package.json
```

## 🚀 Como Rodar o Projeto

### Pré-requisitos

- **Node.js** 18+ instalado
- **npm** ou **yarn** ou **pnpm**
- Conta no **Supabase** (gratuita)

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd PI_Grupo_35
```

### 2. Instale as Dependências

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### 3. Configure o Supabase

#### 3.1. Crie um Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta (se não tiver)
3. Crie um novo projeto
4. Anote as credenciais:
   - **Project URL**
   - **Anon/Public Key**
   - **Service Role Key** (em Settings > API)

#### 3.2. Configure as Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
DATABASE_URL=sua-connection-string-postgresql
```

> **DATABASE_URL**: em **Project Settings → Database → Connection string** (modo URI).

As migrations em `supabase/migrations/` rodam automaticamente ao iniciar o projeto (`npm run dev`). Para aplicar manualmente: `npm run migrate`.

### 4. Execute o Projeto

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000)

## 📚 Funcionalidades Principais

### Para Estudantes

1. **Cadastro e Login**
   - Criação de conta simples
   - Questionário de interesses (opcional)
   - Cadastro de informações pessoais (opcional)

2. **Módulos de Aprendizado**
   - **Descobrindo as Letras**: Aprenda o alfabeto (Letra A, Letra B, etc.)
   - **Sons e Palavras**: Identifique sons das letras (Som M, Som P, etc.)
   - **Primeiras Palavras**: Palavras com 2 e 3 letras

3. **Sistema de Pontos e Níveis**
   - Ganhe pontos ao completar atividades
   - Suba de nível a cada 100 pontos
   - Visualize seu progresso em tempo real

4. **Conquistas (Badges)**
   - Badges específicos para cada atividade completada
   - Badges de marcos (primeira atividade, módulo completo, etc.)

5. **Acompanhamento**
   - Visualização de progresso por módulo
   - Histórico de atividades completadas
   - Tempo de estudo registrado

### Para Administradores

1. **Painel Administrativo** (`/admin`)
   - Dashboard com acesso às principais funcionalidades administrativas
   - Gerenciamento de módulos de aprendizado
   - Gerenciamento de disciplinas
   - Visualização de histórico acadêmico

> ⚠️ **Nota**: O painel administrativo está **incompleto**. As funcionalidades de gerenciamento de cadastros de estudantes e matrículas ainda não foram totalmente implementadas. A interface está disponível, mas algumas funcionalidades podem estar limitadas ou em desenvolvimento.

## 🎮 Como Usar

### Primeiro Acesso

1. Acesse a página inicial
2. Clique em "Criar Conta"
3. Preencha nome, email e senha
4. Complete o questionário de interesses (opcional)
5. Comece a aprender!

### Completando uma Atividade

1. Selecione um módulo na página inicial
2. Escolha uma atividade
3. Leia as instruções
4. Clique nos itens corretos
5. Clique em "Verificar Respostas"
6. Veja seus pontos e conquistas!

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Produção
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção
```

## 📝 Licença

Este projeto foi desenvolvido como parte de um Projeto Integrador (PI).

## 👥 Contribuidores

Grupo 35 - Projeto Integrador







