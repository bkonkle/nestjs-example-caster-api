FROM node:14-alpine
ARG DUMB_INIT=1.2.5
EXPOSE 4000
EXPOSE 9229

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY yarn.lock .
COPY ./dist/apps/api .
COPY ./node_modules/.prisma/client ./node_modules/.prisma/client

RUN chown node:node /usr/src/app && \
  yarn config set registry https://registry.npmjs.org && \
  # Install the dependencies in the generated package.json file
  yarn --frozen-lockfile --ignore-scripts --prefer-offline && \
  # Dependencies Nest.js needs that aren’t explicitly used
  yarn add reflect-metadata tslib rxjs @nestjs/platform-express json5

ADD https://github.com/Yelp/dumb-init/releases/download/v${DUMB_INIT}/dumb-init_${DUMB_INIT}_x86_64 /usr/local/bin/dumb-init

RUN chmod +x /usr/local/bin/dumb-init

USER node

ENTRYPOINT ["dumb-init", "--"]

CMD ["sh", "-c", "node ./main.js"]
