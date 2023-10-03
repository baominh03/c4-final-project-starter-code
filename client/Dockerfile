FROM node:14.20.1-alpine3.16 AS build
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm ci
# Bundle app source
COPY . .
RUN npm run build
## Run 
FROM nginx:alpine
#COPY www /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build  /usr/src/app/build /usr/share/nginx/html