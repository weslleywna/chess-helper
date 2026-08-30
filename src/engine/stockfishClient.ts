export type AnalysisResult = {
  bestMove: string;
  ponderMove: string | null;
};

export const MIN_ELO = 1320;
export const MAX_ELO = 3190;

const STOCKFISH_WORKER_PATH = '/stockfish/stockfish-18-lite-single.js';

export class StockfishClient {
  private worker: Worker;
  private readyPromise: Promise<void>;
  private resolveReady!: () => void;
  private currentBestMoveResolve: ((result: AnalysisResult) => void) | null = null;
  private isAnalyzing = false;

  constructor() {
    this.worker = new Worker(STOCKFISH_WORKER_PATH);
    this.readyPromise = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
    this.worker.addEventListener('message', this.handleMessage);
    this.worker.postMessage('uci');
  }

  private handleMessage = (event: MessageEvent<string>) => {
    const line = event.data;

    if (line === 'uciok') {
      this.worker.postMessage('isready');
      return;
    }

    if (line === 'readyok') {
      this.resolveReady();
      return;
    }

    if (line.startsWith('bestmove')) {
      const parts = line.split(' ');
      const bestMove = parts[1];
      const ponderIndex = parts.indexOf('ponder');
      const ponderMove = ponderIndex !== -1 ? parts[ponderIndex + 1] : null;
      const resolve = this.currentBestMoveResolve;
      this.currentBestMoveResolve = null;
      resolve?.({ bestMove, ponderMove });
    }
  };

  private stopAndWaitIdle(): Promise<void> {
    return new Promise((resolve) => {
      this.currentBestMoveResolve = () => resolve();
      this.worker.postMessage('stop');
    });
  }

  /**
   * eloRating: null = força máxima (melhor jogada possível). Um número
   * (1320-3190) restringe o motor a jogar aproximadamente nesse nível.
   */
  async analyze(fen: string, movetimeMs: number, eloRating: number | null = null): Promise<AnalysisResult> {
    await this.readyPromise;

    if (this.isAnalyzing) {
      await this.stopAndWaitIdle();
    }

    if (eloRating) {
      this.worker.postMessage('setoption name UCI_LimitStrength value true');
      this.worker.postMessage(`setoption name UCI_Elo value ${eloRating}`);
    } else {
      this.worker.postMessage('setoption name UCI_LimitStrength value false');
    }

    this.isAnalyzing = true;
    return new Promise((resolve) => {
      this.currentBestMoveResolve = (result) => {
        this.isAnalyzing = false;
        resolve(result);
      };
      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go movetime ${movetimeMs}`);
    });
  }

  terminate() {
    this.worker.removeEventListener('message', this.handleMessage);
    this.worker.terminate();
  }
}
