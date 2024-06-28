const { exec } = require("child_process");
const path = require("path");

const { downloadInChunks } = require("./download")
const { uploadFolder } = require("./upload");
const { sendSuccessMessage, sendFailurMessage } = require("./queue");
const { getFfmpegCommand } = require('./ffmpeg');



async function main(key = process.env.INPUT_KEY) {

    //Download the video
    console.log("Starting to download the video.....");
    await downloadInChunks();
    console.log("Download complete");

    console.log("Starting to transcode the video to various hls formate.....");


    //paths of the files in the local machine for ffmpeg
    const input_path = path.join(__dirname, `../video/${key}`);
    const output_path = path.join(__dirname, "../video/outputs");
    const ffmpegCmd = getFfmpegCommand(input_path, output_path);
    const c = exec(ffmpegCmd)

    c.stdout.on('data', (data) => {
        console.log(data.toString())
    })

    c.stderr.on('error', async (data) => {
        console.log("Sending to failure queue......");
        await sendFailurMessage(key);
        console.log("Send to failure queue successfully.");
        console.log(data.toString())
    })

    c.on('close', async () => {
        console.log("Video transcode complete");

        try {
            //upload the hlst to s3
            console.log("Starting to upload the hls formate to aws s3.....");
            await uploadFolder()
            console.log("Upload the hls formate to aws s3 is done.");

            //send success meassage
            console.log("Sending to success queue......");
            await sendSuccessMessage(key);
            console.log("Send to success queue successfully.");

        } catch (error) {
            //send failed message
            console.log("Sending to failure queue......");
            await sendFailurMessage(key)
            console.log("Send to failure queue successfully.");

            //log error
            console.log(error);
        }

    })


}



main();




