from rest_framework.decorators import api_view
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
from ..bl.correlationbl import CorrelationBL

@api_view(["POST"])
def get_matrix(request):
    """Controller endpoint for computing correlation matrix"""
    try:
        # Extract parameters from request body
        data = request.data

        # Required parameters
        symbols = data.get("symbols")  # "[AAPL,MSFT]"
        start_date = data.get("start_date")  # "2023-01-01"
        end_date = data.get("end_date")  # "2023-12-31"

        # Validate required fields
        if not all([symbols, start_date, end_date]):
            return Response(
                {
                    "error": "Missing required fields: symbols, start_date, end_date"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Call business logic
        result = CorrelationBL.get_matrix(
            symbols=symbols,
            start_date=start_date,
            end_date=end_date
        )

        # Check if result is None (indicating failure)
        if not result:
            return Response(
                {"error": "Failed to run backtest"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return JsonResponse(result, status=status.HTTP_200_OK)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response(
            {"error": f"Internal server error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
