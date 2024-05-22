FROM debian:bullseye-slim
LABEL maintainer="Gaifullin Amir <gajjfullinai@gmail.com>"

# Update these as necessary
ENV JAVA "17"
ENV JAVA_VER "17.0.*"
ENV JAVA_HOME "/usr/lib/jvm/java-${JAVA}-openjdk-amd64"
ENV BUILD_TOOLS "34.0.0"
ENV TARGET_SDK "34"
ENV ANDROID_SDK_ROOT "/opt/sdk"
ENV ANDROID_HOME ${ANDROID_SDK_ROOT}
ENV CMDLINE_VERSION "9.0"
ENV SDK_TOOLS "9477386"
ENV NDK_VERSION "25.2.9519653"
ENV ANDROID_NDK_HOME ${ANDROID_HOME}/ndk/${NDK_VERSION}
ENV PATH="${PATH}:/sbin:${ANDROID_SDK_ROOT}/cmdline-tools/${CMDLINE_VERSION}/bin:${ANDROID_SDK_ROOT}/platform-tools:${ANDROID_SDK_ROOT}/extras/google/instantapps:${ANDROID_SDK_ROOT}/build-tools/${BUILD_TOOLS}:${ANDROID_NDK_HOME}"

# Set the default shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Installing required packages and setup Android SDK
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
    ca-certificates=20210119 \
    wget=1.21* \
    unzip=6.0* \
    curl=7.74.* \
    jq=1.6-* \
    procps=2:3.3* \
    openjdk-${JAVA}-jdk-headless=${JAVA_VER} && \
    rm -rf /var/lib/apt/lists/* && \
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-${SDK_TOOLS}_latest.zip -O /tmp/tools.zip && \
    mkdir -p ${ANDROID_SDK_ROOT}/cmdline-tools && \
    unzip -qq /tmp/tools.zip -d ${ANDROID_SDK_ROOT}/cmdline-tools && \
    mv ${ANDROID_SDK_ROOT}/cmdline-tools/cmdline-tools ${ANDROID_SDK_ROOT}/cmdline-tools/${CMDLINE_VERSION} && \
    rm -v /tmp/tools.zip && \
    mkdir -p ~/.android/ && touch ~/.android/repositories.cfg && \
    yes | sdkmanager --sdk_root=${ANDROID_SDK_ROOT} --licenses || true && \
    sdkmanager --sdk_root=${ANDROID_SDK_ROOT} --install "platform-tools" "extras;google;instantapps" "cmake;3.22.1" && \
    sdkmanager --sdk_root="${ANDROID_SDK_ROOT}" --install "build-tools;${BUILD_TOOLS}" "platforms;android-${TARGET_SDK}" "ndk;${NDK_VERSION}" && \
    sdkmanager --sdk_root="${ANDROID_SDK_ROOT}" --uninstall emulator

# Set the default command
CMD ["jshell"]
