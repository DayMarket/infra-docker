FROM openapitools/openapi-generator-cli:v5.4.0
# https://github.com/hadolint/hadolint/wiki/DL4006
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN curl -fsSL https://deb.nodesource.com/setup_17.x | bash - \
    && apt-get install -y --no-install-recommends nodejs=17.9.0-deb-1nodesource1 \
    && npm install -g @openapitools/openapi-generator-cli@2.4.26
