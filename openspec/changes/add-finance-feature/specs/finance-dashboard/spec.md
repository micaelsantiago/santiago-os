## ADDED Requirements

### Requirement: Dashboard exibe saldo atual
O sistema SHALL exibir o saldo atual do usuário calculado como total de entradas menos total de saídas de todas as transações.

#### Scenario: Saldo positivo
- **WHEN** usuário tem R$ 5000 em entradas e R$ 2300 em saídas
- **THEN** o dashboard exibe saldo de R$ 2700 com indicação visual positiva (verde)

#### Scenario: Saldo negativo
- **WHEN** usuário tem R$ 1000 em entradas e R$ 1500 em saídas
- **THEN** o dashboard exibe saldo de -R$ 500 com indicação visual negativa (vermelho)

#### Scenario: Saldo zero
- **WHEN** usuário não possui transações cadastradas
- **THEN** o dashboard exibe saldo de R$ 0,00 com indicação neutra

### Requirement: Dashboard exibe total de entradas e saídas
O sistema SHALL exibir separadamente o total acumulado de entradas e o total acumulado de saídas, considerando o período filtrado.

#### Scenario: Totais do mês atual
- **WHEN** usuário acessa o dashboard com filtro de período no mês atual e tem 3 entradas totalizando R$ 6000 e 4 saídas totalizando R$ 3200
- **THEN** o sistema exibe "Entradas: R$ 6.000,00" e "Saídas: R$ 3.200,00"

#### Scenario: Totais zerados sem transações no período
- **WHEN** usuário filtra por um mês sem transações
- **THEN** o sistema exibe "Entradas: R$ 0,00" e "Saídas: R$ 0,00"

### Requirement: Dashboard exibe resumo mensal por categoria
O sistema SHALL exibir um resumo visual do mês atual agrupando transações por categoria, com valor total e percentual em relação ao total de saídas.

#### Scenario: Resumo mensal com múltiplas categorias
- **WHEN** usuário tem saídas no mês: Alimentação R$ 800 (40%), Transporte R$ 600 (30%), Lazer R$ 400 (20%), Outros R$ 200 (10%)
- **THEN** o dashboard exibe 4 barras de progresso, uma para cada categoria, com nome, valor, percentual e cor da categoria

#### Scenario: Resumo mensal sem transações
- **WHEN** usuário acessa o dashboard e não há transações no mês atual
- **THEN** o sistema exibe mensagem "Nenhuma movimentação neste mês"

### Requirement: Indicador de período ativo
O sistema SHALL exibir claramente qual período (mês/ano) está sendo visualizado nos cards de totais e resumo.

#### Scenario: Indicador de mês atual
- **WHEN** usuário acessa o dashboard pela primeira vez
- **THEN** o cabeçalho dos cards exibe "Junho 2026" (mês atual por extenso)

#### Scenario: Indicador de mês filtrado
- **WHEN** usuário altera o filtro para "Março 2026"
- **THEN** o cabeçalho dos cards atualiza para "Março 2026" e os valores são recalculados

### Requirement: Navegação rápida para nova transação
O sistema SHALL exibir um botão de ação principal ("Nova transação") visível no dashboard que direciona para o formulário de cadastro.

#### Scenario: Clicar em nova transação
- **WHEN** usuário clica no botão "Nova transação" no dashboard
- **THEN** o sistema navega para `/financas/nova`

### Requirement: Dashboard é acessível sem scroll excessivo
O sistema SHALL organizar os cards do dashboard em layout responsivo: cards de totais lado a lado em desktop, empilhados em mobile. O resumo mensal ocupa a largura total.

#### Scenario: Layout em desktop
- **WHEN** usuário acessa o dashboard em tela com largura >= 1024px
- **THEN** os 3 cards (Saldo, Entradas, Saídas) são exibidos lado a lado e o resumo mensal abaixo

#### Scenario: Layout em mobile
- **WHEN** usuário acessa o dashboard em tela com largura < 768px
- **THEN** os cards são exibidos empilhados verticalmente e o resumo mensal abaixo
