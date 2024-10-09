FROM getsentry/sentry:24.7.1

RUN pip install --no-cache-dir --disable-pip-version-check https://github.com/ilyakuchaev/sentry-s3-nodestore/archive/refs/heads/master.zip && \
    pip install --no-cache-dir --disable-pip-version-check https://github.com/jbalogh/django-multidb-router/archive/refs/tags/v0.9.zip
