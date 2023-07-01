FROM python:3.10.4-slim-buster
ENV PYTHONUNBUFFERED=1

# Set environment variables
ENV USER_NAME=duruser
ENV USER_PASSWORD=duruser
ENV PYTHONIOENCODING=utf-8


# Create a new user
RUN useradd -m ${USER_NAME} && \
    echo "${USER_NAME}:${USER_PASSWORD}" | chpasswd && \
    usermod -aG sudo ${USER_NAME}

# Update the package lists and install sudo
RUN apt-get update && apt-get install -y sudo
RUN apt-get update && apt-get install -y locales && locale-gen en_US.UTF-8
RUN ["apt-get", "-y", "install", "nano"]
RUN ["apt-get", "-y",  "install", "-f",  "mdbtools"]
RUN ["apt-get", "-y",  "install",  "cron"]

#create server app directory and copy app
RUN mkdir back
WORKDIR /back
RUN mkdir volumes
COPY . .

RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt
EXPOSE 8000

# Set the user as the default
USER ${USER_NAME}

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]