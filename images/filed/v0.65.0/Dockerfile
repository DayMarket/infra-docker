FROM golang:1.23.2 AS build
RUN mkdir /app
WORKDIR /app

RUN git clone --depth 1 --branch v0.65.0 https://github.com/ozontech/file.d.git

WORKDIR /app/file.d

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o file.d ./cmd/file.d && \
    cp ./file.d /file.d
    
FROM alpine:3.15.0

RUN mkdir /file.d
COPY --from=build /file.d /file.d/file.d

ENTRYPOINT [ "/file.d/file.d" ]
