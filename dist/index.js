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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const message_1 = require("./message");
const axios_1 = __importDefault(require("axios"));
// 録画結果を返却
function getRecorded(recordedId) {
    return __awaiter(this, void 0, void 0, function* () {
        config_1.logger.debug('before getRecorded');
        const data = yield axios_1.default.get(`${config_1.config.epgstationUrl}api/recorded/${recordedId.toString()}?isHalfWidth=true`);
        config_1.logger.debug('after getRecorded');
        config_1.logger.debug(data);
        return data;
    });
}
// DropCheckの結果を返却
function dropCheck(recordedId) {
    return __awaiter(this, void 0, void 0, function* () {
        config_1.logger.debug('before func dropcheck');
        const droplog = yield getRecorded(recordedId);
        config_1.logger.debug('after func dropcheck');
        config_1.logger.debug('videoFiles:' + droplog.data.videoFiles[0].size);
        return [droplog.data.dropLogFile.errorCnt, droplog.data.dropLogFile.dropCnt, droplog.data.dropLogFile.scramblingCnt, droplog.data.videoFiles[0].size, droplog.data.dropLogFile.id];
    });
}
// TSファイルのサイズ計算
function calcSize(byte) {
    return __awaiter(this, void 0, void 0, function* () {
        config_1.logger.debug(byte);
        const kb = 1024;
        const mb = Math.pow(kb, 2);
        const gb = Math.pow(kb, 3);
        let target = null;
        let unit = 'byte';
        if (byte >= gb) {
            target = gb;
            unit = 'GB';
        }
        else if (byte >= mb) {
            target = mb;
            unit = 'MB';
        }
        else if (byte >= kb) {
            target = kb;
            unit = 'KB';
        }
        const res = target !== null ? Math.floor((byte / target) * 100) / 100 : byte;
        config_1.logger.debug(res);
        return String(res) + unit;
    });
}
function getDropLog(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield axios_1.default.get(`${config_1.config.epgstationUrl}api/dropLogs/${id.toString()}?maxsize=512`);
        return data.data;
    });
}
function sendMessage(client_type, arg) {
    return __awaiter(this, void 0, void 0, function* () {
        let msg;
        let end = '';
        if (arg == 'end') {
            config_1.logger.debug('before dropcheck');
            const res = yield dropCheck(config_1.config.recordedId);
            config_1.logger.info('DropCheck:' + res);
            end = '\nError:' + res[0] + ' Drop:' + res[1] + ' Scrmbling:' + res[2] + '\nTS:' + (yield calcSize(res[3])) + '\n\n<small>' + (yield getDropLog(res[4])) + '</small>';
        }
        switch (client_type) {
            case 'discord':
                msg = yield (0, message_1.selectDiscordMessage)(arg);
                msg += end;
                config_1.config.webhook.send(msg);
                break;
            case 'misskey':
                msg = yield (0, message_1.selectMisskeyMessage)(arg);
                msg += end;
                if (msg == '') {
                    break;
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