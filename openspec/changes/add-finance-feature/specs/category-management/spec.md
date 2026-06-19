## ADDED Requirements

### Requirement: Categorias padrão são criadas para novos usuários
O sistema SHALL criar automaticamente um conjunto de categorias padrão para cada novo usuário registrado.

#### Scenario: Novo usuário acessa categorias pela primeira vez
- **WHEN** um usuário recém-registrado acessa a página de categorias
- **THEN** o sistema exibe as categorias padrão: Salário, Freela, Moradia, Alimentação, Transporte, Saúde, Educação, Lazer, Assinaturas e Outros

#### Scenario: Categorias padrão têm ícones e cores
- **WHEN** categorias padrão são exibidas
- **THEN** cada categoria possui um emoji representativo e uma cor distinta (ex: 🍔 Alimentação com cor laranja, 🚗 Transporte com cor azul)

### Requirement: Usuário pode criar nova categoria
O sistema SHALL permitir que o usuário crie categorias personalizadas com nome, emoji e cor.

#### Scenario: Criação de categoria com dados válidos
- **WHEN** usuário preenche nome "Investimentos", seleciona emoji "📈" e cor verde, e confirma
- **THEN** a categoria é salva e aparece na lista de categorias disponíveis para transações

#### Scenario: Criação com nome duplicado
- **WHEN** usuário tenta criar uma categoria com nome já existente
- **THEN** o sistema exibe erro informando que o nome já está em uso

### Requirement: Usuário pode editar uma categoria existente
O sistema SHALL permitir que o usuário altere nome, emoji ou cor de uma categoria existente.

#### Scenario: Edição de nome de categoria
- **WHEN** usuário edita "Alimentação" para "Alimentação e Bebidas" e confirma
- **THEN** o nome da categoria é atualizado em todas as transações que a referenciam

### Requirement: Usuário pode excluir uma categoria
O sistema SHALL permitir que o usuário exclua uma categoria. Transações associadas devem ter a referência removida (SET NULL).

#### Scenario: Exclusão de categoria sem transações
- **WHEN** usuário exclui uma categoria que não está associada a nenhuma transação
- **THEN** a categoria é removida permanentemente

#### Scenario: Exclusão de categoria com transações associadas
- **WHEN** usuário exclui uma categoria que está associada a transações
- **THEN** a categoria é removida e as transações afetadas ficam sem categoria (exibidas como "Sem categoria")

### Requirement: Categorias são isoladas por usuário
O sistema SHALL garantir que cada usuário veja e gerencie apenas suas próprias categorias via RLS.

#### Scenario: Usuário tenta acessar categorias de outro usuário
- **WHEN** usuário A consulta categorias via API
- **THEN** o Supabase retorna apenas categorias onde `user_id` é igual ao `auth.uid()` de A

### Requirement: Lista de categorias disponível no formulário de transação
O sistema SHALL exibir a lista de categorias do usuário como opções selecionáveis no formulário de nova transação.

#### Scenario: Selecionar categoria ao criar transação
- **WHEN** usuário abre o formulário de nova transação
- **THEN** o campo de categoria exibe todas as categorias do usuário com seus respectivos emojis e cores
