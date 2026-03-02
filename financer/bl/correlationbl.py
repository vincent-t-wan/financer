import pandas as pd
from .backtester.datahandler import DataHandler

class CorrelationBL:
    @staticmethod
    def get_matrix(
        symbols: list[str],
        start_date: str,
        end_date: str
	):
        """Business logic for getting correlation matrix

        Args:
            symbols: List of symbol strings (e.g., ["AAPL", "MSFT"])
            start_date: Start date in YYYY-MM-DD format
            end_date: End date in YYYY-MM-DD format

		Returns:
            Correlation matrix
        """
        
        # Validate dates
        CorrelationBL._validate_dates(start_date, end_date)
        
        # Fetch data from repository
        data_handler = DataHandler(symbols=symbols, start_date=start_date, end_date=end_date)

        data = data_handler.load_data()
        
		# Normalize to dict regardless of symbols length
        if len(symbols) == 1:
            data = {symbols[0]: data}

        if not data or all(df.empty for df in data.values()):
            raise ValueError("No market data found for one of the given parameters")
    
		# Extract closing prices
        close_prices = pd.DataFrame()
        for symbol in symbols:
            df = data[symbol].reset_index()  # ← drops the symbol index
            close_prices[symbol] = df['close'].values  # ← use .values to avoid index alignment issues
        
        # compute the correlation matrix
        corr_matrix = close_prices.corr()
  
        # Create correlation matrix record in database
        # backtest_run = CorrelationDAL.create_matrix_record(
        #     symbols=",".join(symbols),
        #     start_date=start_date,
        #     end_date=end_date,
        #     strategy_config={
        #         "indicators": strategy_indicators,
        #         "signal_logic": signal_logic
        #     },
        #     initial_capital=initial_capital,
        #     commission_pct=commission_pct,
        #     commission_fixed=commission_fixed
        # )

        return corr_matrix.to_dict()

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