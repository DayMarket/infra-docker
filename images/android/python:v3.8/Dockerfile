FROM python:3.8-slim-buster

LABEL maintainer="Borgalinov Timur <borgalinov@gmail.com>"

# Install required system packages, including git
RUN apt-get update && apt-get install -y --no-install-recommends \
    git && \
    addgroup --system appgroup && \
    adduser --system appuser --ingroup appgroup && \
    pip install --no-cache-dir \
    click==8.1.3 \
	toml==0.10.2 \
	requests==2.32.3 \
    jira==3.5.0 \
    PyGithub==1.58.1 \
    google-auth==2.35.0 \
    google-auth-oauthlib==1.2.1 \
    google-auth-httplib2==0.2.0 \
    google-api-python-client==2.149.0 \
    google-analytics-data==0.18.14 \
	atlassian-python-api==3.41.16 \
    slack_sdk==3.33.3

USER root

# Set the command to run when the container starts
ENTRYPOINT ["python"]