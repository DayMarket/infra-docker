FROM spark:3.5.6-scala2.12-java17-ubuntu as base

USER root

RUN set -ex; \
    apt-get update; \
    apt-get install -y python3.10 python3-psutil pip curl sudo unzip vim; \
    rm -rf /var/lib/apt/lists/*

FROM base as pydeps
COPY requirements .

RUN curl -sS https://bootstrap.pypa.io/get-pip.py | python3.10 \
&& python3.10 - m pip install uv && python3.10 -m pip cache purge
CMD uv pip install -r requirements

FROM pydeps

ENV SPARK_VERSION=3.5.6
ENV SPARK_MAJOR_VERSION=3.5
ENV ICEBERG_VERSION=1.9.0
ENV AWS_SDK_VERSION=1.12.262
ENV HADOOP_AWS_VERSION=3.3.4
ENV SPARK_HOME=${SPARK_HOME:-"/opt/spark"}


RUN curl -s https://repo1.maven.org/maven2/org/apache/iceberg/iceberg-spark-runtime-${SPARK_MAJOR_VERSION}_2.12/${ICEBERG_VERSION}/iceberg-spark-runtime-${SPARK_MAJOR_VERSION}_2.12-${ICEBERG_VERSION}.jar -Lo /opt/spark/jars/iceberg-spark-runtime-${SPARK_MAJOR_VERSION}_2.12-${ICEBERG_VERSION}.jar \
&& curl -s https://repo1.maven.org/maven2/org/apache/iceberg/iceberg-aws-bundle/${ICEBERG_VERSION}/iceberg-aws-bundle-${ICEBERG_VERSION}.jar -Lo /opt/spark/jars/iceberg-aws-bundle-${ICEBERG_VERSION}.jar \
&& curl -s https://repo1.maven.org/maven2/org/apache/spark/spark-avro_2.12/${SPARK_VERSION}/spark-avro_2.12-${SPARK_VERSION}.jar -Lo /opt/spark/jars/spark-avro_2.12-${SPARK_VERSION}.jar
RUN chmod u+x /opt/spark/*

