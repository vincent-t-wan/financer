from dataclasses import dataclass
from typing import Dict, List

@dataclass
class BacktestResult:
    final_portfolio_value: float
    total_return: float
    annualized_return: float
    annualized_volatility: float
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float

    # Graph data
    equity_curve: List[Dict[str, float]]  # [{"date": timestamp, "value": float}]
    drawdown_curve: List[Dict[str, float]]  # [{"date": timestamp, "drawdown": float}]
    daily_returns: List[float]  # List of daily returns
    portfolio_values: List[float]  # Raw portfolio values
