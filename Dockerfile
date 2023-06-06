FROM node:latest 

WORKDIR /var/www/app

COPY . .

RUN npm install

CMD [ "npm","run","dev" ]