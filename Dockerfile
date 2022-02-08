FROM node:12-alpine
MAINTAINER info@vizzuality.com

ENV NAME fw-teams
ENV USER fw-teams

RUN apk update && apk upgrade && \
    apk add --no-cache --update bash git openssh alpine-sdk

RUN addgroup $USER && adduser -s /bin/bash -D -G $USER $USER

RUN yarn global add grunt-cli bunyan

RUN mkdir -p /opt/$NAME
WORKDIR /opt/$NAME

COPY package.json .
COPY yarn.lock .
COPY ./app ./app
COPY ./config ./config

RUN chown -R $USER:$USER /opt/$NAME

# Tell Docker we are going to use this port
EXPOSE 3035
USER $USER

CMD ["sh", "-c", "yarn install && node app/index.js"]