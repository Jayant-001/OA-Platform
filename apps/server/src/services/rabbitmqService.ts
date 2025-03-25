import amqp, { Channel, Connection } from 'amqplib';
import { rabbitmqConfig } from '../config/rabbitmqConfig';

class RabbitMQService {
    private connection?: Connection;
    private channel?: Channel;

    async initialize() {
        try {
            this.connection = await amqp.connect(rabbitmqConfig.url);
            this.channel = await this.connection.createChannel();

            // Assert exchanges and queues
            await this.channel.assertExchange(rabbitmqConfig.exchange, 'direct', { durable: true });
            
            await this.channel.assertQueue(rabbitmqConfig.queues.input, { durable: true });
            await this.channel.assertQueue(rabbitmqConfig.queues.output, { durable: true });

            // Bind queues to exchange
            await this.channel.bindQueue(rabbitmqConfig.queues.input, rabbitmqConfig.exchange, 'input');
            await this.channel.bindQueue(rabbitmqConfig.queues.output, rabbitmqConfig.exchange, 'output');

            console.log('RabbitMQ initialized successfully');
        } catch (error) {
            console.error('Failed to initialize RabbitMQ:', error);
            throw error;
        }
    }

    async publishToQueue(queue: string, message: any) {
        if (!this.channel) throw new Error('Channel not initialized');
        
        this.channel.publish(
            rabbitmqConfig.exchange,
            queue === rabbitmqConfig.queues.input ? 'input' : 'output',
            Buffer.from(JSON.stringify(message))
        );
    }

    async consumeQueue(queue: string, callback: (message: any) => Promise<void>) {
        if (!this.channel) throw new Error('Channel not initialized');

        await this.channel.consume(queue, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    await callback(content);
                    this.channel?.ack(msg);
                } catch (error) {
                    console.error('Error processing message:', error);
                    this.channel?.nack(msg);
                }
            }
        });
    }

    async close() {
        await this.channel?.close();
        await this.connection?.close();
    }
}

export default new RabbitMQService();