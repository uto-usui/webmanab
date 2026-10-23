---
id: 948
type: tip
slug: "google-anlytics-invalidate-my-access-by-specifying-an-ip-address"
title: "フィルタ設定がうまくいかないとき。google anlyticsでIPアドレスを指定して自分のアクセスを無効化する方法 -『SEO』"
date: 2017-01-22T22:21:15+09:00
modified: 2017-01-23T17:29:53+09:00
excerpt: "google anlyticsで自分のアクセスをカウントしないようにIPアドレスを指定して除外する方法です。少しうまくいかなかったのですが、とりあえず解決したので備忘録です。 google anlyticsでIPアドレス"
primaryTag: "SEO"
terms:
  - { id: 98, name: "seo", slug: "seo" }
legacy:
  prev: from-http-to-https
  next: javascript-eslint-gulp
---

google anlyticsで自分のアクセスをカウントしないようにIPアドレスを指定して除外する方法です。少しうまくいかなかったのですが、とりあえず解決したので備忘録です。

## google anlyticsでIPアドレスを指定して自分のアクセスを無効化する方法

google anlyticsで自分のアクセスをカウントしないようにするにはanlyticsの管理設定で、フィルタをかける必要があります。一番簡単な方法は任意のIPアドレスを指定することで、そのIPアドレスのアクセスの集計を無効化するというやり方です。

### IPアドレスを調べる

自分のIPアドレスを調べるために簡単なオンラインツールがあります。

- [whatismyipaddress](http://whatismyipaddress.com/)

ここで表示された自分のIPアドレスをコピーしておきます。

### google anlyticsでフィルタを作成する

ここからgoogle anlyticsでの作業になります。

1. google anlyticsにアクセス
2. 「管理 > すべてのフィルタ > フィルタを追加」
3. 定義済み・除外・IPアドレスからのトラフィック・等しい
4. IPアドレスにコピーしておいたIPアドレスをペースト
5. フィルタの名前を入力
6. 「保存」

### 注意するポイント

IPv4形式(短いIPアドレス)でも、以前はちゃんと反応していたのですが、今のgoogle anlyticsではフィルタリングすることができなくなっていました。今はIPv6形式のIPアドレスで指定してあげる必要があるようです。

そもそもIPv6接続が行えていない環境ではIPv4のIPアドレスでもきちんとフィルタリングすることができます。もともとはインターネットにおける標準的なプロトコルはIPv4だったのが、 世界的に在庫が少なくなっていて、IPv4アドレスを割り当てることができなくなることが予想されたので、IPv4にかわる次世代のIPv6アドレスができたらしいです。

というわけで、IPv6形式のIPアドレスが表示されるツールを使ったり、OSのネットワーク環境設定からもこのIPアドレスは確認することができるので、それを参照してIPアドレスを指定するようにします。

おわります。
