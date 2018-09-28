FROM node:8-alpine as app

COPY . /app
WORKDIR /app

RUN npm ci && npm run generate

# run server
FROM nginx:1.14-alpine
COPY --from=app /app/dist /app
COPY nginx.conf /etc/nginx/conf.d/default.conf
