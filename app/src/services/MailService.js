const config = require('config');
const logger = require('logger');
const AsyncClient = require('vizz.async-client');

class MailService {

    constructor() {
        logger.debug('Initializing queue with provider Redis.');

        this.asynClient = new AsyncClient(AsyncClient.REDIS, {
            url: config.get('redis.url')
        });

        this.asynClient = this.asynClient.toChannel(config.get('redis.queueName'));
    }

    sendMail(template, data, recipients) {
        this.asynClient.emit(JSON.stringify({
            template,
            data,
            recipients
        }));
    }

}

module.exports = new MailService();
