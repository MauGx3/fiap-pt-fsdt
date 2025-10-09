FROM node:lts-alpine
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm pkg delete scripts.prepare
RUN if [ "$NODE_ENV" = "production" ]; then \
    npm install --production || npm install --legacy-peer-deps --production; \
    else \
    npm install --include=dev || npm install --legacy-peer-deps --include=dev; \
    fi
COPY . .
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["node", "index.js"]
