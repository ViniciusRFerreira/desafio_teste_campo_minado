/**
 * Implementação do Campo Minado (Tabuleiro 18 x 14 com 40 bombas).
 */

const LINHAS_PADRAO = 18;
const COLUNAS_PADRAO = 14;
const BOMBAS_PADRAO = 40;

class CampoMinado {
  constructor(linhas = LINHAS_PADRAO, colunas = COLUNAS_PADRAO, totalBombas = BOMBAS_PADRAO) {
    if (linhas !== 18 || colunas !== 14) {
      throw new Error('O tabuleiro do desafio deve ter exatamente as dimensões 18 x 14');
    }
    if (totalBombas !== 40) {
      throw new Error('O tabuleiro do desafio deve conter exatamente 40 bombas');
    }

    this.linhas = linhas;
    this.colunas = colunas;
    this.totalBombas = totalBombas;
    this.totalCelulasSeguras = linhas * colunas - totalBombas; // 252 - 40 = 212
    this.status = 'EM_ANDAMENTO'; // 'EM_ANDAMENTO' | 'VITORIA' | 'DERROTA'
    this.bandeirasRestantes = totalBombas;
    this.celulasReveladas = 0;
    this.tabuleiro = [];

    this._inicializarTabuleiroVazio();
  }

  _inicializarTabuleiroVazio() {
    this.tabuleiro = [];
    for (let l = 0; l < this.linhas; l++) {
      const linha = [];
      for (let c = 0; c < this.colunas; c++) {
        linha.push({
          linha: l,
          coluna: c,
          temBomba: false,
          revelada: false,
          comBandeira: false,
          bombasVizinhas: 0
        });
      }
      this.tabuleiro.push(linha);
    }
  }

  /**
   * Sorteia 40 posições únicas para as bombas e calcula a contagem das células vizinhas.
   * Opcionalmente garante que uma coordenada inicial (linhaSegura, colunaSegura) não receba bomba.
   */
  distribuirBombasAleatoriamente(linhaSegura = null, colunaSegura = null) {
    this._inicializarTabuleiroVazio();
    this.status = 'EM_ANDAMENTO';
    this.bandeirasRestantes = this.totalBombas;
    this.celulasReveladas = 0;

    let bombasColocadas = 0;
    while (bombasColocadas < this.totalBombas) {
      const l = Math.floor(Math.random() * this.linhas);
      const c = Math.floor(Math.random() * this.colunas);

      if (l === linhaSegura && c === colunaSegura) continue;
      if (!this.tabuleiro[l][c].temBomba) {
        this.tabuleiro[l][c].temBomba = true;
        bombasColocadas++;
      }
    }

    this._calcularBombasVizinhas();
  }

  /**
   * Posiciona bombas a partir de uma lista de coordenadas [{ linha, coluna }] (para testes determinísticos).
   */
  definirPosicoesBombas(listaCoordenadas) {
    if (!Array.isArray(listaCoordenadas) || listaCoordenadas.length !== this.totalBombas) {
      throw new Error(`É necessário informar exatamente ${this.totalBombas} coordenadas de bombas`);
    }

    this._inicializarTabuleiroVazio();
    this.status = 'EM_ANDAMENTO';
    this.bandeirasRestantes = this.totalBombas;
    this.celulasReveladas = 0;

    const coordenadasUnicas = new Set();
    for (const { linha, coluna } of listaCoordenadas) {
      this._validarCoordenada(linha, coluna);
      const chave = `${linha},${coluna}`;
      if (coordenadasUnicas.has(chave)) {
        throw new Error(`Coordenada de bomba duplicada: (${linha}, ${coluna})`);
      }
      coordenadasUnicas.add(chave);
      this.tabuleiro[linha][coluna].temBomba = true;
    }

    this._calcularBombasVizinhas();
  }

  _validarCoordenada(linha, coluna) {
    if (
      !Number.isInteger(linha) ||
      !Number.isInteger(coluna) ||
      linha < 0 ||
      linha >= this.linhas ||
      coluna < 0 ||
      coluna >= this.colunas
    ) {
      throw new Error(`Coordenada fora dos limites do tabuleiro 18x14: (${linha}, ${coluna})`);
    }
  }

