import { config, logger } from './config';
import checkDiskSpace from 'check-disk-space';
import axios from 'axios';
import { channelList } from './channelid';

// 録画結果を返却
async function getRecorded(recordedId: number) {
    logger.debug('before getRecorded');
    const data = await axios.get(`${config.epgstationUrl}api/recorded/${recordedId.toString()}?isHalfWidth=true`);
    logger.debug('after getRecorded');
    logger.debug(data);
    return data;
}

// DropCheckの結果を返却
async function dropCheck(recordedId: number) {
    logger.debug('before func dropcheck');
    const droplog = await getRecorded(recordedId);
    logger.debug('after func dropcheck');
    logger.debug('videoFiles:'+droplog.data.videoFiles[0].size);
    return [droplog.data.dropLogFile.errorCnt, droplog.data.dropLogFile.dropCnt, droplog.data.dropLogFile.scramblingCnt, await calcSize(droplog.data.videoFiles[0].size), droplog.data.dropLogFile.id];
}

// ストレージの空き容量を取得
async function storageCheck() {
    const storage = await checkDiskSpace(config.recpath);
    const diskpath = storage.diskPath;
    const available = await calcSize(storage.free);
    const total = await calcSize(storage.size);
    return diskpath + available + '/' + total;
}

// サイズ計算
async function calcSize(byte: number) {
    logger.debug(byte);
    const kb = 1024;
    const mb = Math.pow(kb, 2);
    const gb = Math.pow(kb, 3);
    const tb = Math.pow(kb, 4);

    let target = 0;
    let unit = 'byte';

    if (byte >= tb) {
        target = tb;
        unit = 'TB';
    } else if (byte >= gb) {
        target = gb;
        unit = 'GB';
    } else if (byte >= mb) {
        target = mb;
        unit = 'MB';
    } else if (byte >= kb) {
        target = kb;
        unit = 'KB';
    }
    const res = Math.floor((byte / target) * 100) / 100;
    logger.debug(res);
    return String(res) + unit;
}

// 詳細なドロップログを収集
async function getDropLog(id:number) {
    const data = await axios.get(`${config.epgstationUrl}api/dropLogs/${id.toString()}?maxsize=512`);
    return data.data;
}

// 放送局のタグを取得
async function getChannelIdToTag() {
    for (const [i,j] of channelList ) {
        if (i == config.channelid) {
            return '#' + j;
        }
        
    }
    return '';
}

/*************  Discord送信用メッセージの定義 ************/
export async function selectDiscordMessage(check: string) {
    let dropCheckData = Array(4);
    let getDropLogData = '';
    let storageData = '';
    switch (check) {
        case 'start':
        case 'end':
        case 'recfailed':
            dropCheckData = await dropCheck(config.recordedId);
            getDropLogData = await getDropLog(dropCheckData[4]);
            storageData = await storageCheck();
            break;
        default:
            break;
    }
    const broadcastTag = await getChannelIdToTag();
    const start_discord = config.discord_start.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$', config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g, '\n');
    const reserve_discord = config.discord_reserve.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$',config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g,'\n');
    const update_discord = config.discord_update.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$',config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g,'\n');
    const deleted_discord = config.discord_deleted.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$',config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g,'\n');
    const prestart_discord = config.discord_prestart.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$',config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g,'\n');
    const prepfailed_discord = config.discord_prepfailed.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$',config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g,'\n');
    const recfailed_discord = config.discord_recfailed.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$',config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g,'\n');
    const end_discord = config.discord_end.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$',config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g,'\n');
    let msg: string;
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
    logger.debug(msg);
    return msg;
}

/*************  Discord送信用メッセージの定義 ************/
/*************  Misskey送信用メッセージの定義 ************/
export async function selectMisskeyMessage(check: string) {
    let dropCheckData = Array(4);
    let getDropLogData = '';
    let storageData = '';
    switch (check) {
        case 'start':
        case 'end':
        case 'recfailed':
            dropCheckData = await dropCheck(config.recordedId);
            getDropLogData = await getDropLog(dropCheckData[4]);
            storageData = await storageCheck();
            break;
        default:
            break;
    }
    const broadcastTag = await getChannelIdToTag();

    const start_misskey = config.misskey_start.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$', config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g, '\n');
    const reserve_misskey = config.misskey_reserve.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$', config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g, '\n');
    const update_misskey = config.misskey_update.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$', config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g, '\n');
    const deleted_misskey = config.misskey_deleted.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$', config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g, '\n');
    const prestart_misskey = config.misskey_prestart.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$', config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g, '\n');
    const prepfailed_misskey = config.misskey_prepfailed.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$', config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g, '\n');
    const recfailed_misskey = config.misskey_recfailed.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$', config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g, '\n');
    const end_misskey = config.misskey_end.replace('$TITLE$', config.title).replace('$DATE$', config.date).replace('$START_TIME$', config.startAt).replace('$END_TIME$', config.endAt).replace('$CHANNEL$', config.channel).replace('$DESCRIPTION$', config.description).replace('$HASHTAG$', config.Hashtag).replace('$ERROR$',String(dropCheckData[0])).replace('$DROP$',String(dropCheckData[1])).replace('$SCRMBLE$',String(dropCheckData[2])).replace('$TS_FILE_SIZE$',dropCheckData[3]).replace('$ALL_DROPLOG$',getDropLogData).replace('$DISKSIZE$',storageData).replace('$TVTAG$',broadcastTag).replace(/\\n/g, '\n');
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
    logger.debug(msg);
    return msg;
}

/*************  Misskey送信用メッセージの定義 ************/