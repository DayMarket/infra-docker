FROM python:3.11
ENV PYTHONUNBUFFERED 1

WORKDIR /tmp
RUN git clone https://github.com/edenhill/librdkafka.git
WORKDIR /tmp/librdkafka
RUN ./configure --prefix=/usr  \
    && make  \
    && make install
RUN rm -rf /tmp/librdkafka 