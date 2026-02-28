from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now

@api_view(["GET"])
def home(request):
    return Response({"message": "Home endpoint for the Financer API."}, status=status.HTTP_200_OK)

@api_view(["GET"])
def heartbeat(request):
    return Response(
        {
            "status": "ok",
            "timestamp": now()
        },
        status=status.HTTP_200_OK
    )