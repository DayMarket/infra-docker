FROM docker.io/php:8.0-apache
LABEL maintainer="markus@martialblog.de"

# Install OS dependencies
RUN set -ex; \
        apt-get update; \
        apt-get install -y --no-install-recommends \
                netcat-openbsd \
                libldap-common \
                libsasl2-modules \
        ; \
        \
        apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
        rm -rf /var/lib/apt/lists/*

# Install PHP Plugins and Configure PHP imap plugin
# hadolint ignore=SC2086
RUN set -ex; \
        \
        savedAptMark="$(apt-mark showmanual)"; \
        \
        apt-get update; \
        apt-get install -y --no-install-recommends \
                libldap2-dev \
                libfreetype6-dev \
                libjpeg-dev \
                libonig-dev \
                zlib1g-dev \
                libc-client-dev \
                libkrb5-dev \
                libpng-dev \
                libpq-dev \
                libzip-dev \
                libtidy-dev \
                libsodium-dev \
        ; \
        \
        debMultiarch="$(dpkg-architecture --query DEB_BUILD_MULTIARCH)"; \
        docker-php-ext-configure gd --with-freetype --with-jpeg; \
        docker-php-ext-configure imap --with-kerberos --with-imap-ssl; \
        docker-php-ext-configure ldap --with-libdir="lib/$debMultiarch"; \
        docker-php-ext-install -j "$(nproc)" \
                exif \
                gd \
                imap \
                ldap \
                mbstring \
                pdo \
                pdo_mysql \
                pdo_pgsql \
                pgsql \
                sodium \
                tidy \
                zip \
        ; \
        \
# Reset apt-mark's "manual" list so that "purge --auto-remove" will remove all build dependencies
        apt-mark auto '.*' > /dev/null; \
        apt-mark manual $savedAptMark; \
        ldd "$(php -r 'echo ini_get("extension_dir");')"/*.so \
                | awk '/=>/ { print $3 }' \
                | sort -u \
                | xargs -r dpkg-query -S \
                | cut -d: -f1 \
                | sort -u \
                | xargs -rt apt-mark manual; \
        \
        apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false; \
        rm -rf /var/lib/apt/lists/*

# Apache configuration
RUN a2enmod headers rewrite remoteip; \
        {\
        echo RemoteIPHeader X-Real-IP ;\
        echo RemoteIPTrustedProxy 10.0.0.0/8 ;\
        echo RemoteIPTrustedProxy 172.16.0.0/12 ;\
        echo RemoteIPTrustedProxy 192.168.0.0/16 ;\
        } > /etc/apache2/conf-available/remoteip.conf;\
        a2enconf remoteip

# Use the default production configuration
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

ARG version="5.6.68+240625"
ARG sha256_checksum="80a27ec67f9a6de5d883d6d6ba59000b79e79549912ea03a88d4da20eed6aa55"
ARG archive_url="https://github.com/LimeSurvey/LimeSurvey/archive/refs/tags/${version}.tar.gz"
ARG USER=www-data
ARG LISTEN_PORT=8080
ENV LIMESURVEY_VERSION=$version

# Download, unzip and chmod LimeSurvey from GitHub (defaults to the official LimeSurvey/LimeSurvey repository)
RUN set -ex; \
        curl -sSL "${archive_url}" --output /tmp/limesurvey.tar.gz && \
        echo "${sha256_checksum}  /tmp/limesurvey.tar.gz" | sha256sum -c - && \
        \
        tar xzvf "/tmp/limesurvey.tar.gz" --strip-components=1 -C /var/www/html/ && \
        rm -f "/tmp/limesurvey.tar.gz" && \
        chown -R "$USER:$USER" /var/www/html /etc/apache2

COPY limesurvey-6-uz.po /tmp/limesurvey-6-uz.po

RUN set -ex; \
    # msgfmt lives in the gettext package
    apt-get update && \
    apt-get install -y --no-install-recommends gettext; \
    \
    # Location LimeSurvey looks for translations:
    #   /var/www/html/locale/<lang>/LC_MESSAGES/limesurvey.mo
    mkdir -p /var/www/html/locale/uz/LC_MESSAGES; \
    msgfmt /tmp/limesurvey-6-uz.po \
            -o /var/www/html/locale/uz/LC_MESSAGES/limesurvey.mo; \
    \
    # permissions consistent with the rest of /var/www
    chown -R "${USER}:${USER}" /var/www/html/locale/uz; \
    chmod -R g=u /var/www/html/locale/uz; \
    \
    # tidy up build artefacts
    rm /tmp/limesurvey-6-uz.po

EXPOSE $LISTEN_PORT

WORKDIR /var/www/html
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
COPY vhosts-access-log.conf /etc/apache2/conf-enabled/other-vhosts-access-log.conf
USER $USER
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["apache2-foreground"]
