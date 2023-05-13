// 必要モジュールの読み込み
import fs from 'fs';
import path from 'path';
import Discord from 'discord.js';
import yaml from 'js-yaml';
import * as Misskey from 'misskey-js';

import { configure, getLogger } from 'log4js';

type visible = "public" | "home" | "followers" | "specified";

class Config {
    // Global 設定
    epgstationUrl: string;
    client: string[];
    webhookUrl: string[];
    webhook: Discord.WebhookClient;
    misskeyInstanceUrl: string;
    misskeyApiKey: string;
    Hashtag: string;
    misskeyVisible: visible;
    channel: string;
    title: string;
    description: string;
    recordedId: number;
    date: string;
    startAt: string;
    endAt: string;
    recpath: string;
    channelid: number;
    // メッセージ関連の定義
    discord_start: string;
    discord_reserve: string;
    discord_update: string;
    discord_deleted: string;
    discord_prestart: string;
    discord_prepfailed: string;
    discord_recfailed: string;
    discord_end: string;

    misskey_start: string;
    misskey_reserve: string;
    misskey_update: string;
    misskey_deleted: string;
    misskey_prestart: string;
    misskey_prepfailed: string;
    misskey_recfailed: string;
    misskey_end: string;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(config: any) {
        this.epgstationUrl = config.data.epgstation_url;
        logger.debug(config.data.use_client);
        this.client = config.data.use_client;
        this.webhookUrl = String(config.data.discord_webhookURL).split('/');
        const [ , , , , , id, token ] = this.webhookUrl;
        this.webhook = new Discord.WebhookClient(id, token);
        this.misskeyInstanceUrl = config.data.misskey_instance;
        this.misskeyApiKey = config.data.misskey_token;
        this.Hashtag = config.data.hashtag;
        this.misskeyVisible = config.data.miisskey_note;
        this.channel = String(process.env.CHANNELNAME);
        this.title = String(process.env.NAME);
        this.description = String(process.env.DESCRIPTION);
        this.recordedId = Number(process.env.RECORDEDID);
        this.date = new Date(Number(process.env.STARTAT)).toLocaleDateString("japanese", { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }); // 2023/05/09(火)
        this.startAt = new Date(Number(process.env.STARTAT)).toLocaleTimeString("japanese", { hour: '2-digit', minute: '2-digit' }); // 00:00
        this.endAt = new Date(Number(process.env.ENDAT)).toLocaleTimeString("japanese", { hour: '2-digit', minute: '2-digit' }); // 00:00
        this.recpath = String(process.env.RECPATH) || ''; //録画ファイルのフルパスを取得
        this.channelid = Number(process.env.CHANNELID); //録画ファイルのフルパスを取得

        this.discord_start = config.message.discord.start || '';
        this.discord_reserve = config.message.discord.reserve || '';
        this.discord_update = config.message.discord.update || '';
        this.discord_deleted = config.message.discord.deleted || '';
        this.discord_prestart = config.message.discord.prestart || '';
        this.discord_prepfailed = config.message.discord.prepfailed || '';
        this.discord_recfailed = config.message.discord.recfailed || '';
        this.discord_end = config.message.discord.end || '';

        this.misskey_start = config.message.misskey.start || '';
        this.misskey_reserve = config.message.misskey.reserve || '';
        this.misskey_update = config.message.misskey.update || '';
        this.misskey_deleted = config.message.misskey.deleted || '';
        this.misskey_prestart = config.message.misskey.prestart || '';
        this.misskey_prepfailed = config.message.misskey.prepfailed || '';
        this.misskey_recfailed = config.message.misskey.recfailed || '';
        this.misskey_end = config.message.misskey.end || '';
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
export const config = new Config(configData); 

// Misskey API初期化
export const client = new Misskey.api.APIClient({ origin: config.misskeyInstanceUrl, credential: config.misskeyApiKey });
