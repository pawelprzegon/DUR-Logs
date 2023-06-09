FROM python:3.10.4-slim-buster
ENV PYTHONUNBUFFERED=1
# RUN apk update && apk add postgresql-dev gcc python3-dev musl-dev
ENV PYTHONUNBUFFERED=1
WORKDIR /app
RUN mkdir -p /app/volumes
ENV PYTHONIOENCODING=utf-8
RUN apt-get update && apt-get install -y locales && locale-gen en_US.UTF-8
RUN ["apt-get", "update"]
RUN ["apt-get", "-y", "install", "nano"]
RUN ["apt-get", "-y",  "install", "-f",  "mdbtools"]
RUN ["apt-get", "-y",  "install",  "cron"]
COPY requirements.txt requirements.txt
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt
COPY . /app
EXPOSE 8000