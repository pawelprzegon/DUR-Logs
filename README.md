# Printers statistics app

## Description

Printers statistics app project for printing house.\
Created to collect data from printing units, save them in the [database](https://github.com/pawelprzegon/DUR-DB.git) and create statistics and get prompts about maintenance.\
Database is a separated repository to build it independent

## Technologies

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)

## Documentation

Project based on docker containers.

- database container:\
   external repository [database](https://github.com/pawelprzegon/DUR-DB.git)
- API container:\
   build with [FastAPI](https://fastapi.tiangolo.com/).\
   I made 4 routers which coresponds with 4 different types printers on production.\
   With all of them we can update statistics using log files created by different software.\
   For all of them we can see usage during time and get prompt about maintenance.
  [FastAPI/docs](https://dur-logs-back.onrender.com/docs)

- Frontend container:\
   build with JavaScript and Node Express. \
   The case was to create one page app with dynamicly created content. \
   We have 4 links in navigation bar which represents printing units on production site.
  For each of them we can see raport how many square meters and ml each unit used under production.
  Using options inside menubar we can change some target which changes time when specify unit will inform us about delays with maintenance\
  or get us information that it reached her live end time.
  Working DEMO [Raport-app](https://dur-logs-front.onrender.com/) - patience is required to enter (free server)

## How to use

To run project localy we have to install [docker](https://www.docker.com/products/docker-desktop/) first.

Now clone repositories:

- for database

```
git clone https://github.com/pawelprzegon/DUR-DB.git
```

- for app

```
git clone https://github.com/pawelprzegon/DUR-Logs.git
```

### Default configuration

With current docker-compose.yml file:

- front runs on port: 3001
- back rins on port: 8001
- adminer for db runs on port: 8080
- app uses network created by database container named "database-net"
</p>

### Custom configuration

If you like to change ports:
change ports forwarding in docker-compose.yml file:

- if changed port for front, change "CORS_URL" environment url
- if changed port for back, change url variable inside "url.js" file
  (.\front\src\js\common_functions\endpoints.js)

If you like to use external database change "networks" section

```
version: "3.8"

services:
  front:
    container_name: units_FRONT
    build: ./front
    ports:
      - 3001:3000
    networks:
      - app-network
    volumes:
      - ./front:/front/

  back:
    container_name: units_BACK
    build: ./back
    restart: on-failure:10
    environment:
      - DATABASE_URL=postgresql+psycopg2://docker:docker@postgres:5432/logs
      - CORS_URL=http://localhost:3001
      - DB_TIMEOUT=30
    volumes:
      - ./back:/back/
      - /d/DATA:/back/volumes
    ports:
      - 8001:8000
    networks:
      - app-network

networks:
  app-network:
    external:
      name: database-net
```

## Build and release

After configuration to run app:

if you don't allready runs Docker Desktop - do it now.
Go to app cloned repository location:\
To build database container use command inside copied repository:

```
docker-compose up -d
```
