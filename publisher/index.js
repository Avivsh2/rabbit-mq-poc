/// File: publisher/index.js
const amqp = require("amqplib");
const express = require("express");
const app = express();
app.use(express.json());

const QUEUE = "transactions";
let channel;

const balances = {}; // in-memory balances

async function connect() {
    const connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE);
    console.log("Connected to RabbitMQ");
}

app.post("/deposit", async (req, res) => {
    const { userId, amount } = req.body;
    const event = { type: "deposit", userId, amount };
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(event)));
    res.send({ status: "Deposit event sent" });
});

connect().then(() => {
    app.listen(3000, () => console.log("API server on port 3000"));
});
