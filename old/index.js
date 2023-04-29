// 必要モジュールの読み込み
const request   = require('request')
const exec      = require('child_process').execFile
const fs        = require('fs')
const path      = require('path')
const iconv     = require('iconv-lite')
const Discord   = require('discord.js')
// EPGStationより渡される環境変数を定数に代入
const _nowDate = new Date();
const _channel = process.env.CHANNELNAME
const _title = process.env.NAME
const _description = process.env.DESCRIPTION
const _programid = process.env.PROGRAMID
const _recordedid = process.env.RECORDEDID
const _date = new Date(Number(process.env.STARTAT)).toLocaleDateString("japanese", {year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'long'})
const _startAt = new Date(Number(process.env.STARTAT)).toLocaleTimeString("japanese")
const _endAt = new Date(Number(process.env.ENDAT)).toLocaleTimeString("japanese")
const _Path = process.env.RECPATH // 録画ファイルの保存フォルダを指定

// コンフィグファイルの読み込み
var _config;
try {
    _config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"))
} catch (e) {
    console.error("config.json not found!")
    process.exit()
}
const M_host = _config.mirakurun_host // Mirakurunの動作するホストアドレス
const E_host = _config.epgstation_host // EPGStationの動作するホストアドレス
const M_hostName = "http://"+M_host 
const E_hostName = !_config.basicId ? "http://"+E_host : "http://"+_config.basicId+':'+_config.basicPass+'@'+E_host //動作ホストのアドレス（BASIC認証対応）
const webhookURL = _config.webhookURL.split('/') // DiscordのWebhookアドレス
const webhook = new Discord.WebhookClient(webhookURL[5],webhookURL[6]) //Discord Webhookの初期化

var getRecorded = (recordedId, callback)=>{
    // 録画IDを用いてEPGStation API経由で録画番組情報を取得する
    // EPGStation側のポートを変更している場合は 8888 を適宜環境に合わせて変更
    request.get(E_hostName+"api/recorded/"+recordedId+"?isHalfWidth=true", (err, res, body)=>{
        !err ? callback(body): callback(err)
    })
}
var getProgram = (programlId, callback)=>{
    // 番組IDを用いてMirakurun API経由で番組情報を取得する
    // Mirakurun側のポートを変更している場合は 40772 を適宜環境に合わせて変更
    request.get(M_hostName+"api/programs/"+programlId, (err, res, body)=>{
        !err ? callback(body): callback(err)
    })
}
var dropCheck = (callback)=>{
    // ドロップ情報を取得して返す
    let recInfo = getRecorded(_recordedid, (json)=>{
        json = JSON.parse(json)
        try{
            callback(json.dropLogFile.errorCnt, json.dropLogFile.dropCnt, json.dropLogFile.scramblingCnt)
        } catch(e) {
            callback(-1, -1 ,-1)
        }
    })
}

var postMessage = (message)=>{
    webhook.send(message) // WebHookでmessageを送信するだけ
}

if(process.argv[2] === 'start'){
    // 録画開始時に投稿するメッセージ
    postMessage(':red_circle: 録画開始 __**'+_title+'**__\n```'+_startAt+'～'+_endAt+'［'+_channel+'］```')
}
else if(process.argv[2] === 'end'){
    // 録画終了時に投稿するメッセージ
    mes = ":white_large_square: 録画終了 " + ' __**' + _title + '**__\n```' + _startAt + '～' + _endAt + '［' + _channel + '］\n'
    dropCheck((err, drop, scr)=>{
        if(err==-1) mes += "!===== Cannot load recorded file! =====!```" // 実行結果がnullの場合
        else if(err!=0){
            // 映像PIDのd値（ドロップ値）が0でない場合≒ドロップがある場合は詳細を投稿（メンション付き）
            mes += "!===== This MPEG-TS has dropped frame! =====!\n"
            mes += 'Error:     '+err+'\nDrop:      '+drop+'\nScrmbling: '+scr+'```\@everyone'
        } else {
            // 映像PIDのd値が0の場合はドロップがないのでその旨を投稿
            mes += "!===== This MPEG-TS has no drop =====!```"
        }
        postMessage(mes)
    })
}
else if(process.argv[2] === 'reserve'){
    // 録画予約時に投稿するメッセージ
    postMessage(':white_check_mark: 予約追加 __**'+_title+'**__\n```'+_date+' '+_startAt+'～'+_endAt+'［'+_channel+'］\n'+_description+'```')
}
else if(process.argv[2] === 'update') {
    // 録画予約の更新時に投稿するメッセージ
    postMessage(':large_orange_diamond: 録画予約更新 __**'+_title+'**__\n```'+_date+' '+_startAt+'～'+_endAt+'［'+_channel+'］\n'+_description+'```')
}
else if (process.argv[2] === 'deleted') {
    // 録画予約の削除時に投稿するメッセージ
    postMessage(':wastebasket: 録画予約削除 __**'+_title+'**__\n```'+_date+' '+_startAt+'～'+_endAt+'［'+_channel+'］\n'+_description+'```')
}
else if (process.argv[2] === 'prestart') {
    // 録画実行準備の開始時に投稿するメッセージ
    postMessage(':briefcase: 録画実行準備 __**'+_title+'**__\n```'+_date+' '+_startAt+'～'+_endAt+'［'+_channel+'］\n'+_description+'```')
}
else if (process.argv[2] === 'prepfailed') {
    // 録画実行準備に失敗した時に投稿するメッセージ
    postMessage(':warning: 録画実行準備に失敗 __**' + _title + '**__\n```' + _date + ' ' + _startAt + '～' + _endAt + '［' + _channel + '］\n' + _description + '```\録画実行準備に失敗しました．\@everyone')
}
else if (process.argv[2] === 'recfailed') {
    // 録画実行に失敗した時に投稿するメッセージ
    postMessage(':warning: 録画失敗 __**'+_title+'**__\n```'+_date+' '+_startAt+'～'+_endAt+'［'+_channel+'］\n'+_description+'```\録画実行に失敗しました．\@everyone')
}