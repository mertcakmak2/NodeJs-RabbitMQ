const amqp = require('amqplib/callback_api');
const cron = require('node-cron');

const queue = "queue1"

// assertQueue: Queue alınan datanın, harddisk’e yazılması engellenir.

function sendRabbitMQ(queueName, data) {
    amqp.connect('amqp://root:root@localhost:5672', function (conErr, connection) {
        if (conErr) console.log(conErr)

        connection.createChannel(function (err, channel) {
            if (err) throw err;
            channel.assertQueue(queueName, { durable: false });
            channel.sendToQueue(queueName, Buffer.from(data));
            console.log("Sent message: %s", data);
        });
        setTimeout(function () {
            connection.close();
        }, 500);
    });
}

amqp.connect('amqp://root:root@localhost:5672', function (conErr, connection) {
    if (conErr) throw conErr;
    connection.createChannel(function (err, channel) {
        if (err) throw err;
        channel.assertQueue(queue, { durable: false });
        channel.consume(queue, function (data) {
            console.log("Received message: " + data.content.toString())
        }, {
            noAck: true
        });
    });
});

cron.schedule("*/3 * * * * *", function () {
    sendRabbitMQ(queue, new Date().toString())
});
