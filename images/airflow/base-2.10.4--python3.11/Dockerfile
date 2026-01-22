FROM apache/airflow:2.10.4-python3.11

USER root

RUN apt-get update && \
    apt-get install --no-install-recommends -y git htop && \
    rm -rf /var/lib/apt/lists/*

USER airflow
WORKDIR /opt/airflow
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir uv==0.8.3 \
&& uv pip install --system -r requirements.txt
