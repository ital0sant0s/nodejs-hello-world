FROM node:12

ENV DB_HOST=DBHOST \
    DB_USER=DBUSER \ 
    DB_PASSWORD=DB_PASSWORD \
    DB_NAME=DB_NAME

WORKDIR /app/

COPY ./app/  /app/

RUN npm install

EXPOSE 3000

CMD [ "node", "server.js" ]