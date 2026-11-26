FROM node:22-alpine
WORKDIR /app
COPY server.js .
ARG VERSION=dev
ENV VERSION=$VERSION
USER node
EXPOSE 8080
CMD ["node", "server.js"]
