"""Data handler module for loading and processing data."""

from typing import List, Optional

import pandas as pd
from openbb import obb

class DataHandler:
    """Data handler class for loading and processing data."""

    def __init__(
        self,
        symbols: List[str],
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        provider: str = "yfinance",
    ):
        """Initialize the data handler."""
        self.symbols = [symbol.upper() for symbol in symbols]
        self.start_date = start_date
        self.end_date = end_date
        self.provider = provider

    def load_data(self) -> pd.DataFrame | dict[str, pd.DataFrame]:
        """Load equity data."""
        print(f"Loading data for symbols: {self.symbols} from {self.start_date} to {self.end_date} using provider: {self.provider}")
        data = obb.equity.price.historical(
            symbol=self.symbols,
            start_date=self.start_date,
            end_date=self.end_date,
            provider=self.provider,
        ).to_df()

        if self.symbols and len(self.symbols) == 1:
            return data

        data = data.reset_index().set_index("symbol")
        return {symbol: data.loc[symbol] for symbol in self.symbols}

    def load_data_from_csv(self, file_path) -> pd.DataFrame:
        """Load data from CSV file."""
        return pd.read_csv(file_path, index_col="date", parse_dates=True)
