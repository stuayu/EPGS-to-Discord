// 必要モジュールの読み込み
import fs from 'fs';
import path from 'path';
import Discord from 'discord.js';
import axios from 'axios';
import yaml from 'js-yaml';
// EPGStationより渡される環境変数を定数に代入
// const _nowDate = new Date();
const _channel = process.env.CHANNELNAME
const _title = process.env.NAME
const _description = process.env.DESCRIPTION
// const _programid = process.env.PROGRAMID
const _recordedid: number = Number(process.env.RECORDEDID);
const _date = new Date(Number(process.env.STARTAT)).toLocaleDateString("japanese", {year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long'})
const _startAt = new Date(Number(process.env.STARTAT)).toLocaleTimeString("japanese")
const _endAt = new Date(Number(process.env.ENDAT)).toLocaleTimeString("japanese")
// const _Path = process.env.RECPATH // 録画ファイルの保存フォルダを指定

import {configure, getLogger} from 'log4js';
configure({
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

const logger = getLogger();
logger.level = 'info';


// コンフィグファイルの読み込み
let _config: any;
try {
    _config = yaml.load(fs.readFileSync(path.join(__dirname, "config.yaml"), "utf8"))
} catch (e) {
    console.error("config.yaml not found!")
    process.exit()
}

const E_hostName = _config.data.epgstation_url; // EPGStationの動作するホストアドレス
const webhookURL = _config.data.discord_webhookURL.split('/'); // DiscordのWebhookアドレス
const webhook = new Discord.WebhookClient(webhookURL[5], webhookURL[6]); //Discord Webhookの初期化
const misskey_token = _config.data.misskey_token; // misskeyのトークン
const misskey_api_address = _config.data.misskey_api_address;

// 録画結果を返却
async function getRecorded(recordedId: number) {
    logger.debug('before getRecorded');
    const data = await axios.get(`${E_hostName}api/recorded/${recordedId.toString()}?isHalfWidth=true`);
    logger.debug('after getRecorded');
    return data;
}

// DropCheckの結果を返却
async function dropCheck(recordedId: number) {
    logger.debug('before func dropcheck');
    const droplog = await getRecorded(recordedId);
    logger.debug('after func dropcheck');
    return [droplog.data.dropLogFile.errorCnt, droplog.data.dropLogFile.dropCnt, droplog.data.dropLogFile.scramblingCnt]
}

async function sendMessage(client_type: string, arg: string) {
    let msg: string;
    let end = '';
    if (arg == 'end') {
        logger.debug('before dropcheck');
        const res = await dropCheck(_recordedid);
        logger.info('DropCheck:'+res);
        end = 'Error:'+res[0]+' Drop:'+res[1]+' Scrmbling:'+res[2]
    }
    switch (client_type) {
        case 'discord':
            msg = await select_discord_Message(arg);
            msg += end;
            webhook.send(msg);
            break;
        
        case 'misskey':
            msg = await select_misskey_Message(arg);
            msg += end;
            if (msg == '') {
                break;
            }
            logger.info(msg);
            await axios.post(`${misskey_api_address}notes/create`,{
                i: misskey_token,
                visibility: String(_config.data.miisskey_note),
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
        for (let val of _config.data.use_client) {
            logger.info(val);
            await sendMessage(val, arg);
        }
    }
}

/*************  Discord送信用メッセージの定義 ************/
const start_discord = ':red_circle: 録画開始 __**'+_title+'**__\n```'+_startAt+'～'+_endAt+'［'+_channel+'］```'
const reserve_discord = ':white_check_mark: 予約追加 __**' + _title + '**__\n```' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '```';
const update_discord = ':large_orange_diamond: 録画予約更新 __**' + _title + '**__\n```' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '```';
const deleted_discord = ':wastebasket: 録画予約削除 __**' + _title + '**__\n```' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '```';
const prestart_discord = ':briefcase: 録画実行準備 __**' + _title + '**__\n```' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '```';
const prepfailed_discord = ':warning: 録画実行準備に失敗 __**' + _title + '**__\n```' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '```\n@everyone';
const recfailed_discord = ':warning: 録画失敗 __**' + _title + '**__\n```' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '```\n@everyone';
const end_discord = ':white_large_square: 録画終了 ' + ' __**' + _title + '**__\n```' + _startAt + '～' + _endAt + '［' + _channel + '］```';

async function select_discord_Message(check: string) {
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
    return msg;
}

/*************  Discord送信用メッセージの定義 ************/
/*************  Misskey送信用メッセージの定義 ************/
const start_misskey = ':rec: 録画開始 **' + _title + '**\n' + _startAt + '～' + _endAt + '［' + _channel + '］\n\n' + String(_config.data.miisskey_hashtag);
// const reserve_misskey = '✅ 予約追加 **' + _title + '** \n' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］ \n'+ _description + '\n';
// const update_misskey = ':large_orange_diamond: 録画予約更新 **' + _title + '**\n' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '';
// const deleted_misskey = ':wastebasket: 録画予約削除 **' + _title + '**\n' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '';
// const prestart_misskey = ':briefcase: 録画実行準備 **' + _title + '**\n' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '';
// const prepfailed_misskey = ':warning: 録画実行準備に失敗 **' + _title + '**\n' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '';
const recfailed_misskey = '⚠️ 録画失敗 **' + _title + '**\n' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '\n\n' + String(_config.data.miisskey_hashtag);
const end_misskey = '⏹ 録画終了 ' + ' **' + _title + '**\n' + _startAt + '～' + _endAt + '［' + _channel + '］\n\n' + String(_config.data.miisskey_hashtag);

async function select_misskey_Message(check: string) {
    let msg: string = '';
    
    switch (check) {
        case 'start':
            msg = start_misskey;
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
            break;
        
        case 'end':
            msg = end_misskey;
            break;
        
        default:
            msg = "";
            break;
    }
    return msg;
}

/*************  Misskey送信用メッセージの定義 ************/


main(process.argv[2]);