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
// 必要モジュールの読み込み
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const discord_js_1 = __importDefault(require("discord.js"));
const axios_1 = __importDefault(require("axios"));
const js_yaml_1 = __importDefault(require("js-yaml"));
// EPGStationより渡される環境変数を定数に代入
// const _nowDate = new Date();
const _channel = process.env.CHANNELNAME;
const _title = process.env.NAME;
const _description = process.env.DESCRIPTION;
// const _programid = process.env.PROGRAMID
const _recordedid = Number(process.env.RECORDEDID);
const _date = new Date(Number(process.env.STARTAT)).toLocaleDateString("japanese", { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' });
const _startAt = new Date(Number(process.env.STARTAT)).toLocaleTimeString("japanese");
const _endAt = new Date(Number(process.env.ENDAT)).toLocaleTimeString("japanese");
// const _Path = process.env.RECPATH // 録画ファイルの保存フォルダを指定
const log4js_1 = require("log4js");
(0, log4js_1.configure)({
    appenders: {
        console: {
            type: 'console',
        },
        logfile: { type: 'fileSync', filename: './logs/post_message.log' },
    },
    categories: {
        default: { appenders: ['console', 'logfile'], level: 'info' },
    },
});
const logger = (0, log4js_1.getLogger)();
logger.level = 'info';
// コンフィグファイルの読み込み
let _config;
try {
    _config = js_yaml_1.default.load(fs_1.default.readFileSync(path_1.default.join(__dirname, "config.yaml"), "utf8"));
}
catch (e) {
    console.error("config.yaml not found!");
    process.exit();
}
const E_hostName = _config.data.epgstation_url; // EPGStationの動作するホストアドレス
const webhookURL = _config.data.discord_webhookURL.split('/'); // DiscordのWebhookアドレス
const webhook = new discord_js_1.default.WebhookClient(webhookURL[5], webhookURL[6]); //Discord Webhookの初期化
const misskey_token = _config.data.misskey_token; // misskeyのトークン
const misskey_api_address = _config.data.misskey_api_address;
const misskey_hashtag = _config.data.misskey_hashtag;
const miisskey_note = _config.data.miisskey_note;
// 録画結果を返却
function getRecorded(recordedId) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('before getRecorded');
        const data = yield axios_1.default.get(`${E_hostName}api/recorded/${recordedId.toString()}?isHalfWidth=true`);
        logger.debug('after getRecorded');
        return data;
    });
}
// DropCheckの結果を返却
function dropCheck(recordedId) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.debug('before func dropcheck');
        const droplog = yield getRecorded(recordedId);
        logger.debug('after func dropcheck');
        return [droplog.data.dropLogFile.errorCnt, droplog.data.dropLogFile.dropCnt, droplog.data.dropLogFile.scramblingCnt];
    });
}
function sendMessage(client_type, arg) {
    return __awaiter(this, void 0, void 0, function* () {
        let msg;
        let end = '';
        if (arg == 'end') {
            logger.debug('before dropcheck');
            const res = yield dropCheck(_recordedid);
            logger.info('DropCheck:' + res);
            end = '\nError:' + res[0] + ' Drop:' + res[1] + ' Scrmbling:' + res[2];
        }
        switch (client_type) {
            case 'discord':
                msg = yield select_discord_Message(arg);
                msg += end;
                webhook.send(msg);
                break;
            case 'misskey':
                msg = yield select_misskey_Message(arg);
                msg += end;
                if (msg == '') {
                    break;
                }
                logger.info(msg);
                yield axios_1.default.post(`${misskey_api_address}notes/create`, {
                    i: misskey_token,
                    visibility: String(miisskey_note),
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
        logger.info('arg:' + arg);
        if (arg != null) {
            for (let val of _config.data.use_client) {
                logger.info(val);
                yield sendMessage(val, arg);
            }
        }
    });
}
/*************  Discord送信用メッセージの定義 ************/
const start_discord = ':red_circle: 録画開始 __**' + _title + '**__\n```' + _startAt + '～' + _endAt + '［' + _channel + '］```';
const reserve_discord = ':white_check_mark: 予約追加 __**' + _title + '**__\n```' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '```';
const update_discord = ':large_orange_diamond: 録画予約更新 __**' + _title + '**__\n```' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '```';
const deleted_discord = ':wastebasket: 録画予約削除 __**' + _title + '**__\n```' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '```';
const prestart_discord = ':briefcase: 録画実行準備 __**' + _title + '**__\n```' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '```';
const prepfailed_discord = ':warning: 録画実行準備に失敗 __**' + _title + '**__\n```' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '```\n@everyone';
const recfailed_discord = ':warning: 録画失敗 __**' + _title + '**__\n```' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '```\n@everyone';
const end_discord = ':white_large_square: 録画終了 ' + ' __**' + _title + '**__\n```' + _startAt + '～' + _endAt + '［' + _channel + '］```';
function select_discord_Message(check) {
    return __awaiter(this, void 0, void 0, function* () {
        let msg;
        logger.info(check);
        switch (check) {
            case 'start':
                msg = start_discord;
                break;
            case 'reserve':
                msg = reserve_discord;
                break;
            case 'update':
                msg = update_discord;
                break;
            case 'deleted':
                msg = deleted_discord;
                break;
            case 'prestart':
                msg = prestart_discord;
                break;
            case 'prepfailed':
                msg = prepfailed_discord;
                break;
            case 'recfailed':
                msg = recfailed_discord;
                break;
            case 'end':
                msg = end_discord;
                break;
            default:
                msg = "";
                break;
        }
        return msg;
    });
}
/*************  Discord送信用メッセージの定義 ************/
/*************  Misskey送信用メッセージの定義 ************/
const start_misskey = ':rec: 録画開始 **' + _title + '**\n' + _startAt + '～' + _endAt + '［' + _channel + '］\n\n';
// const reserve_misskey = '✅ 予約追加 **' + _title + '** \n' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］ \n'+ _description + '\n';
// const update_misskey = ':large_orange_diamond: 録画予約更新 **' + _title + '**\n' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '';
// const deleted_misskey = ':wastebasket: 録画予約削除 **' + _title + '**\n' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '';
// const prestart_misskey = ':briefcase: 録画実行準備 **' + _title + '**\n' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '';
// const prepfailed_misskey = ':warning: 録画実行準備に失敗 **' + _title + '**\n' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '';
const recfailed_misskey = '⚠️ 録画失敗 **' + _title + '**\n' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '\n\n';
const end_misskey = '⏹ 録画終了 ' + ' **' + _title + '**\n' + _startAt + '～' + _endAt + '［' + _channel + '］\n\n';
function select_misskey_Message(check) {
    return __awaiter(this, void 0, void 0, function* () {
        let msg = '';
        logger.info("hashtag:" + misskey_hashtag);
        switch (check) {
            case 'start':
                msg = start_misskey;
                msg += String(misskey_hashtag);
                break;
            case 'reserve':
                // msg = reserve_misskey;
                break;
            case 'update':
                // msg = update_misskey;
                break;
            case 'deleted':
                // msg = deleted_misskey;
                break;
            case 'prestart':
                // msg = prestart_misskey;
                break;
            case 'prepfailed':
                // msg = prepfailed_misskey;
                break;
            case 'recfailed':
                msg = recfailed_misskey;
                msg += String(misskey_hashtag);
                break;
            case 'end':
                msg = end_misskey;
                msg += String(misskey_hashtag);
                break;
            default:
                msg = "";
                break;
        }
        return msg;
    });
}
/*************  Misskey送信用メッセージの定義 ************/
main(process.argv[2]);
//# sourceMappingURL=index.js.map