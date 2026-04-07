FROM ghcr.io/daymarket/airflow:3.1.3-python3.11-base-0
USER airflow
WORKDIR /opt/airflow
COPY requirements.txt requirements.txt
RUN uv pip install --no-cache-dir \
    -r requirements.txt
