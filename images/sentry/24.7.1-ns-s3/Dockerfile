FROM getsentry/sentry:24.7.1
ENV \
  # Sentry config params
  SENTRY_CONF=/etc/sentry
RUN pip install --no-cache-dir https://github.com/ilyakuchaev/sentry-s3-nodestore/archive/refs/heads/master.zip
# RUN pip install https://github.com/jbalogh/django-multidb-router/archive/refs/heads/master.zip
RUN <<EOF cat >> $SENTRY_CONF/sentry.conf.py
SENTRY_NODESTORE = 'sentry_s3_nodestore.backend.S3NodeStorage'
SENTRY_NODESTORE_OPTIONS = {
    'bucket_name': env("NODESTORE_S3_BUCKET_NAME"),
    'region': env("NODESTORE_S3_REGION"), # Necessary for buckets outside US-Standard
    'endpoint': env("NODESTORE_S3_ENDPOINT"), # Optionally you can provide your own S3 compatible endpoint
    'aws_access_key_id': env("NODESTORE_S3_ACCESS_KEY"),
    'aws_secret_access_key': env("NODESTORE_S3_SECRET_KEY")
}
EOF
