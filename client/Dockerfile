FROM node:latest

WORKDIR /app

COPY package.json /app

RUN yarn install

COPY . /app

EXPOSE 5173

CMD ["yarn", "dev", "--", "--host", "0.0.0.0"]