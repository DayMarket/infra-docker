FROM getsentry/sentry:24.7.1
RUN echo $' \n\
  SENTRY_NODESTORE = 'sentry_s3_nodestore.backend.S3NodeStorage' \n\
  SENTRY_NODESTORE_OPTIONS = { \n\
    'bucket_name': env("NODESTORE_S3_BUCKET_NAME"),\n\
    'region': env("NODESTORE_S3_REGION"),\n\
    'endpoint': env("NODESTORE_S3_ENDPOINT"),\n\
    'aws_access_key_id': env("NODESTORE_S3_ACCESS_KEY"),\n\
    'aws_secret_access_key': env("NODESTORE_S3_SECRET_KEY"),\n\
  }\n\' >> /etc/sentry/sentry.conf.py && \
pip install --no-cache-dir --no-deps . https://github.com/pavels/sentry-s3-nodestore/releases/download/v1.0.3/sentry-s3-nodestore-1.0.3.tar.gz 