FROM node:8.17.0-alpine

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json* /app/
RUN npm install

COPY . /app/

# RUN node_modules/.bin/next build
CMD node_modules/.bin/next start
