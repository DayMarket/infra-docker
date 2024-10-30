FROM python:3.8-slim-buster
LABEL maintainer="Borgalinov Timur <borgalinov@gmail.com>"
RUN addgroup --system appgroup && \
    adduser --system appuser --ingroup appgroup && \
    pip install --no-cache-dir click==8.1.3 jira==3.5.0 PyGithub==1.58.1 && \
    pip install --upgrade google-auth google-auth-oauthlib google-auth-httplib2 google-api-python-client google-analytics-data && \
    pip install slack_sdk

USER appuser

# Set the command to run when the container starts
ENTRYPOINT ["python"]
