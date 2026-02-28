#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""

from dotenv import load_dotenv
import os
import sys
from openbb import obb

def main():
    """Run administrative tasks."""
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "financer.settings")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    # Load environment variables from .env file
    load_dotenv()
    obb.user.credentials.fmp_api_key = os.getenv("OPENBB_FMP_API_KEY") # todo put this in a nicer spot
    main()
    
