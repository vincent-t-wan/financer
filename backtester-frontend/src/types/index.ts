export interface BacktestRun {
  id: number;
  symbols: string;
  start_date: string;
  end_date: string;
  initial_capital: string;
  commission_pct: string;
  commission_fixed: string;
  strategy_config: StrategyConfig;
  final_portfolio_value: string;
  total_return: string;
  annualized_return: string;
  annualized_volatility: string;
  sharpe_ratio: string;
  sortino_ratio: string;
  max_drawdown: string;
  created_at: string;
  updated_at: string;
  status: 'pending' | 'completed' | 'failed';
  error_message: string | null;
}

export interface StrategyConfig {
  indicators: {
    [key: string]: {
      type: string;
      window: number;
    };
  };
  signal_logic: string;
}

export interface BacktestFormData {
  symbols: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  commission_pct: number;
  commission_fixed: number;
  sma_short: number;
  sma_long: number;
}

export interface BacktestRequest {
  symbols: string[];
  start_date: string;
  end_date: string;
  initial_capital: number;
  commission_pct: number;
  commission_fixed: number;
  strategy_indicators: {
    [key: string]: {
      type: string;
      window: number;
    };
  };
  signal_logic: string;
}
