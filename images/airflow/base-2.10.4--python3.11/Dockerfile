FROM apache/airflow:2.10.4-python3.11

USER root

RUN apt-get update && \
    apt-get install --no-install-recommends -y git htop && \
    rm -rf /var/lib/apt/lists/*

USER airflow
WORKDIR /opt/airflow
COPY requirements.txt requirements.txt
RUN --mount=type=secret,id=pypi_user,uid=50000 \
    --mount=type=secret,id=pypi_password,uid=50000 \
    pip install --no-cache-dir --extra-index-url \
    "https://$(cat /run/secrets/pypi_user):$(cat /run/secrets/pypi_password)@nexus.infra.cluster.daymarket.uz/repository/um-pypi/simple" \
    -r requirements.txt
