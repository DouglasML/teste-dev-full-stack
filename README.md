# testeDevFullStack

Projeto full stack com frontend em React (Next.js), backend em Laravel e banco SQLite.

## Requisitos
- Node.js (LTS)
- npm (incluido com Node.js)
- PHP 8.1+ (com extensoes `pdo_sqlite`, `sqlite3`, `fileinfo` e `zip`)
- Composer
- Git
- SQLite

## Estrutura
- `src/` -> frontend (Next.js)
- `backend/` -> backend (Laravel)

## Como iniciar (passo a passo)

### Backend (Laravel)
1) Entre na pasta do backend:
   `cd backend`
2) Instale as dependencias:
   `composer install`
3) Gere a chave da aplicacao:
   `php artisan key:generate`
4) Crie o banco e os usuarios de seed:
   `php artisan migrate:fresh --seed`
5) Inicie o servidor:
   `php artisan serve`

O backend roda em `http://127.0.0.1:8000`.

### Frontend (Next.js)
1) Na raiz do projeto:
   `npm install`
2) Inicie o servidor:
   `npm run dev`

O frontend roda em `http://localhost:3000`.

## Credenciais de teste
Ao executar `php artisan migrate:fresh --seed`, estes usuarios sao criados automaticamente:
- Administrador: CPF `11111111111` / senha `senha123`
- Moderador: CPF `22222222222` / senha `senha123`
- Leitor: CPF `33333333333` / senha `senha123`

## Observacoes
- O login chama a API `POST /api/login` do Laravel.
- Se alterar o backend para outra porta, ajuste a URL no login.

## Inputs reutilizaveis (React)
- Os campos do frontend usam o componente `TextInput` para padronizar estilo e comportamento.
- Arquivo: `src/app/_components/TextInput.tsx`
