const fs = require("fs");
const path = require("path");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");


const folderPath = path.join(__dirname, "../video/outputs");

const s3Dir=process.env.INPUT_KEY.split('.')[0]

const outputS3Client = new S3Client({
    region: process.env.AWS_HLS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.AWS_HLS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_HLS_SECRET_KEY
    }
})

const uploadFile = async (bucket, key, body) => {
    try {

        const cmd = new PutObjectCommand({
            Bucket: bucket,
            Key: `${s3Dir}/${key}`,
            Body: body
        })
        return await outputS3Client.send(cmd)

    } catch (error) {

        throw error;

    }

}


const uploadFolder = async (bucket = process.env.AWS_HLS_BUCKET_NAME) => {

    fs.readdir(folderPath, (error, files) => {

        if (!files || files.length === 0) {
            console.log(`${folderPath} folder is empty or does not exist.`);
            return;
        }

        for (const fileName of files) {

            const filePath = path.join(folderPath, fileName);

            if (fs.lstatSync(filePath).isDirectory()) {
                continue;
            }

            fs.readFile(filePath, async (error, fileContent) => {
                if (error) { throw error };
                try {
                    await uploadFile(bucket, fileName, fileContent);
                } catch (error) {
                    throw error;
                }
            })


        }

    })
}



module.exports = { uploadFolder };