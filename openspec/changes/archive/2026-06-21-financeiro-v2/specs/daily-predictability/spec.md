## ADDED Requirements

### Requirement: Card "Disponível por dia" exibe margem diária
O sistema SHALL exibir um card mostrando o valor disponível por dia, calculado como `(saldo_historico_total − soma_gastos_fixos_futuros) ÷ dias_restantes_no_mês`, com o número de dias restantes no mês.

#### Scenario: Saldo positivo com gastos fixos futuros
- **WHEN** usuário tem saldo histórico de R$ 3.000,00, gastos fixos futuros de R$ 850,00 e faltam 10 dias para o fim do mês
- **THEN** o card exibe "R$ 215,00" como valor disponível por dia e "10 dias restantes no mês"

#### Scenario: Saldo positivo sem gastos fixos futuros
- **WHEN** usuário tem saldo histórico de R$ 5.000,00, sem gastos fixos futuros e faltam 15 dias
- **THEN** o card exibe "R$ 333,33" e "15 dias restantes no mês"

#### Scenario: Margem diária negativa
- **WHEN** o cálculo da margem diária resulta em valor negativo
- **THEN** o valor é exibido em vermelho com indicador visual de alerta

#### Scenario: Saldo zerado
- **WHEN** usuário tem saldo de R$ 0,00 e sem gastos fixos futuros
- **THEN** o card exibe "R$ 0,00" e o número de dias restantes

### Requirement: Card "Gastos fixos restantes" lista despesas recorrentes futuras
O sistema SHALL exibir um card com o total de gastos fixos restantes no mês e a lista das transações recorrentes ativas com data futura dentro do mês, mostrando nome da recorrência e dia previsto.

#### Scenario: Múltiplos gastos fixos restantes
- **WHEN** há 2 transações recorrentes futuras: Moradia (dia 25, R$ 800,00) e Assinatura (dia 28, R$ 50,00)
- **THEN** o card exibe total "− R$ 850,00" e lista "Moradia (dia 25) · Assinatura (dia 28)"

#### Scenario: Mais de 3 itens truncados
- **WHEN** há 5 transações recorrentes futuras
- **THEN** o card exibe os 3 primeiros itens separados por "·" seguido de "+ 2 outros"

#### Scenario: Nenhum gasto fixo restante
- **WHEN** não há transações recorrentes futuras no mês
- **THEN** o card exibe "− R$ 0,00" e texto "Nenhum gasto fixo restante"

### Requirement: Bloco de previsibilidade é oculto em meses passados e futuros
O sistema SHALL ocultar os cards de previsibilidade (Bloco 3) quando o mês selecionado for passado ou futuro em relação ao mês atual.

#### Scenario: Mês passado não exibe previsibilidade
- **WHEN** usuário seleciona maio de 2026 e hoje é junho de 2026
- **THEN** os cards "Disponível por dia" e "Gastos fixos restantes" não são renderizados

#### Scenario: Mês futuro não exibe previsibilidade
- **WHEN** usuário seleciona agosto de 2026 e hoje é junho de 2026
- **THEN** os cards de previsibilidade não são renderizados

### Requirement: Cálculo usa saldo histórico total
O sistema SHALL usar o saldo histórico completo (todas as transações desde sempre até hoje) como base para o cálculo da margem diária, não apenas o saldo do mês atual.

#### Scenario: Saldo histórico difere do saldo mensal
- **WHEN** usuário tem R$ 10.000,00 de saldo histórico mas apenas R$ 1.000,00 de saldo no mês atual
- **THEN** o cálculo da margem diária usa R$ 10.000,00 como base

### Requirement: Transações recorrentes não lançadas não afetam saldo da lista de dias
O sistema SHALL garantir que transações recorrentes ainda não lançadas não apareçam na lista de dias (Bloco 4), apenas nos cards de previsibilidade (Bloco 3).

#### Scenario: Recorrência futura visível apenas na previsibilidade
- **WHEN** existe uma transação recorrente "Aluguel" prevista para o dia 25, ainda não lançada
- **THEN** o dia 25 na lista de dias não mostra o Aluguel, mas o card "Gastos fixos restantes" o inclui

### Requirement: Cards de previsibilidade são responsivos
O sistema SHALL exibir os dois cards lado a lado em desktop e empilhados em mobile.

#### Scenario: Layout desktop
- **WHEN** viewport tem largura >= 768px
- **THEN** os dois cards são exibidos lado a lado com mesma largura

#### Scenario: Layout mobile
- **WHEN** viewport tem largura < 768px
- **THEN** os cards são exibidos empilhados verticalmente
