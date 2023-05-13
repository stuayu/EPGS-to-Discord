import { logger, config, client } from './config';
import { selectDiscordMessage, selectMisskeyMessage } from './message';


async function sendMessage(client_type: string, arg: string) {
    let msg;
    switch (client_type) {
        case 'discord':
            msg = await selectDiscordMessage(arg);
            if (msg == '') {
                return 0;
            }
            config.webhook.send(msg);
            break;
        
        case 'misskey':
            msg = await selectMisskeyMessage(arg);
            if (msg == '') {
                return 0;
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
    return 0;
    
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