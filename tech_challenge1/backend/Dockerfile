FROM node:lts-slim
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Install build dependencies for native modules like bcrypt
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm pkg delete scripts.prepare
RUN npm config set strict-ssl false && npm config set unsafe-perm true && npm install --omit=dev --legacy-peer-deps || \
    (export NODE_TLS_REJECT_UNAUTHORIZED=0 && npm install --omit=dev --legacy-peer-deps)
COPY . .
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["node", "index.js"]
