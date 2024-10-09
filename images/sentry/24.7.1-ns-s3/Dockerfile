FROM getsentry/sentry:24.7.1
ENV \
  SENTRY_CONF=/etc/sentry

RUN pip install --no-cache-dir --no-deps . https://github.com/pavels/sentry-s3-nodestore/releases/download/v1.0.3/sentry-s3-nodestore-1.0.3.tar.gz  && \
echo <<'EOF'>> $SENTRY_CONF/sentry.conf.py
  SENTRY_NODESTORE = 'sentry_s3_nodestore.backend.S3NodeStorage'
  SENTRY_NODESTORE_OPTIONS = {
    'bucket_name': env("NODESTORE_S3_BUCKET_NAME"),
    'region': env("NODESTORE_S3_REGION"),
    'endpoint': env("NODESTORE_S3_ENDPOINT"),
    'aws_access_key_id': env("NODESTORE_S3_ACCESS_KEY"),
    'aws_secret_access_key': env("NODESTORE_S3_SECRET_KEY"),
  }
EOF
