FROM node:14-slim
WORKDIR /node/app/
COPY ./package*.json ./
RUN npm install --registry=https://registry.npm.taobao.org
# COPY --chown=node:node . .
COPY ./ ./
EXPOSE 3000
CMD ["npm", "run", "start"]