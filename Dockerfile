FROM ubuntu:20.04
ARG ZOLA_VERSION=0.10.1
RUN apt-get update && apt-get install -y libssl1.1
RUN mkdir /app
WORKDIR /app
ADD https://github.com/getzola/zola/releases/download/v${ZOLA_VERSION}/zola-v${ZOLA_VERSION}-x86_64-unknown-linux-gnu.tar.gz ./
#RUN wget https://github.com/getzola/zola/releases/download/v${ZOLA_VERSION}/zola-v${ZOLA_VERSION}-x86_64-unknown-linux-gnu.tar.gz
RUN tar xfz zola-v${ZOLA_VERSION}-x86_64-unknown-linux-gnu.tar.gz
COPY . .
RUN ./zola build

FROM nginx:alpine
COPY --from=0 /app/public/ /var/www/
