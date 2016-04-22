FROM index.alauda.cn/library/node:4.4.0

RUN mkdir -p /data/app

VOLUME /data/app

ADD ./ /data/app

COPY ./package.json /data/

WORKDIR /data

RUN npm install -g cnpm --registry=https://registry.npm.taobao.org

RUN cnpm i

ENV PATH /data/node_modules/.bin:$PATH

ENV NODE_PATH /data/node_modules

WORKDIR /data/app

RUN cnpm run build
