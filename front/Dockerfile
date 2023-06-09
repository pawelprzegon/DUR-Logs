FROM node:20-alpine3.16
RUN mkdir front
WORKDIR /front
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start"]
