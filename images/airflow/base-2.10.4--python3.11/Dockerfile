FROM apache/airflow:2.10.4-python3.11

USER root

RUN apt-get update && \
    apt-get install --no-install-recommends -y git htop && \
    rm -rf /var/lib/apt/lists/*

USER airflow
WORKDIR /opt/airflow
COPY requirements.txt requirements.txt
COPY resolv.conf /etc/resolv.conf
ENV PYPI_USER=$PYPI_USER
ENV PYPI_PASSWORD=$PYPI_PASSWORD
RUN pip install --no-cache-dir uv==0.8.3 \
&& uv pip install --system --extra-index-url \
    "https://$(cat /run/secrets/PYPI_USER):$(cat /run/secrets/PYPI_PASSWORD)@nexus.infra.internal.daymarket.uz/repository/um-pypi/simple" \
    -r requirements.txt

