FROM alpine/helm:3.10.1 as helm

FROM alpine:3.16.2

RUN apk add --no-cache "bash>=5.1.16-r2" "curl>=7.83.1-r2" "tar>=1.34" "gzip>=1.12"

ENV K8S_VERSION=v1.22.15
ENV HELM_VERSION=v3.10.1

ENV HELM_FILENAME=helm-${HELM_VERSION}-linux-amd64.tar.gz

RUN curl -L https://storage.googleapis.com/kubernetes-release/release/${K8S_VERSION}/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl && chmod +x /usr/local/bin/kubectl

COPY --from=helm /usr/bin/helm /usr/bin/helm
