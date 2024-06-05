FROM elastic/elasticsearch:8.8.2
# install plugins
RUN elasticsearch-plugin install --batch \
  https://github.com/KazanExpress/jmorphy2/releases/download/v0.2.6-es8.8.2/analysis-jmorphy2-0.2.6-es8.8.2.zip && \
  elasticsearch-plugin install --batch \
  https://github.com/o19s/elasticsearch-learning-to-rank/releases/download/v1.5.8-es8.8.2/ltr-plugin-v1.5.8-es8.8.2.zip && \
  # install s3 plugin
  elasticsearch-plugin install --batch repository-s3

COPY config/hunspell /usr/share/elasticsearch/config/hunspell
