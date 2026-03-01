from typing import Dict, List
import pandas as pd

import financer.dal.backtester.utils.constants as constants
from ....bl.backtester.backtestresult import BacktestResult


class Backtester:
    """Backtester class for backtesting trading strategies."""

    def __init__(
        self,
        initial_capital: float = 10000.0,
        commission_pct: float = 0.001,
        commission_fixed: float = 1.0,
    ):
        """Initialize the backtester with initial capital and commission fees."""
        self.initial_capital: float = initial_capital
        self.commission_pct: float = commission_pct
        self.commission_fixed: float = commission_fixed
        self.assets_data: Dict = {}
        self.portfolio_history: Dict = {}
        self.daily_portfolio_values: List[float] = []
        self.dates: List = []

    def execute_trade(self, asset: str, signal: int, price: float) -> None:
        """Execute a trade based on the signal and price."""
        if signal > 0 and self.assets_data[asset]["cash"] > 0:  # Buy
            trade_value = self.assets_data[asset]["cash"]
            commission = self.calculate_commission(trade_value)
            shares_to_buy = (trade_value - commission) / price
            self.assets_data[asset]["positions"] += shares_to_buy
            self.assets_data[asset]["cash"] -= trade_value
        elif signal < 0 and self.assets_data[asset]["positions"] > 0:  # Sell
            trade_value = self.assets_data[asset]["positions"] * price
            commission = self.calculate_commission(trade_value)
            self.assets_data[asset]["cash"] += trade_value - commission
            self.assets_data[asset]["positions"] = 0

    def calculate_commission(self, trade_value: float) -> float:
        """Calculate the commission fee for a trade."""
        return max(trade_value * self.commission_pct, self.commission_fixed)

    def update_portfolio(self, asset: str, price: float) -> None:
        """Update the portfolio with the latest price."""
        self.assets_data[asset]["position_value"] = (
            self.assets_data[asset]["positions"] * price
        )
        self.assets_data[asset]["total_value"] = (
            self.assets_data[asset]["cash"] + self.assets_data[asset]["position_value"]
        )
        self.portfolio_history[asset].append(self.assets_data[asset]["total_value"])

    def backtest(self, data: pd.DataFrame | dict[str, pd.DataFrame]):
        """Backtest the trading strategy using the provided data."""
        if isinstance(data, pd.DataFrame):  # Single asset
            data = {"SINGLE_ASSET": data}

        for asset in data:
            self.assets_data[asset] = {
                "cash": self.initial_capital / len(data),
                "positions": 0,
                "position_value": 0,
                "total_value": 0,
            }
            self.portfolio_history[asset] = []

            for date, row in data[asset].iterrows():
                self.execute_trade(asset, row["signal"], row["close"])
                self.update_portfolio(asset, row["close"])
                
                # Track dates
                if len(self.dates) < len(data[asset]):
                    self.dates.append(date)
                
                if len(self.daily_portfolio_values) < len(data[asset]):
                    self.daily_portfolio_values.append(
                        self.assets_data[asset]["total_value"]
                    )
                else:
                    self.daily_portfolio_values[
                        len(self.portfolio_history[asset]) - 1
                    ] += self.assets_data[asset]["total_value"]

    def calculate_performance(self) -> BacktestResult:
        """Calculate the performance of the trading strategy."""
        if not self.daily_portfolio_values:
            print("No portfolio history to calculate performance.")
            return None

        portfolio_values = pd.Series(self.daily_portfolio_values)
        daily_returns = portfolio_values.pct_change().dropna()

        # Calculate metrics
        total_return = self._calculate_total_return(
            portfolio_values.iloc[-1], self.initial_capital
        )
        annualized_return = self._calculate_annualized_return(
            total_return, len(portfolio_values)
        )
        annualized_volatility = self._calculate_annualized_volatility(daily_returns)
        sharpe_ratio = self._calculate_sharpe_ratio(annualized_return, annualized_volatility)
        sortino_ratio = self._calculate_sortino_ratio(daily_returns, annualized_return)
        max_drawdown = self._calculate_maximum_drawdown(portfolio_values)

        # Prepare graph data
        equity_curve = self._prepare_equity_curve(portfolio_values)
        drawdown_curve = self._prepare_drawdown_curve(portfolio_values)
        daily_returns_curve = self._prepare_daily_returns_curve(daily_returns)
        portfolio_values_curve = self._prepare_portfolio_values_curve(portfolio_values)

        print(f"Final Portfolio Value: {portfolio_values.iloc[-1]:.2f}")
        print(f"Total Return: {total_return * 100:.2f}%")
        print(f"Annualized Return: {annualized_return * 100:.2f}%")
        print(f"Annualized Volatility: {annualized_volatility * 100:.2f}%")
        print(f"Sharpe Ratio: {sharpe_ratio:.2f}")
        print(f"Sortino Ratio: {sortino_ratio:.2f}")
        print(f"Maximum Drawdown: {max_drawdown * 100:.2f}%")
        print(f"Equity Curve: {equity_curve[:5]}...")
        print(f"Drawdown Curve: {drawdown_curve[:5]}...")
        print(f"Daily Returns: {daily_returns_curve[:5]}...")
        print(f"Portfolio Values: {portfolio_values_curve[:5]}...")

        return BacktestResult(
            final_portfolio_value=float(portfolio_values.iloc[-1]),
            total_return=float(total_return),
            annualized_return=float(annualized_return),
            annualized_volatility=float(annualized_volatility),
            sharpe_ratio=float(sharpe_ratio),
            sortino_ratio=float(sortino_ratio),
            max_drawdown=float(max_drawdown),
            equity_curve=equity_curve,
            drawdown_curve=drawdown_curve,
            daily_returns=daily_returns_curve,
            portfolio_values=portfolio_values_curve,
        )

    def _prepare_equity_curve(self, portfolio_values: pd.Series) -> List[Dict[str, float]]:
        """Prepare equity curve data for frontend."""
        equity_curve = []
        for _, (date, value) in enumerate(zip(self.dates, portfolio_values)):
            equity_curve.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": float(value)
            })
        return equity_curve

    def _prepare_drawdown_curve(self, portfolio_values: pd.Series) -> List[Dict[str, float]]:
        """Prepare drawdown curve data for frontend."""
        running_max = portfolio_values.expanding().max()
        drawdown = (portfolio_values - running_max) / running_max
        
        drawdown_curve = []
        for _, (date, dd) in enumerate(zip(self.dates, drawdown)):
            drawdown_curve.append({
                "date": date.strftime("%Y-%m-%d"),
                "drawdown": float(dd)
            })
        return drawdown_curve

    def _prepare_daily_returns_curve(self, daily_values: pd.Series) -> List[Dict[str, float]]:
        """Prepare daily returns curve data for frontend."""
        daily_returns_curve = []
        for _, (date, value) in enumerate(zip(self.dates, daily_values)):
            daily_returns_curve.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": float(value)
            })
        return daily_returns_curve

    def _prepare_portfolio_values_curve(self, portfolio_values: pd.Series) -> List[Dict[str, float]]:
        """Prepare portfolio values curve data for frontend."""
        portfolio_values_curve = []
        for _, (date, value) in enumerate(zip(self.dates, portfolio_values)):
            portfolio_values_curve.append({
                "date": date.strftime("%Y-%m-%d"),
                "value": float(value)
            })
        return portfolio_values_curve

    # Helper calculation methods
    def _calculate_total_return(self, final_value: float, initial_capital: float) -> float:
        return (final_value - initial_capital) / initial_capital

    def _calculate_annualized_return(self, total_return: float, num_periods: int) -> float:
        return (1 + total_return) ** (constants.TRADING_DAYS_PER_YEAR / num_periods) - 1

    def _calculate_annualized_volatility(self, daily_returns: pd.Series) -> float:
        return daily_returns.std() * (constants.TRADING_DAYS_PER_YEAR ** 0.5)

    def _calculate_sharpe_ratio(self, annualized_return: float, annualized_volatility: float, risk_free_rate: float = 0.02) -> float:
        if annualized_volatility == 0:
            return 0
        return (annualized_return - risk_free_rate) / annualized_volatility

    def _calculate_sortino_ratio(self, daily_returns: pd.Series, annualized_return: float, risk_free_rate: float = 0.02) -> float:
        downside_returns = daily_returns[daily_returns < 0]
        if len(downside_returns) == 0:
            return 0
        downside_std = downside_returns.std() * (constants.TRADING_DAYS_PER_YEAR ** 0.5)
        if downside_std == 0:
            return 0
        return (annualized_return - risk_free_rate) / downside_std

    def _calculate_maximum_drawdown(self, portfolio_values: pd.Series) -> float:
        running_max = portfolio_values.expanding().max()
        drawdown = (portfolio_values - running_max) / running_max
        return float(drawdown.min())
