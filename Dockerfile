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




ENV AWS_TMP_ACCESS_KEY="$AWS_TMP_ACCESS_KEY"
ENV AWS_TMP_SECRET_KEY="$AWS_TMP_SECRET_KEY"

ENV AWS_HLS_ACCESS_KEY="$AWS_HLS_ACCESS_KEY"
ENV AWS_HLS_SECRET_KEY="$AWS_HLS_SECRET_KEY"

ENV AWS_TMP_BUCKET_NAME="$AWS_TMP_BUCKET_NAME"
ENV AWS_TMP_BUCKET_REGION="$AWS_TMP_BUCKET_REGION"

ENV AWS_HLS_BUCKET_NAME="$AWS_HLS_BUCKET_NAME"
ENV AWS_HLS_BUCKET_REGION="$AWS_HLS_BUCKET_REGION"


ENV INPUT_KEY="$INPUT_KEY"




CMD [ "node", "src/script.js" ]