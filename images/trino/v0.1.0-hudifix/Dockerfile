#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
FROM ghcr.io/airlift/jvmkill@sha256:7297eb25c9011daee5f577784c82622e25d6c4ca16bbbb12079b56a186e8aebf AS jvmkill

FROM alpine:3.18.3 as trino-build
RUN apk add --no-cache "curl>=8.2.1-r0" && \
    rm -rf /var/cache/apk/* && \
    curl -Lo ./trino.tar.gz https://github.com/KazanExpress/ke-infra-docker/releases/download/trino-v0.1.0/trino-v0.1.0.tar.gz && \
    mkdir trino && tar -xhzvf trino.tar.gz -C /trino

# Use Eclipse Temurin as they have base Docker images for more architectures.
FROM eclipse-temurin:17-jdk

RUN \
    set -xeu && \
    echo 'Acquire::Retries "3";' > /etc/apt/apt.conf.d/80-retries && \
    echo 'Acquire::http::Timeout "15";' > /etc/apt/apt.conf.d/80-timeouts && \
    apt-get update -q && \
    apt-get install -y -q --no-install-recommends less python3 curl && \
    rm -rf /var/lib/apt/lists/* && \
    update-alternatives --install /usr/bin/python python /usr/bin/python3 1 && \
    groupadd trino --gid 1000 && \
    useradd trino --uid 1000 --gid 1000 --create-home && \
    mkdir -p /usr/lib/trino /data/trino && \
    chown -R "trino:trino" /usr/lib/trino /data/trino

ARG TRINO_VERSION=426-SNAPSHOT
COPY --chown=trino:trino --from=trino-build /trino/trino-build/trino-cli-${TRINO_VERSION}-executable.jar /usr/bin/trino
COPY --chown=trino:trino --from=trino-build /trino/trino-build/trino-server-${TRINO_VERSION} /usr/lib/trino
COPY --chown=trino:trino --from=trino-build /trino/trino-build/default/etc /etc/trino
COPY --chown=trino:trino --from=jvmkill /libjvmkill.so /usr/lib/trino/bin

EXPOSE 8080
USER trino:trino
CMD ["/usr/lib/trino/bin/run-trino"]
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s \
  CMD /usr/lib/trino/bin/health-check
