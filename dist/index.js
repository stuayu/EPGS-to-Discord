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
const config_1 = require("./config");
const message_1 = require("./message");
function sendMessage(client_type, arg) {
    return __awaiter(this, void 0, void 0, function* () {
        let msg;
        switch (client_type) {
            case 'discord':
                msg = yield (0, message_1.selectDiscordMessage)(arg);
                if (msg == '') {
                    return 0;
                }
                config_1.config.webhook.send(msg);
                break;
            case 'misskey':
                msg = yield (0, message_1.selectMisskeyMessage)(arg);
                if (msg == '') {
                    return 0;
                }
                config_1.logger.info(msg);
                yield config_1.client.request('notes/create', {
                    visibility: config_1.config.misskeyVisible,
                    visibleUserIds: [],
                    text: msg,
                    localOnly: false,
                    noExtractMentions: false,
                    noExtractHashtags: false,
                    noExtractEmojis: false,
                });
                break;
            default:
                msg = "";
                break;
        }
        return 0;
    });
}
function main(arg) {
    return __awaiter(this, void 0, void 0, function* () {
        config_1.logger.info('arg:' + arg);
        if (arg != null) {
            config_1.logger.debug(config_1.config.client);
            for (const val of config_1.config.client) {
                config_1.logger.info(val);
                yield sendMessage(val, arg);
            }
        }
    });
}
main(process.argv[2]);
//# sourceMappingURL=index.js.map