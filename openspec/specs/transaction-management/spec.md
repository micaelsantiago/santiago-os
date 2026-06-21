# Transaction Management

Gerencia o ciclo de vida das transações financeiras: criação, listagem, filtros e exclusão.

## Requirements

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

### Requirement: Usuário pode listar transações do mês completo
O sistema SHALL exibir todas as transações do mês selecionado sem paginação, carregadas em uma única consulta. A listagem é apresentada agrupada por dia na visão diária, com a possibilidade de expandir cada dia para ver as transações individuais.

#### Scenario: Listagem com transações existentes
- **WHEN** usuário acessa a página de finanças e possui 45 transações no mês
- **THEN** o sistema carrega todas as 45 transações de uma vez e as exibe agrupadas por dia na lista de dias

#### Scenario: Listagem sem transações
- **WHEN** usuário acessa a página de finanças e não possui transações cadastradas no mês
- **THEN** o sistema exibe a lista de dias com todos os dias sem atividade e indicador cinza

### Requirement: Usuário pode excluir uma transação
O sistema SHALL permitir que o usuário exclua uma transação existente, com confirmação antes da exclusão.

#### Scenario: Exclusão confirmada
- **WHEN** usuário clica em excluir uma transação e confirma a ação
- **THEN** a transação é removida do banco e a listagem é atualizada refletindo o novo saldo

#### Scenario: Exclusão cancelada
- **WHEN** usuário clica em excluir uma transação mas cancela na confirmação
- **THEN** a transação permanece inalterada na listagem

### Requirement: Usuário pode filtrar transações por período
O sistema SHALL permitir filtrar transações por mês e ano, com o mês atual como padrão. O filtro de período afeta tanto os cards de resumo mensal quanto a lista de dias.

#### Scenario: Filtro por mês específico
- **WHEN** usuário seleciona o mês "Março 2026" no seletor de mês/ano
- **THEN** a lista de dias exibe apenas os dias de março de 2026 com suas respectivas transações e os cards de resumo refletem os totais de março

#### Scenario: Filtro padrão ao acessar a página
- **WHEN** usuário acessa a página de finanças pela primeira vez
- **THEN** o seletor de mês/ano está pré-selecionado com o mês atual

### Requirement: Usuário pode filtrar transações por categoria
O sistema SHALL permitir filtrar transações por uma ou mais categorias, recalculando o saldo acumulado da lista de dias e os cards de resumo.

#### Scenario: Filtro por categoria única
- **WHEN** usuário seleciona a categoria "Alimentação" nos chips de filtro
- **THEN** a lista de dias exibe apenas transações da categoria "Alimentação" agrupadas por dia e o saldo acumulado é recalculado

#### Scenario: Filtro combinado com período
- **WHEN** usuário seleciona categoria "Transporte" e mês "Junho 2026"
- **THEN** a lista de dias exibe apenas transações de Transporte em junho de 2026

### Requirement: Transações são isoladas por usuário
O sistema SHALL garantir que cada usuário veja apenas suas próprias transações via Row Level Security.

#### Scenario: Usuário tenta acessar transações de outro usuário
- **WHEN** usuário A consulta transações via API
- **THEN** o Supabase retorna apenas transações onde `user_id` é igual ao `auth.uid()` de A

### Requirement: Cálculo de saldo é sempre atualizado
O sistema SHALL exibir o saldo calculado a partir das transações existentes no momento da consulta, sem cache obsoleto. O saldo é calculado considerando o histórico completo para o saldo acumulado diário.

#### Scenario: Saldo reflete exclusão recente
- **WHEN** usuário exclui uma transação de saída de R$ 200
- **THEN** o saldo acumulado de todos os dias a partir da data da transação excluída é atualizado imediatamente

#### Scenario: Saldo reflete nova transação
- **WHEN** usuário cadastra uma nova transação
- **THEN** a lista de dias e os cards de resumo são recarregados refletindo a nova transação
