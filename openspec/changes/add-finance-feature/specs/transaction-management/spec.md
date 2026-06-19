## ADDED Requirements

### Requirement: Usuário pode registrar uma transação de entrada
O sistema SHALL permitir que o usuário registre uma transação do tipo "entrada" com valor, categoria, data e descrição opcional.

#### Scenario: Cadastro de entrada com dados válidos
- **WHEN** usuário preenche valor 5000, seleciona categoria "Salário", data "2026-06-15" e envia o formulário
- **THEN** a transação é salva com type "income" e aparece na listagem com saldo atualizado

#### Scenario: Cadastro com valor zero ou negativo
- **WHEN** usuário tenta cadastrar transação com valor 0 ou negativo
- **THEN** o sistema exibe erro de validação e não salva a transação

### Requirement: Usuário pode registrar uma transação de saída
O sistema SHALL permitir que o usuário registre uma transação do tipo "saída" com valor, categoria, data e descrição opcional.

#### Scenario: Cadastro de saída com dados válidos
- **WHEN** usuário preenche valor 150, seleciona categoria "Alimentação", data "2026-06-15" e envia
- **THEN** a transação é salva com type "expense" e aparece na listagem com saldo atualizado

### Requirement: Usuário pode listar transações com paginação
O sistema SHALL exibir as transações do usuário em ordem cronológica inversa, com paginação de 20 itens por página.

#### Scenario: Listagem com transações existentes
- **WHEN** usuário acessa a página de finanças e possui 5 transações cadastradas
- **THEN** o sistema exibe as 5 transações da mais recente para a mais antiga

#### Scenario: Listagem sem transações
- **WHEN** usuário acessa a página de finanças e não possui transações cadastradas
- **THEN** o sistema exibe mensagem "Nenhuma transação encontrada" com botão para criar a primeira

### Requirement: Usuário pode excluir uma transação
O sistema SHALL permitir que o usuário exclua uma transação existente, com confirmação antes da exclusão.

#### Scenario: Exclusão confirmada
- **WHEN** usuário clica em excluir uma transação e confirma a ação
- **THEN** a transação é removida do banco e a listagem é atualizada refletindo o novo saldo

#### Scenario: Exclusão cancelada
- **WHEN** usuário clica em excluir uma transação mas cancela na confirmação
- **THEN** a transação permanece inalterada na listagem

### Requirement: Usuário pode filtrar transações por período
O sistema SHALL permitir filtrar transações por mês e ano, com o mês atual como padrão.

#### Scenario: Filtro por mês específico
- **WHEN** usuário seleciona o mês "Março 2026" no filtro de período
- **THEN** a listagem exibe apenas transações com data em março de 2026

#### Scenario: Filtro padrão ao acessar a página
- **WHEN** usuário acessa a página de finanças pela primeira vez
- **THEN** o filtro de período está pré-selecionado com o mês atual

### Requirement: Usuário pode filtrar transações por categoria
O sistema SHALL permitir filtrar transações por uma ou mais categorias.

#### Scenario: Filtro por categoria única
- **WHEN** usuário seleciona a categoria "Alimentação" no filtro
- **THEN** a listagem exibe apenas transações da categoria "Alimentação"

#### Scenario: Filtro combinado com período
- **WHEN** usuário seleciona categoria "Transporte" e mês "Junho 2026"
- **THEN** a listagem exibe apenas transações de Transporte em junho de 2026

### Requirement: Transações são isoladas por usuário
O sistema SHALL garantir que cada usuário veja apenas suas próprias transações via Row Level Security.

#### Scenario: Usuário tenta acessar transações de outro usuário
- **WHEN** usuário A consulta transações via API
- **THEN** o Supabase retorna apenas transações onde `user_id` é igual ao `auth.uid()` de A

### Requirement: Cálculo de saldo é sempre atualizado
O sistema SHALL exibir o saldo calculado a partir das transações existentes no momento da consulta, sem cache obsoleto.

#### Scenario: Saldo reflete exclusão recente
- **WHEN** usuário exclui uma transação de saída de R$ 200
- **THEN** o saldo exibido aumenta em R$ 200 imediatamente após a exclusão
