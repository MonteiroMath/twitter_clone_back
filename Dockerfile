FROM node:18-alpine

WORKDIR /twitterb
COPY package.json .
RUN npm install
#COPY . .

CMD ["npm", "run", "dev"]
#CMD [ "npm", "start" ]
