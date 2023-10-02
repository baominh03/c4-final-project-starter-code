import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
// TODO: Implement the fileStogare logic
const logger = createLogger('AttachmentUtils') 

export class AttachmentUtils {
    constructor(
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration: number = parseInt(process.env.SIGNED_URL_EXPIRATION)
    ) { }

    async getSignedUrl(todoId: string): Promise<string> {
        const signedUrl = s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: this.urlExpiration
        })
        logger.info(`Signed url [${signedUrl}]  [${todoId}]`)
        return signedUrl
    }
}