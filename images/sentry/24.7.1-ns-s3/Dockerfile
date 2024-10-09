FROM getsentry/sentry:24.7.1

RUN apt-get update && \
    apt-get install -y software-properties-common --no-install-recommends && \
    apt-get install -y virtualenv --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    pip install --no-cache-dir --disable-pip-version-check https://github.com/kanadaj/sentry-s3-nodestore/releases/download/1.0.2/sentry-s3-nodestore-1.0.2.tar.gz && \
    pip install --no-cache-dir --disable-pip-version-check https://github.com/jbalogh/django-multidb-router/archive/refs/tags/v0.9.zip
