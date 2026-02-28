from financer.bl.backtester.backtestresult import BacktestResult

from ...models import BacktestRun, Trade
from django.db.models import Q


class BacktesterDAL:
    @staticmethod
    def get_all_backtest_runs():
        """Get all backtest runs"""
        return BacktestRun.objects.all()

    @staticmethod
    def get_backtest_by_id(backtest_id):
        """Get a specific backtest run by ID"""
        try:
            return BacktestRun.objects.get(id=backtest_id)
        except BacktestRun.DoesNotExist:
            return None

    @staticmethod
    def create_backtest_run(
        symbols,
        start_date,
        end_date,
        strategy_config,
        initial_capital=10000.0,
        commission_pct=0.001,
        commission_fixed=1.0
    ):
        """Create a new backtest run record"""
        return BacktestRun.objects.create(
            symbols=symbols,
            start_date=start_date,
            end_date=end_date,
            strategy_config=strategy_config,
            initial_capital=initial_capital,
            commission_pct=commission_pct,
            commission_fixed=commission_fixed,
            final_portfolio_value=0,
            total_return=0,
            annualized_return=0,
            annualized_volatility=0,
            sharpe_ratio=0,
            sortino_ratio=0,
            max_drawdown=0,
        )

    @staticmethod
    def update_backtest_results(backtest_id, result: BacktestResult):
        """Update backtest run with results including graph data"""
        backtest = BacktestRun.objects.get(id=backtest_id)
        backtest.final_portfolio_value = result.final_portfolio_value
        backtest.total_return = result.total_return
        backtest.annualized_return = result.annualized_return
        backtest.annualized_volatility = result.annualized_volatility
        backtest.sharpe_ratio = result.sharpe_ratio
        backtest.sortino_ratio = result.sortino_ratio
        backtest.max_drawdown = result.max_drawdown
        
        # Store graph data
        backtest.equity_curve = result.equity_curve
        backtest.drawdown_curve = result.drawdown_curve
        backtest.daily_returns = result.daily_returns
        backtest.portfolio_values = result.portfolio_values
        
        backtest.status = 'completed'
        backtest.save()
        return backtest

    @staticmethod
    def update_backtest_status(backtest_id, status, error_message=None):
        """Update backtest status"""
        backtest = BacktestRun.objects.get(id=backtest_id)
        backtest.status = status
        if error_message:
            backtest.error_message = error_message
        backtest.save()
        return backtest

    @staticmethod
    def search_backtests(symbols=None, start_date=None, end_date=None):
        """Search backtest runs"""
        queryset = BacktestRun.objects.all()
        
        if symbols:
            queryset = queryset.filter(symbols__icontains=symbols)
        if start_date:
            queryset = queryset.filter(start_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(end_date__lte=end_date)
        
        return queryset

    @staticmethod
    def create_trade(backtest_run, symbol, trade_type, date, price, shares, commission):
        """Create a trade record"""
        return Trade.objects.create(
            backtest_run=backtest_run,
            symbol=symbol,
            trade_type=trade_type,
            date=date,
            price=price,
            shares=shares,
            commission=commission
        )

    @staticmethod
    def get_trades_for_backtest(backtest_id):
        """Get all trades for a backtest"""
        return Trade.objects.filter(backtest_run_id=backtest_id)
