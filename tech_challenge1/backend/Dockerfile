FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm pkg delete scripts.prepare
RUN npm install --production || npm install --legacy-peer-deps --production
COPY . .
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["node", "index.js"]
