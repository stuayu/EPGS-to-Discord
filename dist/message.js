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
exports.selectMisskeyMessage = exports.selectDiscordMessage = void 0;
const config_1 = require("./config");
/*************  Discord送信用メッセージの定義 ************/
const start_discord = ':red_circle: 録画開始 __**' + config_1.config.title + '**__\n```' + config_1.config.date + ' ' + config_1.config.startAt + '～' + config_1.config.endAt + '［' + config_1.config.channel + '］```';
const reserve_discord = ':white_check_mark: 予約追加 __**' + config_1.config.title + '**__\n```' + config_1.config.date + ' ' + config_1.config.startAt + '～' + config_1.config.endAt + '［' + config_1.config.channel + '］\n' + config_1.config.description + '```';
const update_discord = ':large_orange_diamond: 録画予約更新 __**' + config_1.config.title + '**__\n```' + config_1.config.date + ' ' + config_1.config.startAt + '～' + config_1.config.endAt + '［' + config_1.config.channel + '］\n' + config_1.config.description + '```';
const deleted_discord = ':wastebasket: 録画予約削除 __**' + config_1.config.title + '**__\n```' + config_1.config.date + ' ' + config_1.config.startAt + '～' + config_1.config.endAt + '［' + config_1.config.channel + '］\n' + config_1.config.description + '```';
const prestart_discord = ':briefcase: 録画実行準備 __**' + config_1.config.title + '**__\n```' + config_1.config.date + ' ' + config_1.config.startAt + '～' + config_1.config.endAt + '［' + config_1.config.channel + '］\n' + config_1.config.description + '```';
const prepfailed_discord = ':warning: 録画実行準備に失敗 __**' + config_1.config.title + '**__\n```' + config_1.config.date + ' ' + config_1.config.startAt + '～' + config_1.config.endAt + '［' + config_1.config.channel + '］\n' + config_1.config.description + '```\n@everyone';
const recfailed_discord = ':warning: 録画失敗 __**' + config_1.config.title + '**__\n```' + config_1.config.date + ' ' + config_1.config.startAt + '～' + config_1.config.endAt + '［' + config_1.config.channel + '］\n' + config_1.config.description + '```\n@everyone';
const end_discord = ':white_large_square: 録画終了 ' + ' __**' + config_1.config.title + '**__\n```' + config_1.config.date + ' ' + config_1.config.startAt + '～' + config_1.config.endAt + '［' + config_1.config.channel + '］```';
function selectDiscordMessage(check) {
    return __awaiter(this, void 0, void 0, function* () {
        let msg;
        config_1.logger.info(check);
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
exports.selectDiscordMessage = selectDiscordMessage;
/*************  Discord送信用メッセージの定義 ************/
/*************  Misskey送信用メッセージの定義 ************/
const start_misskey = ':rec: 録画開始 **' + config_1.config.title + '**\n' + config_1.config.date + ' ' + config_1.config.startAt + '～' + config_1.config.endAt + '［' + config_1.config.channel + '］\n\n';
// const reserve_misskey = '✅ 予約追加 **' + config.title + '** \n' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］ \n'+ config.description + '\n';
// const update_misskey = ':large_orange_diamond: 録画予約更新 **' + config.title + '**\n' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '';
// const deleted_misskey = ':wastebasket: 録画予約削除 **' + config.title + '**\n' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '';
// const prestart_misskey = ':briefcase: 録画実行準備 **' + config.title + '**\n' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '';
// const prepfailed_misskey = ':warning: 録画実行準備に失敗 **' + config.title + '**\n' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '';
const recfailed_misskey = '⚠️ 録画失敗 **' + config_1.config.title + '**\n' + config_1.config.date + ' ' + config_1.config.startAt + '～' + config_1.config.endAt + '［' + config_1.config.channel + '］\n' + config_1.config.description + '\n\n';
const end_misskey = '⏹ 録画終了 ' + ' **' + config_1.config.title + '**\n' + config_1.config.date + ' ' + config_1.config.startAt + '～' + config_1.config.endAt + '［' + config_1.config.channel + '］\n\n';
function selectMisskeyMessage(check) {
    return __awaiter(this, void 0, void 0, function* () {
        let msg = '';
        config_1.logger.info("hashtag:" + config_1.config.misskeyHashtag);
        switch (check) {
            case 'start':
                msg = start_misskey;
                msg += String(config_1.config.misskeyHashtag);
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
                msg += String(config_1.config.misskeyHashtag);
                break;
            case 'end':
                msg = end_misskey;
                msg += String(config_1.config.misskeyHashtag);
                break;
            default:
                msg = "";
                break;
        }
        return msg;
    });
}
exports.selectMisskeyMessage = selectMisskeyMessage;
/*************  Misskey送信用メッセージの定義 ************/ 
//# sourceMappingURL=message.js.map