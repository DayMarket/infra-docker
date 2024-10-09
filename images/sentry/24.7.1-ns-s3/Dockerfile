FROM getsentry/sentry:24.7.1

RUN apt-get install software-properties-common && \
    apt-add-repository universe && \
    apt-get update && \
    apt-get install virtualenv -y --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    pip install --no-cache-dir --no-deps . https://github.com/pavels/sentry-s3-nodestore/releases/download/v1.0.3/sentry-s3-nodestore-1.0.3.tar.gz && \
    pip install --no-cache-dir --no-deps . https://github.com/jbalogh/django-multidb-router/archive/refs/tags/v0.9.zip
