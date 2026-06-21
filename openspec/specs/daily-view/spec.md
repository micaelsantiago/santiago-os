# Daily View

Exibe uma lista cronológica de todos os dias do mês com indicadores de atividade, totais diários, saldo acumulado e expansão para ver transações do dia.

## Requirements

### Requirement: Usuário vê todos os dias do mês em lista cronológica
O sistema SHALL exibir uma lista com todos os dias do mês selecionado (1 ao último dia), em ordem crescente, cada um em uma linha com data, barra de atividade, totais de entrada/saída e saldo acumulado.

#### Scenario: Mês com transações em dias variados
- **WHEN** usuário seleciona junho de 2026, que possui transações nos dias 2, 5, 10, 15 e 20
- **THEN** o sistema exibe 30 linhas, uma por dia, com os dias 2, 5, 10, 15 e 20 mostrando valores e os demais dias exibindo "—" nas colunas de entrada e saída

#### Scenario: Mês sem transações
- **WHEN** usuário seleciona um mês sem nenhuma transação
- **THEN** o sistema exibe todos os dias do mês com "—" em entrada e saída, saldo acumulado constante e indicador cinza (neutro)

### Requirement: Cada linha de dia exibe colunas padronizadas
O sistema SHALL exibir cada dia com as colunas: Data (dia da semana abreviado + número), Barra de atividade (proporcional ao movimento), Entrada (verde ou "—"), Saída (vermelho ou "—"), Acumulado (saldo até aquele dia), Indicador (ponto colorido).

#### Scenario: Dia com apenas entradas
- **WHEN** o dia 5 tem R$ 3.000,00 em entradas e nenhuma saída
- **THEN** a linha exibe "Sex 5", barra proporcional ao valor, "R$ 3.000,00" em verde na coluna Entrada, "—" na coluna Saída, saldo acumulado atualizado e indicador verde

#### Scenario: Dia com apenas saídas
- **WHEN** o dia 10 tem R$ 150,00 em saídas e nenhuma entrada
- **THEN** a linha exibe "Qua 10", barra proporcional ao valor, "—" na coluna Entrada, "− R$ 150,00" em vermelho na coluna Saída, saldo acumulado atualizado e indicador vermelho

#### Scenario: Dia com entrada e saída
- **WHEN** o dia 15 tem R$ 500,00 em entradas e R$ 200,00 em saídas
- **THEN** a linha exibe ambos os valores e o indicador é verde (entrada prevalece)

#### Scenario: Dia sem movimentação
- **WHEN** o dia 8 não possui nenhuma transação
- **THEN** a linha exibe "—" nas colunas Entrada e Saída, saldo acumulado igual ao dia anterior e indicador cinza

### Requirement: Indicador visual reflete o estado do dia
O sistema SHALL exibir um ponto colorido ao lado de cada linha com a seguinte legenda: verde (houve entrada), vermelho (houve saída sem entrada), cinza (sem movimentação), contorno vazio (dia futuro).

#### Scenario: Dia futuro com indicador de contorno
- **WHEN** o dia 25 de junho de 2026 é futuro em relação à data atual
- **THEN** o indicador é exibido como um círculo com contorno e sem preenchimento

### Requirement: Barra de atividade é proporcional ao maior dia do mês
O sistema SHALL renderizar uma barra fina horizontal cuja largura é proporcional ao valor absoluto total do dia (entradas + saídas) em relação ao maior valor absoluto diário do mês.

#### Scenario: Dia com maior movimentação tem barra cheia
- **WHEN** o maior dia do mês tem R$ 5.000,00 em movimentação e outro dia tem R$ 2.500,00
- **THEN** a barra do dia maior ocupa 100% da largura disponível e a do outro dia ocupa 50%

#### Scenario: Dia sem movimentação não tem barra
- **WHEN** um dia não possui transações
- **THEN** a barra de atividade não é renderizada (largura zero)

### Requirement: Saldo acumulado reflete histórico completo
O sistema SHALL calcular o saldo acumulado de cada dia como o saldo do último dia do mês anterior somado às transações do mês atual até aquele dia.

