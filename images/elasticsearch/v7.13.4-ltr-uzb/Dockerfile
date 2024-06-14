ARG ES_VERSION=7.13.4
FROM docker.elastic.co/elasticsearch/elasticsearch:${ES_VERSION}

ARG ES_VERSION=7.13.4

# install jmorphy2 
RUN elasticsearch-plugin install --batch \
  https://github.com/anti-social/jmorphy2/releases/download/v0.2.2-es${ES_VERSION}/analysis-jmorphy2-0.2.2-es${ES_VERSION}.zip && \
  # install Learning to Rank
  elasticsearch-plugin install --batch \
  https://github.com/o19s/elasticsearch-learning-to-rank/releases/download/v1.5.7-es7.13.4/ltr-plugin-v1.5.7-es7.13.4.zip && \
  # install s3 plugin
  elasticsearch-plugin install --batch repository-s3 

COPY config/hunspell /usr/share/elasticsearch/config/hunspell
