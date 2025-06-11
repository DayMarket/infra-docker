FROM azul/zulu-openjdk-debian:8

WORKDIR /opt

ENV HADOOP_HOME=/opt/hadoop
ENV HADOOP_VERSION=3.3.3
ENV HIVE_HOME=/opt/hive
ENV HIVE_VERSION=3.1.2

SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN mkdir "${HIVE_HOME}" && \
    mkdir "${HADOOP_HOME}" && \
    apt-get update && \
    apt-get -y --no-install-recommends upgrade && \
    apt-get -y --no-install-recommends install curl=7.74.0-1.3+deb11u3 && \
    curl -L "https://dlcdn.apache.org/hive/hive-${HIVE_VERSION}/apache-hive-${HIVE_VERSION}-bin.tar.gz" | tar zxf - && \
    mv apache-hive-"${HIVE_VERSION}"-bin/* "${HIVE_HOME}" && \
    curl -L "https://archive.apache.org/dist/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz" | tar zxf - && \
    mv hadoop-"${HADOOP_VERSION}"/* "${HADOOP_HOME}" && \
    apt-get -y --no-install-recommends install  openssl=1.1.1n-0+deb11u3 libssl1.1=1.1.1n-0+deb11u3 libexpat1=2.2.10-2+deb11u5 && \
    apt-get -y --no-install-recommends install  libk5crypto3=1.18.3-6+deb11u3 libkrb5-3=1.18.3-6+deb11u3 libsqlite3-0=3.34.1-3 && \
    rm "${HIVE_HOME}/lib/postgresql-9.4.1208.jre7.jar" && \
    curl -o "${HIVE_HOME}/lib/postgresql-42.2.25.jre7.jar" -L https://jdbc.postgresql.org/download/postgresql-42.2.25.jre7.jar && \
    curl -o "${HIVE_HOME}/lib/hadoop-aws-${HADOOP_VERSION}.jar" -L https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-aws/${HADOOP_VERSION}/hadoop-aws-${HADOOP_VERSION}.jar && \
    curl -o "${HIVE_HOME}/lib/aws-java-sdk-bundle-1.12.262.jar" -L https://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-bundle/1.12.262/aws-java-sdk-bundle-1.12.262.jar && \
    apt-get clean && \
    rm -rf "/var/lib/apt/lists/*"

# Remove vulnerable Log4j version and install latest
ARG LOG4J_VERSION=2.17.1
ARG LOG4J_LOCATION="https://repo1.maven.org/maven2/org/apache/logging/log4j"
RUN \
    rm -f "${HADOOP_HOME}/share/hadoop/common/lib/slf4j-log4j12*" && \
    rm -f "${HADOOP_HOME}/share/hadoop/common/lib/log4j*" && \
    rm -f "${HADOOP_HOME}/share/hadoop/hdfs/lib/log4j*" && \
    rm -f "${HADOOP_HOME}/share/hadoop/yarn/hadoop-yarn-applications-catalog-webapp-3.3.1.war" && \
    rm -f "${HIVE_HOME}/lib/log4j-*" && \
    curl -o "${HIVE_HOME}/lib/log4j-1.2-api-${LOG4J_VERSION}.jar" "${LOG4J_LOCATION}/log4j-1.2-api/${LOG4J_VERSION}/log4j-1.2-api-${LOG4J_VERSION}.jar"  && \
    curl -o "${HIVE_HOME}/lib/log4j-api-${LOG4J_VERSION}.jar" "${LOG4J_LOCATION}/log4j-api/${LOG4J_VERSION}/log4j-api-${LOG4J_VERSION}.jar" && \
    curl -o "${HIVE_HOME}/lib/log4j-core-${LOG4J_VERSION}.jar" "${LOG4J_LOCATION}/log4j-core/${LOG4J_VERSION}/log4j-core-${LOG4J_VERSION}.jar" && \
    curl -o "${HIVE_HOME}/lib/log4j-slf4j-impl-${LOG4J_VERSION}.jar" "${LOG4J_LOCATION}/log4j-slf4j-impl/${LOG4J_VERSION}/log4j-slf4j-impl-${LOG4J_VERSION}.jar"


#COPY conf ${HIVE_HOME}/conf
COPY scripts/entrypoint.sh "${HIVE_HOME}/entrypoint.sh"

# imagebuilder expects the directory to be created before VOLUME
# hadolint ignore=SC2046
RUN mkdir -p /var/lib/hive /.beeline "${HOME}/.beeline" && \
# to allow running as non-root
    chown -R 1002:0 "${HIVE_HOME}" "${HADOOP_HOME}" /var/lib/hive /.beeline "${HOME}/.beeline" /etc/passwd $(readlink -f "${JAVA_HOME}"/lib/security/cacerts) && \
    chmod -R u+rwx,g+rwx "${HIVE_HOME}" "${HADOOP_HOME}" /var/lib/hive /.beeline "${HOME}/.beeline" /etc/passwd $(readlink -f "${JAVA_HOME}"/lib/security/cacerts) && \
    chown 1002:0 "${HIVE_HOME}/entrypoint.sh" && chmod +x "${HIVE_HOME}/entrypoint.sh"

WORKDIR $HIVE_HOME
EXPOSE 9083

ENTRYPOINT ["/bin/sh", "-c", "/opt/hive/entrypoint.sh"]
