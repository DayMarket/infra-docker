FROM spark:3.5.6-scala2.12-java17-ubuntu AS base

USER root
ENV SPARK_HOME=${SPARK_HOME:-"/opt/spark"}
ENV SPARK_VERSION=3.5.6

RUN apt-get update; \
    apt-get install  -y  --no-install-recommends python3.10 python3-psutil pip curl sudo unzip vim; \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p ${SPARK_HOME} \
 && curl https://dlcdn.apache.org/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop3.tgz -o spark-${SPARK_VERSION}-bin-hadoop3.tgz \
 && tar xvzf spark-${SPARK_VERSION}-bin-hadoop3.tgz --directory /opt/spark --strip-components 1 \
 && rm -rf spark-${SPARK_VERSION}-bin-hadoop3.tgz
USER spark

FROM base AS pydeps
USER root
ENV SPARK_HOME=${SPARK_HOME:-"/opt/spark"}
WORKDIR ${SPARK_HOME}
COPY ./requirements ${SPARK_HOME}/requirements
SHELL ["/bin/bash", "-eo", "pipefail", "-c"]
RUN  curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10 \
&& python3.10 - m pip install uv && python3.10 -m pip cache purge
CMD ["uv pip install -r ${SPARK_HOME}/requirements --system"]
USER spark

FROM pydeps

USER root

ENV SPARK_VERSION=3.5.6
ENV SPARK_MAJOR_VERSION=3.5
ENV ICEBERG_VERSION=1.9.0
ENV AWS_SDK_VERSION=1.12.262
ENV HADOOP_AWS_VERSION=3.3.4

RUN curl -s https://repo1.maven.org/maven2/org/apache/iceberg/iceberg-spark-runtime-${SPARK_MAJOR_VERSION}_2.12/${ICEBERG_VERSION}/iceberg-spark-runtime-${SPARK_MAJOR_VERSION}_2.12-${ICEBERG_VERSION}.jar -Lo /opt/spark/jars/iceberg-spark-runtime-${SPARK_MAJOR_VERSION}_2.12-${ICEBERG_VERSION}.jar \
&& curl -s https://repo1.maven.org/maven2/org/apache/iceberg/iceberg-aws-bundle/${ICEBERG_VERSION}/iceberg-aws-bundle-${ICEBERG_VERSION}.jar -Lo /opt/spark/jars/iceberg-aws-bundle-${ICEBERG_VERSION}.jar \
&& curl -s https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-aws/${HADOOP_AWS_VERSION}/hadoop-aws-${HADOOP_AWS_VERSION}.jar -Lo /opt/spark/jars/hadoop-aws-${HADOOP_AWS_VERSION}.jar \
&& curl -s https://repo1.maven.org/maven2/org/apache/spark/spark-avro_2.12/${SPARK_VERSION}/spark-avro_2.12-${SPARK_VERSION}.jar -Lo /opt/spark/jars/spark-avro_2.12-${SPARK_VERSION}.jar \
&& curl -s https://repo1.maven.org/maven2/org/apache/spark/spark-sql-kafka-0-10_2.12/${SPARK_VERSION}/spark-sql-kafka-0-10_2.12-${SPARK_VERSION}.jar -Lo /opt/spark/jars//spark-sql-kafka-0-10_2.12-${SPARK_VERSION}.jar \
&& curl -s https://repo1.maven.org/maven2/org/apache/spark/spark-streaming-kafka-0-10_2.12/${SPARK_VERSION}/spark-streaming-kafka-0-10_2.12-${SPARK_VERSION}.jar -Lo /opt/spark/jars/spark-streaming-kafka-0-10_2.12-${SPARK_VERSION}.jar \
&& curl  -s  https://repo1.maven.org/maven2/io/prometheus/jmx/jmx_prometheus_javaagent/0.11.0/jmx_prometheus_javaagent-0.11.0.jar -Lo /opt/spark/jars/jmx_prometheus_javaagent-0.11.0.jar


RUN chmod u+x /opt/spark/*

USER spark
WORKDIR /opt

ENTRYPOINT ["entrypoint.sh"]