FROM alpine/helm:3.13.2
RUN apk --no-cache add \
    "bash>=5.1.15" \
    "curl>=7.83.1-r3" \
    "expat>=2.4.9-r0" \
    "libcurl>=7.83.1-r3" \
    "py3-pip>=22.1.1-r0" && \
    pip install --no-cache-dir pybump==1.8.1
