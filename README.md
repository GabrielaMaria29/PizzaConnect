# PizzaConnect - Instituto Alma Mater

Sistema de gerenciamento de vendas de pizzas pré-assadas.

## Como Iniciar o Projeto

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    Acesse: [http://localhost:9002](http://localhost:9002)

## Configuração do Firebase

Para que o login funcione corretamente:

1.  **Authentication**: Habilite o método de login por "E-mail/Senha" no Console do Firebase.
2.  **Firestore**:
    - Crie uma coleção chamada `users`.
    - Cada documento deve ter como ID o `UID` do usuário no Authentication.
    - Campos obrigatórios no documento do usuário:
        - `nome`: string
        - `email`: string
        - `role`: "admin" ou "vendedor"
        - `status`: "ativo" ou "inativo"
    - Crie uma coleção chamada `customers` para as sugestões de telefone (ou use o script de importação).

## Scripts Úteis

- **Importar Clientes da Planilha**:
  Coloque o arquivo `clientes.xlsx` na raiz e execute:
  ```bash
  npx tsx scripts/import-customers.ts
  ```

## Tecnologias Utilizadas

- **Next.js 15** (App Router)
- **Firebase** (Auth & Firestore)
- **Genkit** (IA para Insights e Resumos)
- **Tailwind CSS & Shadcn UI**
- **Lucide React** (Ícones)
