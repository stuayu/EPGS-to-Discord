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
    constructor(configData) {
        this.epgstationUrl = configData.epgstation_url;
        exports.logger.debug(configData.use_client);
        this.client = configData.use_client;
        this.webhookUrl = String(configData.discord_webhookURL).split('/');
        const [, , , , , id, token] = this.webhookUrl;
        this.webhook = new discord_js_1.default.WebhookClient(id, token);
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
            maxLogSize: 10485760,
            backups: 3,
            compress: true,
        },
    },
    categories: {
        default: {
            appenders: ['console', 'logfile'],
            level: 'debug',
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
exports.config = new Config(configData.data);
// Misskey API初期化
exports.client = new Misskey.api.APIClient({ origin: exports.config.misskeyInstanceUrl, credential: exports.config.misskeyApiKey });
//# sourceMappingURL=config.js.map