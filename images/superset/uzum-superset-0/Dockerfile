FROM apache/superset

SHELL ["/bin/bash", "-o", "pipefail", "-c"]

USER root

COPY custom/public_welcome.html /app/superset/templates/superset/
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
COPY custom/favicon.png /app/superset/static/assets/images/favicon.png
COPY requirements.txt /additional_requirements.txt
RUN pip install --no-cache-dir -r /additional_requirements.txt
USER superset

CMD ["/usr/bin/run-server.sh"]
