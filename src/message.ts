import { config, logger } from './config';
/*************  Discord送信用メッセージの定義 ************/
const start_discord = ':red_circle: 録画開始 __**'+config.title+'**__\n```'+config.startAt+'～'+config.endAt+'［'+config.channel+'］```'
const reserve_discord = ':white_check_mark: 予約追加 __**' + config.title + '**__\n```' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '```';
const update_discord = ':large_orange_diamond: 録画予約更新 __**' + config.title + '**__\n```' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '```';
const deleted_discord = ':wastebasket: 録画予約削除 __**' + config.title + '**__\n```' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '```';
const prestart_discord = ':briefcase: 録画実行準備 __**' + config.title + '**__\n```' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '```';
const prepfailed_discord = ':warning: 録画実行準備に失敗 __**' + config.title + '**__\n```' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '```\n@everyone';
const recfailed_discord = ':warning: 録画失敗 __**' + config.title + '**__\n```' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '```\n@everyone';
const end_discord = ':white_large_square: 録画終了 ' + ' __**' + config.title + '**__\n```' + config.startAt + '～' + config.endAt + '［' + config.channel + '］```';

export async function selectDiscordMessage(check: string) {
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
const start_misskey = ':rec: 録画開始 **' + config.title + '**\n' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n\n';
// const reserve_misskey = '✅ 予約追加 **' + config.title + '** \n' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］ \n'+ config.description + '\n';
// const update_misskey = ':large_orange_diamond: 録画予約更新 **' + config.title + '**\n' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '';
// const deleted_misskey = ':wastebasket: 録画予約削除 **' + config.title + '**\n' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '';
// const prestart_misskey = ':briefcase: 録画実行準備 **' + config.title + '**\n' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '';
// const prepfailed_misskey = ':warning: 録画実行準備に失敗 **' + config.title + '**\n' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '';
const recfailed_misskey = '⚠️ 録画失敗 **' + config.title + '**\n' + config.date + ' ' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n' + config.description + '\n\n';
const end_misskey = '⏹ 録画終了 ' + ' **' + config.title + '**\n' + config.startAt + '～' + config.endAt + '［' + config.channel + '］\n\n';

export async function selectMisskeyMessage(check: string) {
    let msg = '';
    logger.info("hashtag:" + config.misskeyHashtag);
    switch (check) {
        case 'start':
            msg = start_misskey;
            msg += String(config.misskeyHashtag);
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
            msg += String(config.misskeyHashtag);
            break;
        
        case 'end':
            msg = end_misskey;
            msg += String(config.misskeyHashtag);
            break;
        
        default:
            msg = "";
            break;
    }
    return msg;
}

/*************  Misskey送信用メッセージの定義 ************/