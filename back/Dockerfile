FROM python:3.10.4-slim-buster
ENV PYTHONUNBUFFERED=1
RUN mkdir back
WORKDIR /back
RUN mkdir volumes
COPY . .
ENV PYTHONIOENCODING=utf-8
RUN apt-get update && apt-get install -y locales && locale-gen en_US.UTF-8
RUN ["apt-get", "update"]
RUN ["apt-get", "-y", "install", "nano"]
RUN ["apt-get", "-y",  "install", "-f",  "mdbtools"]
RUN ["apt-get", "-y",  "install",  "cron"]
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]