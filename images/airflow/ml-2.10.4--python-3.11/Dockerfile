FROM ghcr.io/daymarket/airflow:base-2.10.4--python3.11
USER airflow
WORKDIR /opt/airflow
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir \
    -r requirements.txt
