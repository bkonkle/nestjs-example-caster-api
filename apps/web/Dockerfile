FROM node:alpine

RUN mkdir -p /opt/app
RUN apk add --no-cache libc6-compat

ENV NODE_ENV production
ENV PORT 4000

EXPOSE 4000

WORKDIR /opt/app

COPY package.json /opt/app
COPY yarn.lock /opt/app

RUN yarn install --no-optional

COPY . /opt/app

RUN yarn build
RUN npx next telemetry disable

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

CMD [ "yarn", "start" ]
