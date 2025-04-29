FROM apache/superset:4.0.3
USER root
COPY requirements.txt /additional_requirements.txt
RUN  pip install --no-cache --no-cache-dir -r /additional_requirements.txt
COPY custom/uzum.png /app/superset/static/assets/images/uzum.png
USER superset
