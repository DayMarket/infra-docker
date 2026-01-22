FROM apache/airflow:2.10.4-python3.11
ENV AIRFLOW_COMMONS_VERSION=0.5.3
ENV AIRFLOW_DAG_GENERATOR=0.3.7+oncall

USER root

RUN apt-get update && \
    apt-get install -y git htop && \
    rm -rf /var/lib/apt/lists/*

USER airflow

RUN pip install --upgrade pip

RUN pip install --no-install-recommends https://nexus.infra.internal.daymarket.uz/repository/um-pypi/simple/ \
    daymarket-airflow-commons==$AIRFLOW_COMMONS_VERSION  \
    airflow-dag-generator==$AIRFLOW_DAG_GENERATOR