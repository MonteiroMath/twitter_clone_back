FROM node:18-alpine

WORKDIR /home/twitterb
COPY package.json .
RUN npm install
COPY . .
CMD [ "npm", "start" ]
