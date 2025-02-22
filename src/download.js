const { createWriteStream } = require("fs");
const path = require("path");
const oneMB = 1024 * 1024;

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");


function isDownloadComplete({ end, length }) {
    return end === length - 1;
}


const inputS3Client = new S3Client({
    region: process.env.SOURCE_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.SOURCE_ACCESS_KEY,
        secretAccessKey: process.env.SOURCE_SECRET_KEY
    }
})

const getVideoRange = async ({ bucket, key, start, end }) => {
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
        Range: `bytes=${start}-${end}`,
    });

    return await inputS3Client.send(command)

}

const getRangeAndLength = (contentRange) => {
    const [range, length] = contentRange.split("/");
    const [start, end] = range.split("-");
    return {
        start: parseInt(start),
        end: parseInt(end),
        length: parseInt(length),
    };

}




async function downloadInChunks(bucket = process.env.AWS_TMP_BUCKET_NAME, key = process.env.INPUT_KEY) {

    const inputPath = path.join(__dirname, `../video/${key}`);
    const writeStream = createWriteStream(inputPath);
    let rangeAndLength = { start: -1, end: -1, length: -1 };

    try {

        while (!isDownloadComplete(rangeAndLength)) {
            const { end } = rangeAndLength;
            const nextRange = { start: end + 1, end: end + oneMB };

            console.log(`Downloading bytes ${nextRange.start} to ${nextRange.end}`);


            const { ContentRange, Body } = await getVideoRange({
                bucket,
                key,
                ...nextRange,
            });


            writeStream.write(await Body.transformToByteArray())
            rangeAndLength = getRangeAndLength(ContentRange)
        }



    } catch (error) {
        console.log(error)
    }

}




module.exports = { downloadInChunks }