# EPGS-to-Discord
## 変更点
- JavaScriptからTypeScriptに改変
- Discordに送信するメッセージの種類を増加
- Misskeyに投稿できるようにコードを追加
- 設定ファイルをJSONからYAMLに変更
- その他依存パッケージ変更
# Installation

#### EPGS-to-Discord 側の設定
```
$ cd <任意のディレクトリ>
$ git clone https://github.com/stuayu/EPGS-to-Discord.git
$ cd EPGS-to-Discord
$ npm install
$ npm run build
$ cp config.yaml.sample config.yaml
$ vi config.yaml
```
`"epgstation_url"` : EPGStation を実行しているホストのアドレス  
`"discord_webhookURL"` : [デスクトップ版Discordより取得](https://support.discordapp.com/hc/ja/articles/228383668-%E3%82%BF%E3%82%A4%E3%83%88%E3%83%AB-Webhooks%E3%81%B8%E3%81%AE%E5%BA%8F%E7%AB%A0)できるWebhook URLを記述

#### Mirakurun, EPGStation のポートなどをデフォルトからを変更している場合
↓を編集
```
$ vi config.yaml
```
`EPGStation`のポートを変更している場合 `epgstation_host`の `8888` を適宜変更  
`EPGStation`をサブディレクトリで運用している場合 `epgstation_host`の / 以降に `hoge/` をなどを追加してください
```
EPGStationを hoge 以下で運用している場合
"epgstation_url":"http://127.0.0.1:8888/hoge/"
```
#### EPGStation 側の設定(V1)
変更対象は EPGS-to-Discord ではなく EPGStation の config.json なので注意
```
$ vi <EPGStationのディレクトリ>/config/config.json
```
ここに
```
"isEnabledDropCheck": true,
"reserveNewAddtionCommand": "/usr/bin/node <EPGS-to-Discordのディレクトリ>/index.js reserve",
"recordingStartCommand": "/usr/bin/node <EPGS-to-Discordのディレクトリ>/index.js start",
"recordingFinishCommand":"/usr/bin/node <EPGS-to-Discordのディレクトリ>/index.js end",
```
Windowsの場合(C:\TV に nodejs をインストールした場合)
```
"isEnabledDropCheck": true,
"reserveNewAddtionCommand": "C:\TV\nodejs\node.exe <EPGS-to-Discordのディレクトリ>/index.js reserve",
"recordingStartCommand": "C:\TV\nodejs\node.exe <EPGS-to-Discordのディレクトリ>/index.js start",
"recordingFinishCommand":"C:\TV\nodejs\node.exe <EPGS-to-Discordのディレクトリ>/index.js end",
```
を追記。  
あとは念のため `pm2 restart EPGStation` 等してリロードさせてください。  

### EPGStation_V2の設定
EPGStationの `config.yml`を変更
例)
```
reserveNewAddtionCommand: 'C:\Windows\System32\cmd.exe /C node C:\DTV\EPGS-to-Discord\index.js reserve'
recordingStartCommand: 'C:\Windows\System32\cmd.exe /C node C:\DTV\EPGS-to-Discord\index.js start'
recordingFinishCommand: 'C:\Windows\System32\cmd.exe /C node C:\DTV\EPGS-to-Discord\index.js end'
recordingPreStartCommand: 'C:\Windows\System32\cmd.exe /C node C:\DTV\EPGS-to-Discord\index.js prestart'
recordingPrepRecFailedCommand: 'C:\Windows\System32\cmd.exe /C node C:\DTV\EPGS-to-Discord\index.js prepfailed'
recordingFailedCommand: 'C:\Windows\System32\cmd.exe /C node C:\DTV\EPGS-to-Discord\index.js recfailed'
```
  
# Demo
![demo-pic01](https://i.imgur.com/lPRCGOB.png)
