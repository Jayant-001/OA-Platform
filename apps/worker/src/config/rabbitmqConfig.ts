export const rabbitmqConfig = {
    url: process.env.RABBITMQ_URL || 'amqps://fetwaplz:ageSwGx-cxuVhTqoWYmy7SW2u90gRxKs@puffin.rmq2.cloudamqp.com/fetwaplz'
,
    queues: {
        input: 'code-execution',
        output: 'execution-result'
    },
    exchange: 'code_execution_exchange'
};