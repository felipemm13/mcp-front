FROM node:14-alpine
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run","build" "&&","serve","-s","build","-l","3000"]