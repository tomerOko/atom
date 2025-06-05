FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY nodemon.json ./

RUN npm install
RUN npm install -g nodemon ts-node typescript tsconfig-paths

COPY . .

# Expose both the application port and the debug port
EXPOSE 3000 9229

# Use nodemon with the config file
CMD ["nodemon"] 