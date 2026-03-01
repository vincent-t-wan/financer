import json
from .backtester.backtesterdto import BacktesterDTO
from .backtester.datahandler import DataHandler
from .backtester.strategy import Strategy
from ..dal.backtester.backtesterdal import BacktesterDAL
from ..dal.backtester.models.backtester import Backtester

class BacktesterBL:
    @staticmethod
    def get_all_backtesters():
        """Business logic for getting all backtesters"""
        backtesters = BacktesterDAL.get_all_backtesters()
        # Add any business logic here (filtering, sorting, etc.)
        return backtesters.filter(is_available=True)  # Example: only available backtesters
    
    @staticmethod
    def get_all_backtesters_dto():
        """Returns list of BacktesterDTOs"""
        backtesters = BacktesterDAL.get_all_backtesters()
        return [BacktesterDTO.from_model(backtester) for backtester in backtesters]
    
    @staticmethod
    def get_backtester_details(backtester_id):
        """Returns a single BacktesterDTO or None"""
        backtester = BacktesterDAL.get_backtester_by_id(backtester_id)
        if not backtester:
            return None
        return BacktesterDTO.from_model(backtester)

    @staticmethod
    def run(
        symbols: list[str],
        start_date: str,
        end_date: str,
        strategy_indicators: dict,
        signal_logic: str,
        initial_capital: float = 10000.0,
        commission_pct: float = 0.001,
        commission_fixed: float = 1.0
    ):
        """
        Business logic for running a backtest
        
        Args:
            symbols: List of symbol strings (e.g., ["AAPL", "MSFT"])
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format
            strategy_indicators: Dict of indicator definitions
            signal_logic: String or callable for signal generation
            initial_capital: Starting capital
            commission_pct: Commission percentage
            commission_fixed: Fixed commission per trade
        
        Returns:
            Backtest results dictionary
        """
        
        # Validate dates
        BacktesterBL._validate_dates(start_date, end_date)
        
        # Fetch data from repository
        data_handler = DataHandler(symbols=symbols, start_date=start_date, end_date=end_date)

        data = data_handler.load_data()

        if data.empty:
            raise ValueError("No market data found for the given parameters")
    
        # Create backtest run record in database
        backtest_run = BacktesterDAL.create_backtest_run(
            symbols=",".join(symbols),
            start_date=start_date,
            end_date=end_date,
            strategy_config={
                "indicators": strategy_indicators,
                "signal_logic": signal_logic
            },
            initial_capital=initial_capital,
            commission_pct=commission_pct,
            commission_fixed=commission_fixed
        )
        
        try:
            # Convert strategy_indicators to lambdas if needed
            indicators = BacktesterBL._parse_indicators(strategy_indicators)
            
            # Convert signal_logic to callable if needed
            signal_func = BacktesterBL._parse_signal_logic(signal_logic)

            # Create strategy, indicators, and signal logic for backtesting
            strategy = Strategy(
                indicators=indicators,
                signal_logic=signal_func,
            )

            # Generate signals
            data = strategy.generate_signals(data)

            # Initialize backtester with configuration
            backtester = Backtester(
                initial_capital=initial_capital,
                commission_pct=commission_pct,
                commission_fixed=commission_fixed
            )
            backtester.backtest(data)
            performance = backtester.calculate_performance()
            
            # Update backtest results to database
            BacktesterDAL.update_backtest_results(backtest_run.id, performance)
            
            return performance
        except Exception as e:
            # Update backtest run status to failed
            backtest_run.status = 'failed'
            backtest_run.error_message = str(e)
            backtest_run.save()
            raise e
    
    @staticmethod
    def _validate_dates(start_date: str, end_date: str):
        """Validate date format and logic"""
        from datetime import datetime
        
        try:
            start = datetime.strptime(start_date, '%Y-%m-%d')
            end = datetime.strptime(end_date, '%Y-%m-%d')
            
            if start >= end:
                raise ValueError("start_date must be before end_date")
        except ValueError as e:
            raise ValueError(f"Invalid date format: {str(e)}")
    
    @staticmethod
    def _parse_indicators(strategy_indicators: dict) -> dict:
        """Convert indicator definitions to callable functions"""
        # This will depend on your indicator format
        # Example implementation:
        indicators = {}
        
        for name, config in strategy_indicators.items():
            if config['type'] == 'sma':
                window = config['window']
                indicators[name] = lambda row, w=window: row["close"].rolling(window=w).mean()
            elif config['type'] == 'ema':
                window = config['window']
                indicators[name] = lambda row, w=window: row["close"].ewm(span=w).mean()
            # Add more indicator types as needed
        
        return indicators
    
    @staticmethod
    def _parse_signal_logic(signal_logic: str):
        """Convert signal logic string to callable"""
        # This is a simplified example - you may want to use a safer approach
        # than eval() in production (like a custom DSL parser)
        
        if callable(signal_logic):
            return signal_logic
        
        # Example: "sma_20 > sma_60"
        # You might want to build a proper parser here
        return lambda row: eval(signal_logic, {"row": row})