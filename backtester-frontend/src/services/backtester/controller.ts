import { BacktestRun, BacktestRequest } from '../../types';

const API_BASE_URL = 'http://localhost:8000/backtester';

export const backtestController = {
  async getAllBacktests(): Promise<BacktestRun[]> {
    const response = await fetch(`${API_BASE_URL}/get_all_backtests/`);
    if (!response.ok) {
      throw new Error('Failed to fetch backtests');
    }
    return response.json();
  },

  async getBacktestById(id: number): Promise<BacktestRun> {
    const response = await fetch(`${API_BASE_URL}/get_backtest/${id}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch backtest');
    }
    return response.json();
  },

  async runBacktest(data: BacktestRequest): Promise<BacktestRun> {
    const response = await fetch(`${API_BASE_URL}/run/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to run backtest');
    }
    
    return response.json();
  },

  async searchBacktests(params: {
    symbols?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<BacktestRun[]> {
    const queryParams = new URLSearchParams(
      Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]
    );
    
    const response = await fetch(`${API_BASE_URL}/search_backtests/?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to search backtests');
    }
    return response.json();
  },
};
