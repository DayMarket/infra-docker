ARG GRAFANA_VERSION="8.5.5"

FROM grafana/grafana:${GRAFANA_VERSION}

USER root

ARG GF_INSTALL_IMAGE_RENDERER_PLUGIN="false"

ARG GF_GID="0"

ENV GF_PATHS_PLUGINS="/var/lib/grafana-plugins"

RUN mkdir -p "$GF_PATHS_PLUGINS" && \
    chown -R grafana:${GF_GID} "$GF_PATHS_PLUGINS"

RUN if [ $GF_INSTALL_IMAGE_RENDERER_PLUGIN = "true" ]; then \
    echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories && \
    echo "http://dl-cdn.alpinelinux.org/alpine/edge/main" >> /etc/apk/repositories && \
    echo "http://dl-cdn.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories && \
    apk --no-cache upgrade && \
    apk add --no-cache \
    chromium=102.0.5005.115-r0 \
    ttf-opensans=0_git20210927-r0 \
    udev=176 && \
    rm -rf /tmp/* && \
    rm -rf /usr/share/grafana/tools/phantomjs; \
    fi

USER grafana

ENV GF_PLUGIN_RENDERING_CHROME_BIN="/usr/bin/chromium-browser"

RUN if [ $GF_INSTALL_IMAGE_RENDERER_PLUGIN = "true" ]; then \
    grafana-cli \
    --pluginsDir "$GF_PATHS_PLUGINS" \
    --pluginUrl https://github.com/grafana/grafana-image-renderer/releases/latest/download/plugin-linux-x64-glibc-no-chromium.zip \
    plugins install grafana-image-renderer; \
    fi

ARG GF_INSTALL_FLOWCHARTING_PLUGIN="true"

RUN if [ $GF_INSTALL_FLOWCHARTING_PLUGIN = "true" ]; then \
    grafana-cli \
    --pluginsDir "$GF_PATHS_PLUGINS" \
    --pluginUrl https://algenty.github.io/flowcharting-repository/archives/agenty-flowcharting-panel-1.0.0d.220606199-SNAPSHOT.zip \
    plugins install agenty-flowcharting-panel; \
    fi

# https://github.com/hadolint/hadolint/wiki/DL4006
SHELL ["/bin/ash", "-eo", "pipefail", "-c"]

ARG GF_INSTALL_PLUGINS="grafana-clickhouse-datasource,vertamedia-clickhouse-datasource,doitintl-bigquery-datasource,trino-datasource"


RUN if [ -n "${GF_INSTALL_PLUGINS}" ]; then \
    OLDIFS=$IFS; \
    IFS=','; \
    for plugin in ${GF_INSTALL_PLUGINS}; do \
        IFS=$OLDIFS; \
        if expr "$plugin" : '.*\;.*'; then \
            pluginUrl=$(echo "$plugin" | cut -d';' -f 1); \
            pluginInstallFolder=$(echo "$plugin" | cut -d';' -f 2); \
            grafana-cli --pluginUrl "${pluginUrl}" --pluginsDir "${GF_PATHS_PLUGINS}" plugins install "${pluginInstallFolder}"; \
        else \
            grafana-cli --pluginsDir "${GF_PATHS_PLUGINS}" plugins install "${plugin}"; \
        fi \
    done \
    fi
