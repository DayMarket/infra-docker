FROM maven:3.9.4-amazoncorretto-21-debian
RUN apt-get update \
    && apt-get -y install openssh-client git \
    && apt-get clean
ADD settings.xml /usr/share/maven/conf/