  obterVizinhos(linha, coluna) {
    this._validarCoordenada(linha, coluna);
    const vizinhos = [];
    for (let dl = -1; dl <= 1; dl++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dl === 0 && dc === 0) continue;
        const nl = linha + dl;
        const nc = coluna + dc;
        if (nl >= 0 && nl < this.linhas && nc >= 0 && nc < this.colunas) {
          vizinhos.push(this.tabuleiro[nl][nc]);
        }
      }
    }
    return vizinhos;
  }

  _calcularBombasVizinhas() {
    for (let l = 0; l < this.linhas; l++) {
      for (let c = 0; c < this.colunas; c++) {
        if (this.tabuleiro[l][c].temBomba) {
          this.tabuleiro[l][c].bombasVizinhas = -1;
          continue;
        }
        const vizinhos = this.obterVizinhos(l, c);
        this.tabuleiro[l][c].bombasVizinhas = vizinhos.filter((v) => v.temBomba).length;
      }
    }
  }

  alternarBandeira(linha, coluna) {
    if (this.status !== 'EM_ANDAMENTO') {
      throw new Error('A partida já foi encerrada');
    }
    this._validarCoordenada(linha, coluna);
    const celula = this.tabuleiro[linha][coluna];

    if (celula.revelada) {
      throw new Error('Não é possível colocar bandeira em uma célula já revelada');
    }

    if (!celula.comBandeira) {
      if (this.bandeirasRestantes <= 0) {
        throw new Error('Limite máximo de 40 bandeiras atingido');
      }
      celula.comBandeira = true;
      this.bandeirasRestantes--;
    } else {
      celula.comBandeira = false;
      this.bandeirasRestantes++;
    }

    return celula.comBandeira;
  }

  revelarCelula(linha, coluna) {
    if (this.status !== 'EM_ANDAMENTO') {
      throw new Error('A partida já foi encerrada');
    }
    this._validarCoordenada(linha, coluna);
    const celula = this.tabuleiro[linha][coluna];

    if (celula.comBandeira) {
      throw new Error('Não é possível revelar uma célula marcada com bandeira');
    }
    if (celula.revelada) {
      return celula;
    }

    if (celula.temBomba) {
      celula.revelada = true;
      this.status = 'DERROTA';
      this._revelarTodasAsBombas();
      return celula;
    }

    this._revelarCascata(linha, coluna);

    if (this.celulasReveladas === this.totalCelulasSeguras) {
      this.status = 'VITORIA';
    }

    return celula;
  }

  _revelarCascata(linha, coluna) {
    const fila = [[linha, coluna]];

    while (fila.length > 0) {
      const [l, c] = fila.shift();
      const atual = this.tabuleiro[l][c];

      if (atual.revelada || atual.comBandeira || atual.temBomba) {
        continue;
      }

      atual.revelada = true;
      this.celulasReveladas++;

      if (atual.bombasVizinhas === 0) {
        for (const vizinho of this.obterVizinhos(l, c)) {
          if (!vizinho.revelada && !vizinho.comBandeira && !vizinho.temBomba) {
            fila.push([vizinho.linha, vizinho.coluna]);
          }
        }
      }
    }
  }

  _revelarTodasAsBombas() {
    for (let l = 0; l < this.linhas; l++) {
      for (let c = 0; c < this.colunas; c++) {
        if (this.tabuleiro[l][c].temBomba) {
          this.tabuleiro[l][c].revelada = true;
        }
      }
    }
  }

  contarBombasNoTabuleiro() {
    let total = 0;
    for (let l = 0; l < this.linhas; l++) {
      for (let c = 0; c < this.colunas; c++) {
        if (this.tabuleiro[l][c].temBomba) total++;
      }
    }
    return total;
  }
}

module.exports = {
  LINHAS_PADRAO,
  COLUNAS_PADRAO,
  BOMBAS_PADRAO,
  CampoMinado
};
