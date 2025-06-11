#!/bin/sh
# Целимся в следующую версию HMS
export HADOOP_CLASSPATH=${HADOOP_HOME}
export HIVE_OPTS="${HIVE_OPTS} --hiveconf metastore.root.logger=${HIVE_LOGLEVEL},console "
export PATH=${HIVE_HOME}/bin:${HADOOP_HOME}/bin:$PATH

set -e
if schematool -dbType $DB_TYPE -info -verbose; then
    echo "Hive metastore schema verified."
else
    if schematool -dbType $DB_TYPE -initSchema -verbose; then
        echo "Hive metastore schema created."
    else
        echo "Error creating hive metastore: $?"
    fi
fi

hive --service metastore
