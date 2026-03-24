FROM python:3.11-slim

WORKDIR /app

COPY sync.py .

RUN pip install --no-cache-dir requests

CMD ["python", "sync.py"]