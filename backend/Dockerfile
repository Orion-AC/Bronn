FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for psycopg2
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./backend/

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application as a package to support relative imports
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

