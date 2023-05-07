// 必要モジュールの読み込み
import fs from 'fs';
import path from 'path';
import Discord from 'discord.js';
import yaml from 'js-yaml';
import * as Misskey from 'misskey-js';

import { configure, getLogger } from 'log4js';

type visible = "public" | "home" | "followers" | "specified";

class Config {
    epgstationUrl: string;
    client: string[];
    webhookUrl: string[];
    webhook: Discord.WebhookClient;
    misskeyInstanceUrl: string;
    misskeyApiKey: string;
    misskeyHashtag: string;
    misskeyVisible: visible;
    channel: string;
    title: string;
    description: string;
    recordedId: number;
    date: string;
    startAt: string;
    endAt: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(configData: any) {
        this.epgstationUrl = configData.epgstation_url;
        logger.debug(configData.use_client);
        this.client = configData.use_client;
        this.webhookUrl = String(configData.discord_webhookURL).split('/');
        const [ , , , , , id, token ] = this.webhookUrl;
        this.webhook = new Discord.WebhookClient(id, token);
        this.misskeyInstanceUrl = configData.misskey_instance;
        this.misskeyApiKey = configData.misskey_token;
        this.misskeyHashtag = configData.misskey_hashtag;
        this.misskeyVisible = configData.miisskey_note;
        this.channel = String(process.env.CHANNELNAME);
        this.title = String(process.env.NAME);
        this.description = String(process.env.DESCRIPTION);
        this.recordedId = Number(process.env.RECORDEDID);
        this.date = new Date(Number(process.env.STARTAT)).toLocaleDateString("japanese", { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long' });
        this.startAt = new Date(Number(process.env.STARTAT)).toLocaleTimeString("japanese");
        this.endAt = new Date(Number(process.env.ENDAT)).toLocaleTimeString("japanese");
    }
}

// ログの設定
const logOptions = {
    appenders: {
        console: {
            type: 'console',
        },
        logfile: { 
            type: 'fileSync', 
            filename: './logs/post_message.log', 
            maxLogSize: 10485760, // 10 MB
            backups: 3, // 3 backups
            compress: true,
        },
    },
    categories: {
        default: { 
            appenders: ['console', 'logfile'], 
            level: 'info',
        },
    },
};
configure(logOptions);
export const logger = getLogger();

// 設定ファイルから読み込み
let configData: any;
try {
    configData = yaml.load(fs.readFileSync(path.join(__dirname, "../config.yaml"), "utf8"));
    logger.debug(configData);
} catch (e) {
    logger.error("config.yaml not found!");
}
export const config = new Config(configData.data); 

// Misskey API初期化
export const client = new Misskey.api.APIClient({ origin: config.misskeyInstanceUrl, credential: config.misskeyApiKey });
