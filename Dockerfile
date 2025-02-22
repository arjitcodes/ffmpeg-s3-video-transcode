FROM ubuntu:24.04


RUN  /usr/bin/apt-get update 
RUN  /usr/bin/apt-get install -y curl 
RUN   curl -sL https://deb.nodesource.com/setup_18.x | bash - 
RUN   /usr/bin/apt-get update 
RUN   /usr/bin/apt-get upgrade -y 
RUN   /usr/bin/apt-get install -y nodejs ffmpeg


WORKDIR /home/app



COPY src src
COPY package*.json .

RUN npm install

RUN mkdir -p video/outputs


RUN chmod +x src/script.js




ENV SOURCE_ACCESS_KEY="$SOURCE_ACCESS_KEY"
ENV SOURCE_SECRET_KEY="$SOURCE_SECRET_KEY"

ENV TARGET_ACCESS_KEY="$TARGET_ACCESS_KEY"
ENV TARGET_SECRET_KEY="$TARGET_SECRET_KEY"

ENV SOURCE_BUCKET_NAME="$SOURCE_BUCKET_NAME"
ENV SOURCE_BUCKET_REGION="$SOURCE_BUCKET_REGION"

ENV TARGET_BUCKET_NAME="$TARGET_BUCKET_NAME"
ENV TARGET_BUCKET_REGION="$TARGET_BUCKET_REGION"


ENV INPUT_KEY="$INPUT_KEY"




CMD [ "node", "src/script.js" ]