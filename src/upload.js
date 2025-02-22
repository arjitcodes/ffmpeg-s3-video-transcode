const fs = require("fs").promises;
const path = require("path");

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");


const folderPath = path.join(__dirname, "../video/outputs");

const s3Dir = process.env.INPUT_KEY.split('.')[0]

const outputS3Client = new S3Client({
    region: process.env.TARGET_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.TARGET_ACCESS_KEY,
        secretAccessKey: process.env.TARGET_SECRET_KEY
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

    try {

        const files = await fs.readdir(folderPath);

        if (!files || files.length === 0) {
            console.log(`${folderPath} folder is empty or does not exist.`);
            throw Error(`${folderPath} folder is empty or does not exist.`);
        }

        for (const fileName of files) {

            const filePath = path.join(folderPath, fileName);

            const fileStats = await fs.lstat(filePath);
            if (fileStats.isDirectory()) {
                continue;
            }

            const fileContent = await fs.readFile(filePath)
            if (!fileContent) {
                throw Error(`Error to read file content ${filePath}`)
            }
            await uploadFile(bucket, fileName, fileContent);

        }


    } catch (error) {
        throw error;
    }
}



module.exports = { uploadFolder };