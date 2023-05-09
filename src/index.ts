import { logger, config, client } from './config';
import { selectDiscordMessage, selectMisskeyMessage } from './message';
import axios from 'axios';

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
    return [droplog.data.dropLogFile.errorCnt, droplog.data.dropLogFile.dropCnt, droplog.data.dropLogFile.scramblingCnt, droplog.data.videoFiles[0].size, droplog.data.dropLogFile.id];
}

async function storageCheck() {
    const storage = await axios.get(`${config.epgstationUrl}api/storages`);
    const res = [];
    for (const i of storage.data.items) {
        //console.log(i.available);
        //console.log(await calcSize(i.available));
        const available = await calcSize(i.available);
        const total = await calcSize(i.total);
        res.push(i.name + ': ' + available + '/' + total);
    }
    return res
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

async function getDropLog(id:number) {
    const data = await axios.get(`${config.epgstationUrl}api/dropLogs/${id.toString()}?maxsize=512`);
    return data.data;
}

async function sendMessage(client_type: string, arg: string) {
    let msg: string;
    let end = '';
    switch (arg) {
        case 'start':
            end = '\n残りの空き容量: ';
            for (const i of await storageCheck()) {
                end += i + ', ';
            }
            break;
        case 'end': {
            logger.debug('before dropcheck');
            const res = await dropCheck(config.recordedId);
            logger.info('DropCheck:' + res);
            end = '\nError:' + res[0] + ' Drop:' + res[1] + ' Scrmbling:' + res[2] + '\nTS:' + await calcSize(res[3]) + '\n\n<small>' + await getDropLog(res[4]) + '</small>'
            
            break;
        }
        default:
            break;
    }

    switch (client_type) {
        case 'discord':
            msg = await selectDiscordMessage(arg);
            msg += end;
            config.webhook.send(msg);
            break;
        
        case 'misskey':
            msg = await selectMisskeyMessage(arg);
            msg += end;
            if (msg == '') {
                break;
            }
            logger.info(msg);
            await client.request('notes/create', {
                visibility: config.misskeyVisible,
                visibleUserIds: [],
                text: msg,
                localOnly: false,
                noExtractMentions: false,
                noExtractHashtags: false,
                noExtractEmojis: false,
            })
            break;
        
        default:
            msg = "";
            break;
    }


    
}

async function main(arg: string | undefined) {
    logger.info('arg:' + arg);
    if (arg != null) {
        logger.debug(config.client);
        for (const val of config.client) {
            logger.info(val);
            await sendMessage(val, arg);
        }
    }
}

main(process.argv[2]);