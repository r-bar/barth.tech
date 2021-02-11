FROM ubuntu:20.04
ARG ZOLA_VERSION=0.10.1
RUN apt-get update && apt-get install -y \
  libssl1.1 \
  python3 \
  python3-requests \
  make \
  wget \
  ;
WORKDIR /tmp
ADD https://github.com/getzola/zola/releases/download/v${ZOLA_VERSION}/zola-v${ZOLA_VERSION}-x86_64-unknown-linux-gnu.tar.gz ./
RUN tar xfz zola-v${ZOLA_VERSION}-x86_64-unknown-linux-gnu.tar.gz && mv zola /usr/local/bin
RUN mkdir /app
WORKDIR /app
COPY . .
RUN make build

FROM nginx:alpine
COPY --from=0 /app/public/ /var/www/
COPY nginx.conf /etc/nginx/conf.d/default.conf
