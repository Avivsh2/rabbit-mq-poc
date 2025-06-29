/// File: consumer/index.js
const amqp = require("amqplib");

const QUEUE = "transactions";
const balances = {}; // same idea, different process in real systems

async function startConsumer() {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE);
    console.log("Consumer connected to RabbitMQ");

    channel.consume(QUEUE, (msg) => {
        if (msg !== null) {
            const event = JSON.parse(msg.content.toString());
            const { type, userId, amount } = event;

            if (!balances[userId]) balances[userId] = 0;

            if (type === "deposit") {
                balances[userId] += amount;
                console.log(
                    `Deposited ${amount} to ${userId}. New balance: ${balances[userId]}`
                );
            }

            channel.ack(msg);
        }
    });
}

startConsumer();
