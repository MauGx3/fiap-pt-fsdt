FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Install build dependencies for native modules like bcrypt
RUN apk add --no-cache python3 make g++

COPY package*.json ./
# Remove the prepare script before installing
RUN npm pkg delete scripts.prepare
RUN npm install --production
COPY . .
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["node", "index.js"]
