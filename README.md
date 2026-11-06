# 💣 Desafio de Teste: Campo Minado (`desafio_teste_campo_minado`)

Repositório contendo a implementação em JavaScript e a suíte de **casos de teste automatizados (Jest)** para o jogo **Campo Minado** configurado com tabuleiro **18 x 14** e **40 bombas**.

---

## 👥 Colaborador(es)

- Vinicius Ramon Ferreira (@ViniciusRFerreira)

---

## 📋 Regras do Campo Minado (18 x 14 com 40 Bombas)

1. **Dimensões do Tabuleiro**: `18` linhas por `14` colunas, totalizando **252 células**.
2. **Bombas e Células Seguras**: Exatamente **40 bombas** distribuídas sem sobreposição e **212 células seguras** (`252 - 40`).
3. **Contagem de Adjacência**: Cada célula segura calcula quantas bombas existem nas até 8 células vizinhas (horizontais, verticais e diagonais).
4. **Abertura em Cascata (Flood Fill)**: Ao revelar uma célula com `0` bombas vizinhas, todas as células seguras adjacentes são abertas recursivamente até a borda numerada.
5. **Sistema de Bandeiras**: Permite marcar/desmarcar células suspeitas (limite de 40 bandeiras), protegendo-as contra cliques acidentais.
6. **Vitória e Derrota**:
   - Clicar em uma bomba encerra a partida como `DERROTA` e revela todas as 40 minas.
   - Revelar todas as 212 células seguras encerra a partida como `VITORIA`.

---

## 🧪 Funcionamento dos Casos de Teste (`tests/campoMinado.test.js`)

A suíte conta com **10 casos de teste** organizados em 4 categorias:

| ID | Caso de Teste | O que valida / Como funciona |
| :--- | :--- | :--- |
| **CT01** | Estrutura do tabuleiro 18x14 | Verifica se o tabuleiro possui exatamente 18 linhas, 14 colunas (252 casas), 40 bombas configuradas e 212 células seguras. |
| **CT02** | Rejeição de parâmetros fora do padrão | Garante que instanciar o jogo com dimensões diferentes de `18x14` ou número de bombas diferente de `40` lança erro. |
| **CT03** | Sorteio de 40 bombas sem sobreposição | Executa `distribuirBombasAleatoriamente(0, 0)` e confere se há exatamente 40 bombas únicas e se a primeira célula clicada é segura. |
| **CT04** | Validação de coordenadas de bombas duplicadas/incompletas | Verifica se o método determinístico rejeita listas com menos de 40 bombas ou com coordenadas repetidas. |
| **CT05** | Cálculo de bombas vizinhas (0 a 8) | Posiciona bombas ao redor da célula `(1, 1)` e verifica se `bombasVizinhas` reflete exatamente a soma das minas adjacentes. |
| **CT06** | Validação de limites do tabuleiro | Testa coordenadas negativas ou iguais/maiores que `18` (linhas) e `14` (colunas), garantindo o lançamento de erro. |
| **CT07** | Abertura em cascata (Flood Fill) | Revela uma célula com `0` bombas vizinhas e valida que dezenas de células conectadas sem bombas são abertas automaticamente. |
| **CT08** | Marcação e proteção por bandeiras | Marca uma célula com bandeira, verifica que `revelarCelula` é bloqueado, desmarca a bandeira, abre a célula e impede marcar célula já aberta. |
| **CT09** | Derrota ao acionar uma bomba | Revela uma coordenada contendo bomba, valida a transição para `DERROTA`, a revelação das 40 bombas e o bloqueio de novas jogadas. |
| **CT10** | Vitória ao abrir todas as 212 células seguras | Revela todas as células sem bomba do tabuleiro 18x14 e verifica que `celulasReveladas === 212` e `status === 'VITORIA'`. |

---

## Interface esperada pelos testes

O arquivo `src/campoMinado.js` usa `module.exports` para exportar `{ CampoMinado }`, importado nos testes com `require('../src/campoMinado')`.

- `new CampoMinado(linhas = 18, colunas = 14, bombas = 40)`: lança erro se algum valor for diferente.
- Propriedades da instância: `linhas`, `colunas`, `totalBombas`, `totalCelulasSeguras` (212), `tabuleiro` (matriz 18x14), `celulasReveladas`, `bandeirasRestantes` e `status` (`'EM_ANDAMENTO'`, `'VITORIA'` ou `'DERROTA'`).
- Cada célula do `tabuleiro` tem `temBomba`, `revelada` e `bombasVizinhas`.
- `distribuirBombasAleatoriamente(linhaSegura, colunaSegura)`: sorteia as 40 bombas, e a célula informada (opcional) nunca recebe bomba.
- `definirPosicoesBombas(lista)`: recebe 40 objetos `{ linha, coluna }` sem repetição.
- `contarBombasNoTabuleiro()`, `revelarCelula(linha, coluna)` e `alternarBandeira(linha, coluna)` (retorna `true` se ficou com bandeira e `false` se foi removida).

As mensagens de erro também são conferidas pelos testes; o texto exato esperado em cada caso está em `tests/campoMinado.test.js`.

---

## 🚀 Como Executar os Testes

```bash
# 1. Instalar as dependências (Jest)
npm install

# 2. Executar a suíte de testes
npm test
```
