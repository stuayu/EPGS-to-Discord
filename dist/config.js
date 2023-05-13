"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.config = exports.logger = void 0;
// 必要モジュールの読み込み
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const discord_js_1 = __importDefault(require("discord.js"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const Misskey = __importStar(require("misskey-js"));
const log4js_1 = require("log4js");
class Config {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(config) {
        this.epgstationUrl = config.data.epgstation_url;
        exports.logger.debug(config.data.use_client);
        this.client = config.data.use_client;
        this.webhookUrl = String(config.data.discord_webhookURL).split('/');
        const [, , , , , id, token] = this.webhookUrl;
        this.webhook = new discord_js_1.default.WebhookClient(id, token);
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
            maxLogSize: 10485760,
            backups: 3,
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
(0, log4js_1.configure)(logOptions);
exports.logger = (0, log4js_1.getLogger)();
// 設定ファイルから読み込み
let configData;
try {
    configData = js_yaml_1.default.load(fs_1.default.readFileSync(path_1.default.join(__dirname, "../config.yaml"), "utf8"));
    exports.logger.debug(configData);
}
catch (e) {
    exports.logger.error("config.yaml not found!");
}
exports.config = new Config(configData);
// Misskey API初期化
exports.client = new Misskey.api.APIClient({ origin: exports.config.misskeyInstanceUrl, credential: exports.config.misskeyApiKey });
//# sourceMappingURL=config.js.map