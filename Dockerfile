FROM node:12.18.3-slim
WORKDIR /zoomjet
COPY package.json /zoomjet
RUN npm install
COPY . /zoomjet
CMD ["npm","start"]
EXPOSE 80 8443