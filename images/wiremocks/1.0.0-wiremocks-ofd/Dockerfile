FROM wiremock/wiremock:3.8.0

# Copy custom extensions
COPY extensions/wiremock-js-runtime-standalone.jar /var/wiremock/extensions/

# Copy mappings
COPY mappings/ /home/wiremock/mappings/

# Copy files (JavaScript transformers)
COPY files/ /home/wiremock/files/

# Set environment variable for WireMock options
ENV WIREMOCK_OPTIONS="-extensions com.uzum.market.wiremock.extention.JsRuntime --verbose"

# Expose WireMock default port
EXPOSE 8080

# Start WireMock with custom extensions and verbose logging
CMD ["--extensions", "com.uzum.market.wiremock.extention.JsRuntime", "--verbose"]
