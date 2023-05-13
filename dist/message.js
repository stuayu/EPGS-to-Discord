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
exports.selectMisskeyMessage = exports.selectDiscordMessage = void 0;
const config_1 = require("./config");
const check_disk_space_1 = __importDefault(require("check-disk-space"));
const axios_1 = __importDefault(require("axios"));
const channelid_1 = require("./channelid");
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
        return [droplog.data.dropLogFile.errorCnt, droplog.data.dropLogFile.dropCnt, droplog.data.dropLogFile.scramblingCnt, yield calcSize(droplog.data.videoFiles[0].size), droplog.data.dropLogFile.id];
    });
}
// ストレージの空き容量を取得
function storageCheck() {
    return __awaiter(this, void 0, void 0, function* () {
        const storage = yield (0, check_disk_space_1.default)(config_1.config.recpath);
        const diskpath = storage.diskPath;
        const available = yield calcSize(storage.free);
        const total = yield calcSize(storage.size);
        return diskpath + available + '/' + total;
    });
}
// サイズ計算
function calcSize(byte) {
    return __awaiter(this, void 0, void 0, function* () {
        config_1.logger.debug(byte);
        const kb = 1024;
        const mb = Math.pow(kb, 2);
        const gb = Math.pow(kb, 3);
        const tb = Math.pow(kb, 4);
        let target = 0;
        let unit = 'byte';
        if (byte >= tb) {
            target = tb;
            unit = 'TB';
        }
        else if (byte >= gb) {
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
        const res = Math.floor((byte / target) * 100) / 100;
        config_1.logger.debug(res);
        return String(res) + unit;
    });
}
// 詳細なドロップログを収集
function getDropLog(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield axios_1.default.get(`${config_1.config.epgstationUrl}api/dropLogs/${id.toString()}?maxsize=512`);
        return data.data;
    });
}
// 放送局のタグを取得
function getChannelIdToTag() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const [i, j] of channelid_1.channelList) {
            if (i == config_1.config.channelid) {
                return '#' + j;
            }
        }
        return '';
    });
}
/*************  Discord送信用メッセージの定義 ************/
function selectDiscordMessage(check) {
    return __awaiter(this, void 0, void 0, function* () {
        let dropCheckData = Array(4);
        let getDropLogData = '';
        let storageData = '';
        switch (check) {
            case 'start':
            case 'end':
            case 'recfailed':
                dropCheckData = yield dropCheck(config_1.config.recordedId);
                getDropLogData = yield getDropLog(dropCheckData[4]);
                storageData = yield storageCheck();
                break;
            default:
                break;
        }
        const broadcastTag = yield getChannelIdToTag();
        const start_discord = config_1.config.discord_start.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const reserve_discord = config_1.config.discord_reserve.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const update_discord = config_1.config.discord_update.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const deleted_discord = config_1.config.discord_deleted.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const prestart_discord = config_1.config.discord_prestart.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const prepfailed_discord = config_1.config.discord_prepfailed.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const recfailed_discord = config_1.config.discord_recfailed.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const end_discord = config_1.config.discord_end.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
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
        config_1.logger.debug(msg);
        return msg;
    });
}
exports.selectDiscordMessage = selectDiscordMessage;
/*************  Discord送信用メッセージの定義 ************/
/*************  Misskey送信用メッセージの定義 ************/
function selectMisskeyMessage(check) {
    return __awaiter(this, void 0, void 0, function* () {
        let dropCheckData = Array(4);
        let getDropLogData = '';
        let storageData = '';
        switch (check) {
            case 'start':
            case 'end':
            case 'recfailed':
                dropCheckData = yield dropCheck(config_1.config.recordedId);
                getDropLogData = yield getDropLog(dropCheckData[4]);
                storageData = yield storageCheck();
                break;
            default:
                break;
        }
        const broadcastTag = yield getChannelIdToTag();
        const start_misskey = config_1.config.misskey_start.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const reserve_misskey = config_1.config.misskey_reserve.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const update_misskey = config_1.config.misskey_update.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const deleted_misskey = config_1.config.misskey_deleted.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const prestart_misskey = config_1.config.misskey_prestart.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const prepfailed_misskey = config_1.config.misskey_prepfailed.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const recfailed_misskey = config_1.config.misskey_recfailed.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        const end_misskey = config_1.config.misskey_end.replace('$TITLE$', config_1.config.title).replace('$DATE$', config_1.config.date).replace('$START_TIME$', config_1.config.startAt).replace('$END_TIME$', config_1.config.endAt).replace('$CHANNEL$', config_1.config.channel).replace('$DESCRIPTION$', config_1.config.description).replace('$HASHTAG$', config_1.config.Hashtag).replace('$ERROR$', String(dropCheckData[0])).replace('$DROP$', String(dropCheckData[1])).replace('$SCRMBLE$', String(dropCheckData[2])).replace('$TS_FILE_SIZE$', dropCheckData[3]).replace('$ALL_DROPLOG$', getDropLogData).replace('$DISKSIZE$', storageData).replace('$TVTAG$', broadcastTag).replace(/\\n/g, '\n');
        let msg = '';
        switch (check) {
            case 'start':
                msg = start_misskey;
                break;
            case 'reserve':
                msg = reserve_misskey;
                break;
            case 'update':
                msg = update_misskey;
                break;
            case 'deleted':
                msg = deleted_misskey;
                break;
            case 'prestart':
                msg = prestart_misskey;
                break;
            case 'prepfailed':
                msg = prepfailed_misskey;
                break;
            case 'recfailed':
                msg = recfailed_misskey;
                break;
            case 'end':
                msg = end_misskey;
                break;
            default:
                msg = "";
                break;
        }
        config_1.logger.debug(msg);
        return msg;
    });
}
exports.selectMisskeyMessage = selectMisskeyMessage;
/*************  Misskey送信用メッセージの定義 ************/ 
//# sourceMappingURL=message.js.map