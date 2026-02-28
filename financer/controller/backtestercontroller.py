from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..bl.backtesterbl import BacktesterBL
from .backtesterserializer import BacktesterSerializer
from .backtesterserializer import BacktestRunSerializer
from ..dal.backtester.backtesterdal import BacktesterDAL

@api_view(['GET'])
def get_all_backtests(request):
    """Get all backtest runs"""
    backtests = BacktesterDAL.get_all_backtest_runs()
    serializer = BacktestRunSerializer(backtests, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_backtest_by_id(request, backtest_id):
    """Get a specific backtest by ID"""
    backtest = BacktesterDAL.get_backtest_by_id(backtest_id)
    if not backtest:
        return Response({"error": "Backtest not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = BacktestRunSerializer(backtest)
    return Response(serializer.data)


@api_view(['GET'])
def search_backtests(request):
    """Search backtests"""
    symbols = request.query_params.get('symbols')
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    
    backtests = BacktesterDAL.search_backtests(symbols, start_date, end_date)
    serializer = BacktestRunSerializer(backtests, many=True)
    return Response(serializer.data)


@api_view(["POST"])
def run(request):
    """Controller endpoint for running a backtest"""
    try:
        # Extract parameters from request body
        data = request.data

        # Required parameters
        symbols = data.get("symbols")  # "[AAPL,MSFT]"
        start_date = data.get("start_date")  # "2023-01-01"
        end_date = data.get("end_date")  # "2023-12-31"
        strategy_indicators = data.get("strategy_indicators")  # dict or JSON
        signal_logic = data.get("signal_logic")  # string or JSON

        # Optional parameters with defaults
        initial_capital = data.get("initial_capital", 10000.0)
        commission_pct = data.get("commission_pct", 0.001)
        commission_fixed = data.get("commission_fixed", 1.0)

        # Validate required fields
        if not all([symbols, start_date, end_date, strategy_indicators, signal_logic]):
            return Response(
                {
                    "error": "Missing required fields: symbols, start_date, end_date, strategy_indicators, signal_logic"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Call business logic
        result = BacktesterBL.run(
            symbols=symbols,
            start_date=start_date,
            end_date=end_date,
            strategy_indicators=strategy_indicators,
            signal_logic=signal_logic,
            initial_capital=initial_capital,
            commission_pct=commission_pct,
            commission_fixed=commission_fixed,
        )

        # Check if result is None (indicating failure)
        if not result:
            return Response(
                {"error": "Failed to run backtest"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Serialize and return result
        serializer = BacktesterSerializer(result)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {"error": f"Internal server error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
