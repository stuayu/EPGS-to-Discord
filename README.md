# EPGS-to-Discord

[![](https://img.shields.io/badge/Origin-advancedbear-28a745?style=for-the-badge)](https://github.com/advancedbear/EPGS-to-Discord) 
[![](https://img.shields.io/github/license/yuun-dev/EPGS-to-Discord?style=for-the-badge)](LICENSE) 
[![](https://img.shields.io/badge/Twitter-%40nekonoyun-00acee?style=for-the-badge)](https://twitter.com/nekonoyun) 
[![](https://img.shields.io/badge/Discord-%E3%82%86%E3%82%93%20%238138-7289da?style=for-the-badge)](#)

[Mirakurun](https://github.com/Chinachu/Mirakurun) を使用した録画管理ソフト [EPGStation](https://github.com/l3tnun/EPGStation) のログを
Webhook を使用して Discord上に通知するスクリプトです。
[advancedbear氏の作成されたもの](https://github.com/advancedbear/EPGS-to-Discord) に微少の説明の追加, メッセージの変更のみ行ったものです。 

[nekonoyun氏が変更を加えたもの](https://github.com/nekonoyun/EPGS-to-Discord)にさらに変更を加えてあります。

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

#### Mirakurun, EPGStation のポートなどをデフォルトからを変更している場合
↓を編集
```
$ vi config.json
```
`Mirakurun`のポートを変更している場合 `mirakurun_host`の `40772` を適宜変更  
`EPGStation`のポートを変更している場合 `epgstation_host`の `8888` を適宜変更  
`EPGStation`をサブディレクトリで運用している場合 `epgstation_host`の / 以降に `hoge/` をなどを追加してください
```
EPGStationを hoge 以下で運用している場合
"epgstation_host":"127.0.0.1:8888/hoge/"
```
#### EPGStation 側の設定
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
  
# Demo
![demo-pic01](https://i.imgur.com/lPRCGOB.png)
