const { CampoMinado } = require('../src/campoMinado');

/**
 * Função auxiliar para gerar 40 coordenadas determinísticas para testes controlados.
 * Preenche a partir das últimas linhas do tabuleiro (linhas 15, 16 e 17).
 */
function gerar40BombasNoFundo(bombasCustomizadas = []) {
  // Inclui parede de bombas em (0,12), (1,12) e (1,13) isolando a célula segura (0,13)
  const base = [
    ...bombasCustomizadas,
    { linha: 0, coluna: 12 },
    { linha: 1, coluna: 12 },
    { linha: 1, coluna: 13 }
  ];
  const coordenadas = [];
  const usadas = new Set();

  for (const b of base) {
    const chave = `${b.linha},${b.coluna}`;
    if (!usadas.has(chave)) {
      coordenadas.push(b);
      usadas.add(chave);
    }
  }

  for (let l = 17; l >= 0 && coordenadas.length < 40; l--) {
    for (let c = 13; c >= 0 && coordenadas.length < 40; c--) {
      const chave = `${l},${c}`;
      if (!usadas.has(chave)) {
        coordenadas.push({ linha: l, coluna: c });
        usadas.add(chave);
      }
    }
  }
  return coordenadas;
}

describe('Campo Minado (Tabuleiro 18 x 14 com 40 Bombas) - Suíte de Casos de Teste', () => {
  describe('1. Inicialização e Regras de Dimensão (18 x 14 e 40 Bombas)', () => {
    test('CT01 - Deve criar o tabuleiro exatamente com 18 linhas, 14 colunas (252 células) e 212 células seguras', () => {
      const jogo = new CampoMinado();
      expect(jogo.linhas).toBe(18);
      expect(jogo.colunas).toBe(14);
      expect(jogo.totalBombas).toBe(40);
      expect(jogo.tabuleiro).toHaveLength(18);
      expect(jogo.tabuleiro[0]).toHaveLength(14);
      expect(jogo.totalCelulasSeguras).toBe(212);
    });

    test('CT02 - Deve rejeitar dimensões diferentes de 18x14 ou quantidade de bombas diferente de 40', () => {
      expect(() => new CampoMinado(10, 10, 40)).toThrow(
        'O tabuleiro do desafio deve ter exatamente as dimensões 18 x 14'
      );
      expect(() => new CampoMinado(18, 14, 35)).toThrow(
        'O tabuleiro do desafio deve conter exatamente 40 bombas'
      );
    });

    test('CT03 - Deve distribuir aleatoriamente exatamente 40 bombas sem sobreposição e respeitar a casa inicial segura', () => {
      const jogo = new CampoMinado();
      jogo.distribuirBombasAleatoriamente(0, 0);

      expect(jogo.contarBombasNoTabuleiro()).toBe(40);
      expect(jogo.tabuleiro[0][0].temBomba).toBe(false);
    });

    test('CT04 - Deve rejeitar lista determinística de bombas com menos de 40 posições ou com posições duplicadas', () => {
      const jogo = new CampoMinado();
      expect(() => jogo.definirPosicoesBombas([{ linha: 0, coluna: 0 }])).toThrow(
        'É necessário informar exatamente 40 coordenadas de bombas'
      );

      const duplicadas = gerar40BombasNoFundo();
      duplicadas[1] = { ...duplicadas[0] };
      expect(() => jogo.definirPosicoesBombas(duplicadas)).toThrow('Coordenada de bomba duplicada');
    });
  });

  describe('2. Cálculo de Bombas Vizinhas e Limites do Tabuleiro', () => {
    test('CT05 - Deve calcular corretamente a quantidade de bombas adjacentes (0 a 8) em torno de cada célula', () => {
      const jogo = new CampoMinado();
      // Coloca 3 bombas ao redor da célula (1, 1): em (0, 0), (0, 1) e (0, 2)
      const bombas = gerar40BombasNoFundo([
        { linha: 0, coluna: 0 },
        { linha: 0, coluna: 1 },
        { linha: 0, coluna: 2 }
      ]);
      jogo.definirPosicoesBombas(bombas);

      expect(jogo.tabuleiro[1][1].bombasVizinhas).toBe(3);
      expect(jogo.tabuleiro[1][0].bombasVizinhas).toBe(2);
      expect(jogo.tabuleiro[5][5].bombasVizinhas).toBe(0);
    });

    test('CT06 - Deve lançar erro ao tentar acessar coordenadas fora dos limites de 18x14', () => {
      const jogo = new CampoMinado();
      jogo.distribuirBombasAleatoriamente();

      expect(() => jogo.revelarCelula(-1, 0)).toThrow('Coordenada fora dos limites do tabuleiro 18x14');
      expect(() => jogo.revelarCelula(18, 0)).toThrow('Coordenada fora dos limites do tabuleiro 18x14');
      expect(() => jogo.revelarCelula(0, 14)).toThrow('Coordenada fora dos limites do tabuleiro 18x14');
      expect(() => jogo.alternarBandeira(5, -2)).toThrow('Coordenada fora dos limites do tabuleiro 18x14');
    });
  });

  describe('3. Abertura de Células, Flood Fill (Cascata) e Bandeiras', () => {
    test('CT07 - Ao revelar uma célula vazia (0 bombas vizinhas), deve abrir em cascata (Flood Fill) todas as células vazias conectadas e suas bordas numeradas', () => {
      const jogo = new CampoMinado();
      // Todas as 40 bombas estão concentradas no fundo (linhas 15, 16 e 17)
      jogo.definirPosicoesBombas(gerar40BombasNoFundo());

      jogo.revelarCelula(0, 0);

      // Como as linhas 0 a 13 não têm bombas, a cascata deve abrir uma grande região segura automaticamente
      expect(jogo.tabuleiro[0][0].revelada).toBe(true);
      expect(jogo.celulasReveladas).toBeGreaterThan(150);
      expect(jogo.status).toBe('EM_ANDAMENTO');
    });

    test('CT08 - Deve permitir marcar e desmarcar bandeiras, bloquear clique em célula com bandeira e impedir marcar célula já revelada', () => {
      const jogo = new CampoMinado();
      jogo.definirPosicoesBombas(gerar40BombasNoFundo());

      // Marca bandeira na célula (0, 0)
      expect(jogo.alternarBandeira(0, 0)).toBe(true);
      expect(jogo.bandeirasRestantes).toBe(39);

      // Tentar revelar célula com bandeira deve lançar erro de proteção
      expect(() => jogo.revelarCelula(0, 0)).toThrow(
        'Não é possível revelar uma célula marcada com bandeira'
      );

      // Remove a bandeira e revela a célula
      expect(jogo.alternarBandeira(0, 0)).toBe(false);
      expect(jogo.bandeirasRestantes).toBe(40);
      jogo.revelarCelula(0, 0);

      // Não pode colocar bandeira em célula já revelada
      expect(() => jogo.alternarBandeira(0, 0)).toThrow(
        'Não é possível colocar bandeira em uma célula já revelada'
      );
    });
  });

  describe('4. Condições de Derrota (Explosão) e Vitória (212 Células Seguras)', () => {
    test('CT09 - Ao revelar uma célula com bomba, deve alterar o status para DERROTA e revelar todas as 40 bombas', () => {
      const jogo = new CampoMinado();
      jogo.definirPosicoesBombas(gerar40BombasNoFundo([{ linha: 2, coluna: 3 }]));

      jogo.revelarCelula(2, 3);
      expect(jogo.status).toBe('DERROTA');

      // Verifica se todas as 40 bombas ficaram visíveis
      let bombasReveladas = 0;
      for (let l = 0; l < jogo.linhas; l++) {
        for (let c = 0; c < jogo.colunas; c++) {
          if (jogo.tabuleiro[l][c].temBomba && jogo.tabuleiro[l][c].revelada) {
            bombasReveladas++;
          }
        }
      }
      expect(bombasReveladas).toBe(40);
      expect(() => jogo.revelarCelula(0, 0)).toThrow('A partida já foi encerrada');
    });

    test('CT10 - Ao revelar todas as 212 células seguras sem explodir nenhuma das 40 bombas, deve declarar VITORIA', () => {
      const jogo = new CampoMinado();
      jogo.definirPosicoesBombas(gerar40BombasNoFundo());

      for (let l = 0; l < jogo.linhas; l++) {
        for (let c = 0; c < jogo.colunas; c++) {
          if (!jogo.tabuleiro[l][c].temBomba && !jogo.tabuleiro[l][c].revelada) {
            jogo.revelarCelula(l, c);
          }
        }
      }

      expect(jogo.celulasReveladas).toBe(212);
      expect(jogo.status).toBe('VITORIA');
    });
  });
});
