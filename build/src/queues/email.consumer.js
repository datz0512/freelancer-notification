"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeOrderEmailMessages = exports.consumeAuthEmailMessages = void 0;
const freelancer_shared_1 = require("@datz0512/freelancer-shared");
const config_1 = require("../config");
const connection_1 = require("../queues/connection");
const mail_transport_1 = require("../queues/mail.transport");
const log = (0, freelancer_shared_1.winstonLogger)(`${config_1.config.ELASTIC_SEARCH_URL}`, 'notificationQueueConnection', 'debug');
function consumeAuthEmailMessages(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!channel) {
                channel = (yield (0, connection_1.createConnection)());
            }
            const exchangeName = 'freelancer-email-notification';
            const routingKey = 'auth-email';
            const queueName = 'auth-email-queue';
            yield channel.assertExchange(exchangeName, 'direct');
            const freelancerQueue = yield channel.assertQueue(queueName, { durable: true, autoDelete: false });
            // Create the path between exchanges and queues via routing key
            yield channel.bindQueue(freelancerQueue.queue, exchangeName, routingKey);
            channel.consume(freelancerQueue.queue, (msg) => __awaiter(this, void 0, void 0, function* () {
                const { receiverEmail, username, verifyLink, resetLink, template } = JSON.parse(msg.content.toString());
                const locals = {
                    appLink: `${config_1.config.CLIENT_URL}`,
                    appIcon: `${config_1.config.APP_ICON}`,
                    username,
                    verifyLink,
                    resetLink
                };
                yield (0, mail_transport_1.sendEmail)(template, receiverEmail, locals);
                // Send email
                // Acknowledge
                channel.ack(msg);
            }));
        }
        catch (error) {
            log.log('error', 'NotificationService EmailConsumer error consumeAuthEmailMessages() method:', error);
        }
    });
}
exports.consumeAuthEmailMessages = consumeAuthEmailMessages;
function consumeOrderEmailMessages(channel) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!channel) {
                channel = (yield (0, connection_1.createConnection)());
            }
            const exchangeName = 'freelancer-order-notification';
            const routingKey = 'order-email';
            const queueName = 'order-email-queue';
            yield channel.assertExchange(exchangeName, 'direct');
            const freelancerQueue = yield channel.assertQueue(queueName, { durable: true, autoDelete: false });
            // Create the path between exchanges and queues via routing key
            yield channel.bindQueue(freelancerQueue.queue, exchangeName, routingKey);
            channel.consume(freelancerQueue.queue, (msg) => __awaiter(this, void 0, void 0, function* () {
                const { receiverEmail, username, template, sender, offerLink, amount, buyerUsername, sellerUsername, title, description, deliveryDays, orderId, orderDue, requirements, orderUrl, originalDate, newDate, reason, subject, header, type, message, serviceFee, total } = JSON.parse(msg.content.toString());
                const locals = {
                    appLink: `${config_1.config.CLIENT_URL}`,
                    appIcon: `${config_1.config.APP_ICON}`,
                    username,
                    sender,
                    offerLink,
                    amount,
                    buyerUsername,
                    sellerUsername,
                    title,
                    description,
                    deliveryDays,
                    orderId,
                    orderDue,
                    requirements,
                    orderUrl,
                    originalDate,
                    newDate,
                    reason,
                    subject,
                    header,
                    type,
                    message,
                    serviceFee,
                    total
                };
                if (template === 'orderPlaced') {
                    yield (0, mail_transport_1.sendEmail)('orderPlaced', receiverEmail, locals);
                    yield (0, mail_transport_1.sendEmail)('orderReceipt', receiverEmail, locals);
                }
                else {
                    yield (0, mail_transport_1.sendEmail)(template, receiverEmail, locals);
                }
                channel.ack(msg);
            }));
        }
        catch (error) {
            log.log('error', 'NotificationService EmailConsumer error consumeOrderEmailMessages() method:', error);
        }
    });
}
exports.consumeOrderEmailMessages = consumeOrderEmailMessages;
//# sourceMappingURL=email.consumer.js.map