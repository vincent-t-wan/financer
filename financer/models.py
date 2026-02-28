from django.db import models

class BacktestRun(models.Model):
    """Stores the results of a backtest run"""
    
    # Input parameters
    symbols = models.CharField(max_length=500)
    start_date = models.DateField()
    end_date = models.DateField()
    initial_capital = models.DecimalField(max_digits=12, decimal_places=2, default=10000.00)
    commission_pct = models.DecimalField(max_digits=6, decimal_places=5, default=0.001)
    commission_fixed = models.DecimalField(max_digits=6, decimal_places=2, default=1.00)
    
    # Strategy configuration (stored as JSON)
    strategy_config = models.JSONField()
    
    # Results
    final_portfolio_value = models.DecimalField(max_digits=12, decimal_places=2)
    total_return = models.DecimalField(max_digits=8, decimal_places=6)
    annualized_return = models.DecimalField(max_digits=8, decimal_places=6)
    annualized_volatility = models.DecimalField(max_digits=8, decimal_places=6)
    sharpe_ratio = models.DecimalField(max_digits=8, decimal_places=4)
    sortino_ratio = models.DecimalField(max_digits=8, decimal_places=4)
    max_drawdown = models.DecimalField(max_digits=8, decimal_places=6)
    
    # Graph data (stored as JSON)
    equity_curve = models.JSONField(null=True, blank=True)
    drawdown_curve = models.JSONField(null=True, blank=True)
    daily_returns = models.JSONField(null=True, blank=True)
    portfolio_values = models.JSONField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    error_message = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        db_table = 'backtest_runs'
    
    def __str__(self):
        return f"Backtest {self.id} - {self.symbols} ({self.start_date} to {self.end_date})"


class Trade(models.Model):
    """Stores individual trades from a backtest"""
    backtest_run = models.ForeignKey(BacktestRun, on_delete=models.CASCADE, related_name='trades')
    
    symbol = models.CharField(max_length=10)
    trade_type = models.CharField(max_length=4, choices=[('BUY', 'Buy'), ('SELL', 'Sell')])
    date = models.DateField()
    price = models.DecimalField(max_digits=12, decimal_places=4)
    shares = models.DecimalField(max_digits=12, decimal_places=4)
    commission = models.DecimalField(max_digits=12, decimal_places=2)
    
    class Meta:
        ordering = ['date']
        db_table = 'trades'
    
    def __str__(self):
        return f"{self.trade_type} {self.shares} {self.symbol} @ {self.price}"