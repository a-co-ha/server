FROM node:16-alpine3.11
RUN apk update && apk add git
# Set the timezone in docker
RUN apk --no-cache add tzdata && \
        cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
        echo "Asia/Seoul" > /etc/timezone

# Create Directory for the Container
RUN mkdir /app
WORKDIR /app
# Only copy the package.json file to work directory
COPY package.json /app/package.json
RUN yarn install --ignore-engines
COPY . /app

# Docker Demon Port Mapping
EXPOSE 3000
