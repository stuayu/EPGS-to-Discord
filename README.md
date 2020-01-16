# EPGS-to-Discord

[Mirakurun](https://github.com/Chinachu/Mirakurun) を使用した録画管理ソフト [EPGStation](https://github.com/l3tnun/EPGStation)のログを
Webhook を使用して Discord上に通知するスクリプトです。
[advancedbear氏の作成されたもの](https://github.com/advancedbear/EPGS-to-Discord) に微少の説明の追加, メッセージの変更のみ行ったものです。

# Installation

#### EPGS-to-Discord 側の設定
```
$ cd <任意のディレクトリ>
$ git clone https://github.com/yuun-dev/EPGS-to-Discord.git
$ cd EPGS-to-Discord
$ npm install
$ cp config.json.sample config.json
$ vi config.json
```
`"host"` : EPGStation を実行しているホストのアドレス  
`"basicId"` , `"basicPass"` : Basic認証を設定している場合はその事項  
`"webhookURL"` : [デスクトップ版Discordより取得](https://support.discordapp.com/hc/ja/articles/228383668-%E3%82%BF%E3%82%A4%E3%83%88%E3%83%AB-Webhooks%E3%81%B8%E3%81%AE%E5%BA%8F%E7%AB%A0)できるWebhook URLを記述

#### Mirakurun, EPGStation のポート番号を変更している場合
↓を編集
```
$ vi index.js
```
`Mirakurun`のポートを変更している場合 `41行目`の `40772` を適宜変更  
`EPGStation`のポートを変更している場合 `35行目`の `8888` を適宜変更

#### EPGStation 側の設定
変更対象は EPGS-to-Discord ではなく EPGStation の config.json なので注意
```
$ vi <EPGStationのディレクトリ>/config/config.json
```
ここに
```
"isEnabledDropCheck": true,
"reservationAddedCommand": "/usr/bin/node <EPGS-to-Discordのディレクトリ>/index.js reserve",
"recordedStartCommand": "/usr/bin/node <EPGS-to-Discordのディレクトリ>/index.js start",
"recordedEndCommand":"/usr/bin/node <EPGS-to-Discordのディレクトリ>/index.js end",
```
を追記。  
あとは念のため `pm2 restart EPGStation` 等してリロードさせてください。  
  
# Demo
![demo-pic01](https://i.imgur.com/lPRCGOB.png)
