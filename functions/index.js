const functions = require("firebase-functions");
const ethers = require('ethers');
const crypto = require('crypto');
const {PubSub} = require('@google-cloud/pubsub');
exports.genwallet = functions.pubsub.topic('genwallet-topic').onPublish(async (message) => {
    const id = crypto.randomBytes(32).toString('hex');
    const privateKey = "0x" + id;
    const wallet = new ethers.Wallet(privateKey);
    var addr = wallet.address;
    var bsc = "https://bsc-dataseed.binance.org/"
    const provider = new ethers.providers.JsonRpcProvider(bsc)
    const count = await provider.getTransactionCount(wallet.address);

    if (count > 0) {
        functions.logger.info("BINGOOO", {addr, privateKey, count}, {structuredData: true});
    } else {
        functions.logger.info({addr, privateKey, count}, {structuredData: true});
    }
});

exports.trigger = functions.pubsub.topic('trigger-topic').onPublish(async (message) => {
    const pubsub = new PubSub();
    const topic = pubsub.topic('genwallet-topic');

    const messageObject = {
        data: {}
    };
    const messageBuffer = Buffer.from(JSON.stringify(messageObject), 'utf8');
    try {
        Array(1000).fill(0).map((_, i) => topic.publish(messageBuffer));
        functions.logger.info('Message published.');
    } catch (err) {
        console.error(err);
        functions.logger.error('Cannot published');
    }
});