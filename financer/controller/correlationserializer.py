from rest_framework import serializers

class MatrixSerializer(serializers.Serializer):
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
        child=serializers.DictField(),
        required=False
    )
    portfolio_values = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
