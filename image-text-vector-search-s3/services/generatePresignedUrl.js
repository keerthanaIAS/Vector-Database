const s3 = require("../config/s3");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

async function generatePresignedUrl(fileName) {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: fileName
    });
    const signedUrl = await getSignedUrl(
        s3,
        command,
        {
            expiresIn: 3600
        }
    );
    return signedUrl;
}

module.exports = {
    generatePresignedUrl
};