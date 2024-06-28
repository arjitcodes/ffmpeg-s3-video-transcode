const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');


const sqsClient = new SQSClient({
    region: process.env.SQS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_SQS_USER_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SQS_USER_SECRET_ACCESS_KEY
    }
})


const successSqsUri = process.env.SUCCESS_QUEUE_URI;
const failureSqsUri = process.env.FAILURE_QUEUE_URI;


const sendMeaage = async (sqsUri, messageBody) => {
    const cmd = new SendMessageCommand({
        QueueUrl: sqsUri,
        MessageBody: messageBody,
    })

    const response = await sqsClient.send(cmd)
    console.log(response);
    return response;
}

const sendSuccessMessage = async (messageBody) => {
    const response = await sendMeaage(successSqsUri, messageBody);
    return response;
}


const sendFailurMessage = async (messageBody) => {
    const response = await sendMeaage(failureSqsUri, messageBody);
    return response;
}


module.exports = { sendSuccessMessage, sendFailurMessage };

