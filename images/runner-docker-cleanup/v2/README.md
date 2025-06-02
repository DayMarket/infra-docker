# Dockerfile that makes docker prune on runner with container definition

Docker container that runs cronjob with `docker system prune -f` at `0 0 1 * * /usr/scheduler/cleanup.sh`.

Usage of the container can be explored in the [docker-compose.yaml](./docker-compose.yaml)

Useful links:

- <https://levelup.gitconnected.com/cron-docker-the-easiest-job-scheduler-youll-ever-create-e1753eb5ea44>
