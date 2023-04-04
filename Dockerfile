FROM node:slim

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV MODE "docker"

RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  apt-get install tor -y --no-install-recommends && \
  apt-get install torsocks -y --no-install-recommends && \
  apt-get install curl gnupg && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

RUN mkdir src
RUN mkdir tmp
COPY ./src ./src
COPY ./package.json \
  ./ecosystem.config.js \
  ./tsconfig.json \
  ./

RUN npm i -g pm2 npm@9.2.0
RUN npm i && npm run build

RUN rm -rf src


#HEALTHCHECK --start-period=150s --interval=300s --retries=99999 --timeout=120s CMD curl --fail http://localhost:3000/healthcheck || kill 1
HEALTHCHECK --interval=30s --timeout=30s --retries=3 CMD curl -sS 127.0.0.1:3000/healthcheck || exit 1

EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.config.js"]
