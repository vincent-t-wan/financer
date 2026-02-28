from rest_framework import serializers
from ..models import BacktestRun, Trade


class TradeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trade
        fields = '__all__'


class BacktestRunSerializer(serializers.ModelSerializer):
    trades = TradeSerializer(many=True, read_only=True)
    
    # Add graph data fields
    equity_curve = serializers.JSONField(required=False)
    drawdown_curve = serializers.JSONField(required=False)
    daily_returns = serializers.JSONField(required=False)
    portfolio_values = serializers.JSONField(required=False)
    
    class Meta:
        model = BacktestRun
        fields = '__all__'


class BacktesterSerializer(serializers.Serializer):
    # Performance metrics
    final_portfolio_value = serializers.FloatField()
    total_return = serializers.FloatField()
    annualized_return = serializers.FloatField()
    annualized_volatility = serializers.FloatField()
    sharpe_ratio = serializers.FloatField()
    sortino_ratio = serializers.FloatField()
    max_drawdown = serializers.FloatField()
    
    # Graph data
    equity_curve = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    drawdown_curve = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    daily_returns = serializers.ListField(
        child=serializers.FloatField(),
        required=False
    )
    portfolio_values = serializers.ListField(
        child=serializers.FloatField(),
        required=False
    )
