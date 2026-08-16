const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');

// Same mockable-against-localstack approach as sns.js.
const SES_ENDPOINT = process.env.SES_ENDPOINT || 'http://localhost:4566';
const FROM_ADDRESS = process.env.SES_FROM_ADDRESS || 'noreply@ce-platform.local';
const TO_ADDRESS = process.env.SES_TO_ADDRESS || 'admin@ce-platform.local';

const client = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: SES_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
});

// Real trigger: fired once a record has been indexed into Elasticsearch
// and its SNS event published, notifying an operator by email.
async function sendRecordIndexedEmail(record) {
  const command = new SendEmailCommand({
    Source: FROM_ADDRESS,
    Destination: { ToAddresses: [TO_ADDRESS] },
    Message: {
      Subject: { Data: `New record indexed: ${record.title}` },
      Body: {
        Text: {
          Data: `Record ${record.id} ("${record.title}") was created and indexed into Elasticsearch at ${record.createdAt}.`,
        },
      },
    },
  });

  await client.send(command);
  console.log(`[service-b][ses] sent notification email for record ${record.id}`);
}

module.exports = { client, sendRecordIndexedEmail, SES_ENDPOINT };
