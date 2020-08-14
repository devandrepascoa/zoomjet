FROM node:9-slim
WORKDIR /zoomjet
COPY package.json /zoomjet
RUN npm install
COPY . /zoomjet
CMD ["npm","start"]