export const rabbitmqConfig = {
    url: process.env.RABBITMQ_URL || 'amqps://fetwaplz:ageSwGx-cxuVhTqoWYmy7SW2u90gRxKs@puffin.rmq2.cloudamqp.com/fetwaplz',
    queues: {
        input: process.env.INPUT_QUEUE || 'code-execution',
        output: process.env.OUTPUT_QUEUE || 'execution-result',
    },
    exchange: 'code_execution_exchange'
};