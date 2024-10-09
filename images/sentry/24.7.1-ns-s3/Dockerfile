FROM getsentry/sentry:24.7.1

RUN apt-get update && \
    apt-get install -y software-properties-common --no-install-recommends && \
    apt-get install -y virtualenv --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    pip install --no-cache-dir --disable-pip-version-check pip install https://github.com/ilyakuchaev/sentry-s3-nodestore/archive/refs/heads/master.zip && \
    pip install --no-cache-dir --disable-pip-version-check https://github.com/jbalogh/django-multidb-router/archive/refs/tags/v0.9.zip
