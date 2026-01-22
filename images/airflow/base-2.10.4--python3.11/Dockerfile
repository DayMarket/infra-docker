FROM apache/airflow:2.10.4-python3.11

USER root

RUN apt-get update && \
    apt-get install --no-install-recommends -y git htop && \
    rm -rf /var/lib/apt/lists/*

USER airflow
WORKDIR /opt/airflow
COPY "airflow_dag_generator-0.3.7+oncallpatch-py3-none-any.whl" daymarket_airflow_commons-0.5.3-py3-none-any.whl
RUN  pip install --no-cache-dir --extra-index-url daymarket_airflow_commons-0.5.3-py3-none-any.whl "airflow_dag_generator-0.3.7+oncallpatch-py3-none-any.whl"
