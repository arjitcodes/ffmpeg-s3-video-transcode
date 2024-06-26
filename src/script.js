const path = require("path");

const { exec } = require("child_process")

const { downloadInChunks } = require("./download")
const { uploadFolder } = require("./upload")



async function main(key = process.env.INPUT_KEY) {

    const input_path = path.join(__dirname, `../video/${key}`)
    const output_path = path.join(__dirname, "../video/outputs")

    console.log("Starting to download the video.....")

    await downloadInChunks();

    console.log("Download complete")


    console.log("Starting to transcode the video to various hls formate.....")

    const c = exec(`ffmpeg -y -i ${input_path} -preset slow -g 48 -sc_threshold 0 -map 0:0 -map 0:1 -map 0:0 -map 0:1 -map 0:0 -map 0:1 -map 0:0 -map 0:1 -map 0:0 -map 0:1 -s:v:0 1920x1080 -b:v:0 1800k -s:v:1 1280x720 -b:v:1 1200k -s:v:2 858x480 -b:v:2 750k -s:v:3 630x360 -b:v:3 550k -s:v:4 256x144 -b:v:4 200k -c:v libx264 -c:a aac -var_stream_map "v:0,a:0,name:1080p v:1,a:1,name:720p v:2,a:2,name:480p v:3,a:3,name:360p v:4,a:4,name:144p" -master_pl_name master.m3u8 -f hls -hls_time 10 -hls_playlist_type vod -hls_list_size 0 -hls_segment_filename "${output_path}/%vsegment%d.ts" ${output_path}/%vindex.m3u8`)

    c.stdout.on('data', (data) => {
        console.log(data.toString())
    })

    c.stderr.on('error', (data) => {
        console.log(data.toString())
    })

    c.on('close', async () => {
        console.log("Video transcode complete");
        console.log("Starting to upload the hls formate to aws s3.....");
        try {
            await uploadFolder()
            console.log("Upload the hls formate to aws s3 is done.");

        } catch (error) {
            console.log(error)
        }

    })


}



main();




