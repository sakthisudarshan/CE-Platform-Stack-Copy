const { SNSClient, CreateTopicCommand, PublishCommand } = require('@aws-sdk/client-sns');

// Points at localstack by default so the platform builds/runs without
// real AWS credentials. Swap SNS_ENDPOINT (and drop it) to hit real SNS.
const SNS_ENDPOINT = process.env.SNS_ENDPOINT || 'http://localhost:4566';
const TOPIC_NAME = 'record-created';

const client = new SNSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: SNS_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
});

let topicArn = null;

async function ensureTopic() {
  const { TopicArn } = await client.send(new CreateTopicCommand({ Name: TOPIC_NAME }));
  topicArn = TopicArn;
  console.log(`[service-b][sns] topic ready: ${topicArn}`);
  return topicArn;
}

async function publishRecordCreated(record) {
  if (!topicArn) await ensureTopic();
  await client.send(
    new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify({ type: 'record.created', record }),
      MessageAttributes: {
        eventType: { DataType: 'String', StringValue: 'record.created' },
      },
    }),
  );
  console.log(`[service-b][sns] published record.created for ${record.id}`);
}

module.exports = { client, ensureTopic, publishRecordCreated, SNS_ENDPOINT, TOPIC_NAME };
