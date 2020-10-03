FROM node:12-alpine
WORKDIR /projects/databases
COPY package*.json ./
RUN npm install 
COPY . .
CMD [ "node", "index.js" ]