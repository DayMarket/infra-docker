FROM ghcr.io/daymarket/airflow:2.10.4--python3.11--base
USER airflow
WORKDIR /opt/airflow
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir \
    -r requirements.txt
