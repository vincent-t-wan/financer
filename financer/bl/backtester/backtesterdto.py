from dataclasses import dataclass
from decimal import Decimal

@dataclass
class BacktesterDTO:
    """Data Transfer Object for Backtester"""

    id: int
    title: str
    author: str
    isbn: str
    price: Decimal
    publication_date: str
    is_available: bool

    @classmethod
    def from_model(cls, backtester):
        return cls(
            id=backtester.id,
            title=backtester.title,
            author=backtester.author,
            isbn=backtester.isbn,
            price=backtester.price,
            publication_date=backtester.publication_date,
            is_available=backtester.is_available,
        )