#### Scenario: Primeiro dia do mês começa com saldo anterior
- **WHEN** o usuário tem saldo acumulado de R$ 2.000,00 até 31 de maio e a primeira transação de junho é uma entrada de R$ 500,00 no dia 2
- **THEN** o dia 1 exibe saldo acumulado de R$ 2.000,00 e o dia 2 exibe R$ 2.500,00

#### Scenario: Saldo inicial zero para novo usuário
- **WHEN** o usuário não possui transações anteriores ao mês selecionado
- **THEN** o saldo inicial do mês é R$ 0,00

### Requirement: Dia atual recebe destaque visual
O sistema SHALL destacar o dia atual com um badge "hoje" abaixo da data e fundo levemente destacado.

#### Scenario: Dia atual no meio do mês
- **WHEN** hoje é 21 de junho de 2026 e o usuário visualiza junho de 2026
- **THEN** a linha do dia 21 exibe o badge "hoje" e tem cor de fundo diferente das demais linhas

#### Scenario: Dia atual fora do mês selecionado
- **WHEN** hoje é 21 de junho de 2026 mas o usuário está visualizando maio de 2026
- **THEN** nenhuma linha recebe o destaque de "hoje"

### Requirement: Dias futuros têm opacidade reduzida
O sistema SHALL exibir linhas de dias posteriores à data atual com opacidade de ~45%, barra de atividade vazia e saldo acumulado congelado no valor do último dia com dados reais.

#### Scenario: Mês atual com dias futuros
- **WHEN** hoje é 21 de junho de 2026 e o usuário visualiza junho de 2026
- **THEN** os dias 22 a 30 são exibidos com opacidade 45%, sem barra de atividade, e a coluna Acumulado mostra o mesmo valor do dia 21

#### Scenario: Mês passado sem dias futuros
- **WHEN** usuário visualiza maio de 2026 e hoje é 21 de junho de 2026
- **THEN** todos os dias são exibidos com opacidade normal (100%)

### Requirement: Linha com movimentação expande ao ser clicada
O sistema SHALL expandir a linha de um dia ao ser clicada, exibindo a lista de transações daquele dia com emoji da categoria, descrição, nome da categoria e valor. Apenas uma linha pode estar expandida por vez.

#### Scenario: Expandir dia com múltiplas transações
- **WHEN** usuário clica na linha do dia 15, que tem 3 transações
- **THEN** a linha expande exibindo as 3 transações com seus respectivos emojis, descrições, categorias e valores, e a linha anteriormente expandida (se houver) é recolhida

#### Scenario: Clicar novamente recolhe a linha
- **WHEN** usuário clica em uma linha já expandida
- **THEN** a linha é recolhida e as transações do dia são ocultadas

#### Scenario: Dia sem movimentação não expande
- **WHEN** usuário clica em um dia sem transações
- **THEN** a linha não expande

### Requirement: Filtro de categoria recalcula saldo acumulado
O sistema SHALL recalcular o saldo acumulado diário e os valores de entrada/saída quando um filtro de categoria está ativo, considerando apenas transações da(s) categoria(s) selecionada(s).

#### Scenario: Filtro por categoria Alimentação
- **WHEN** usuário seleciona o filtro "Alimentação" e há transações de Alimentação nos dias 3, 8 e 20
- **THEN** a lista de dias exibe entradas e saídas apenas da categoria Alimentação, com saldo acumulado recalculado com base apenas nessas transações

#### Scenario: Remover filtro restaura visão completa
- **WHEN** usuário desmarca todos os filtros de categoria
- **THEN** a lista de dias volta a exibir todas as transações com saldo acumulado completo

### Requirement: Mês futuro exibe todos os dias como futuros
O sistema SHALL exibir todos os dias de um mês futuro com opacidade reduzida, sem dados de transação, e ocultar o bloco de previsibilidade (Bloco 3).

#### Scenario: Visualizar mês posterior ao atual
- **WHEN** usuário seleciona agosto de 2026 e hoje é junho de 2026
- **THEN** todos os dias de agosto são exibidos como futuros (opacidade 45%) e o Bloco 3 não é renderizado
