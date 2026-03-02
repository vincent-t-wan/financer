from django.urls import path

from .controller.correlationcontroller import get_matrix
from .controller.syscontroller import home, heartbeat
from .controller.backtestercontroller import (
    run,
    get_all_backtests,
    get_backtest_by_id,
    search_backtests,
)

urlpatterns = [
    path("", home, name="home"),
    path('heartbeat/', heartbeat, name='heartbeat'),
    path("backtester/run/", run, name="run_backtest"),
    path("backtester/get_all_backtests/", get_all_backtests, name="get_all_backtests"),
    path("backtester/get_backtest/<int:backtest_id>/", get_backtest_by_id, name="get_backtest_by_id"),
    path("backtester/search_backtests/", search_backtests, name="search_backtests"),
    
    path("correlation/get_matrix/", get_matrix, name="get_matrix"),
]