FROM alpine/helm:3.13.2
# hadolint ignore=DL3018
RUN apk --no-cache add \
    bash \
    curl \
    expat \
    libcurl \
    py3-pip && \
    pip install --no-cache-dir pybump==1.11.5