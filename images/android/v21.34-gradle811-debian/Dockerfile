FROM debian:12-slim
LABEL maintainer="Artem Zanin <a.zanin@uzum.com>"

# jdk https://www.oracle.com/java/technologies/downloads/#java21
# gradle https://services.gradle.org/distributions/
# android sdk https://developer.android.com/studio

CMD ["gradle"]

ENV GRADLE_VERSION=8.11
ENV GRADLE_DOWNLOAD_SHA256=57dafb5c2622c6cc08b993c85b7c06956a2f53536432a30ead46166dbca0f1e9
ENV GRADLE_HOME=/opt/gradle

ENV JAVA_VERSION=21
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH="${JAVA_HOME}/bin:${PATH}"
ENV BUILD_TOOLS=34.0.0
ENV TARGET_SDK=34
ENV ANDROID_SDK_ROOT=/opt/sdk
ENV ANDROID_HOME=${ANDROID_SDK_ROOT}
ENV CMDLINE_VERSION=9.0
ENV SDK_TOOLS=11076708
ENV PATH=${PATH}:${ANDROID_SDK_ROOT}/cmdline-tools/${CMDLINE_VERSION}/bin:${ANDROID_SDK_ROOT}/platform-tools:${ANDROID_SDK_ROOT}/extras/google/instantapps
ENV PATH=${PATH}:${ANDROID_SDK_ROOT}/build-tools/${BUILD_TOOLS}

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

RUN set -eux; \
 apt-get update && \
 apt-get install -y --no-install-recommends \
    ca-certificates \
    wget \
    unzip \
    jq && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /opt/java && \
    wget --progress=dot:giga -O openjdk.tar.gz https://download.oracle.com/java/${JAVA_VERSION}/latest/jdk-${JAVA_VERSION}_linux-x64_bin.tar.gz && \
    tar -xzf openjdk.tar.gz -C /opt/java && \
    mv /opt/java/jdk-${JAVA_VERSION}* ${JAVA_HOME} && \
    rm openjdk.tar.gz && \
    wget --progress=dot:giga -q https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip && \
    echo "${GRADLE_DOWNLOAD_SHA256} *gradle-${GRADLE_VERSION}-bin.zip" | sha256sum --check - && \
    unzip -q gradle-${GRADLE_VERSION}-bin.zip && \
    rm gradle-${GRADLE_VERSION}-bin.zip && \
    mv "gradle-${GRADLE_VERSION}" "${GRADLE_HOME}/" && \
    ln --symbolic "${GRADLE_HOME}/bin/gradle" /usr/bin/gradle && \
    wget --progress=dot:giga -q https://dl.google.com/android/repository/commandlinetools-linux-${SDK_TOOLS}_latest.zip -O /tmp/tools.zip && \
    mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools && \
    unzip -qq /tmp/tools.zip -d ${ANDROID_SDK_ROOT}/cmdline-tools && \
    mv ${ANDROID_SDK_ROOT}/cmdline-tools/* ${ANDROID_SDK_ROOT}/cmdline-tools/${CMDLINE_VERSION} && \
    rm -v /tmp/tools.zip && \
    mkdir -p ~/.android/ && touch ~/.android/repositories.cfg && \
    yes | sdkmanager --sdk_root=${ANDROID_SDK_ROOT} --licenses || true && \
    sdkmanager --sdk_root=${ANDROID_SDK_ROOT} --install "platform-tools" "extras;google;instantapps" && \
    sdkmanager --sdk_root="${ANDROID_SDK_ROOT}" --install "build-tools;${BUILD_TOOLS}" "platforms;android-${TARGET_SDK}" && \
    sdkmanager --sdk_root="${ANDROID_SDK_ROOT}" --uninstall emulator \
