---
id: 681
type: tip
slug: "slack-idea"
title: "Slackで作業とコミュニケーションと毎日をものすごく効率化する -『tool』"
date: 2016-11-11T11:01:45+09:00
modified: 2016-11-11T19:00:36+09:00
excerpt: "コミュニケーションツールSlackでの便利な使い方やアイデアを随時まとめていきます。 「 Slack 」は、アメリカで開発されたチャットができるコミュニケーションツールです。チームでのコミュニケーションツールとして利用で"
primaryTag: "slack"
terms:
  - { id: 218, name: "slack", slug: "slack" }
  - { id: 80, name: "tool", slug: "tool" }
legacy:
  prev: ejs-basic
  next: wordpress-rss-cpt
---

コミュニケーションツールSlackでの便利な使い方やアイデアを随時まとめていきます。

「 [Slack](https://slack.com/) 」は、アメリカで開発された**チャットができるコミュニケーションツール**です。チームでのコミュニケーションツールとして利用でき、1対1のダイレクトメッセージ、ルームの公開・非公開の設定、ファイルのやり取り、強力な検索機能、iOS / Android / Mac /Windowsでのアプリを使ってデバイスを問わずコミュニケーションが可能になります。また、チームという枠にとらわれず、個人的な情報整理の場所としてもすごく有能で、様々な拡張機能（integration）と連携させて、BOTを動かしたりなどSlackを簡単で自由にカスタマイズすることも可能です。

Slackでは全て英語が言語になりますが、とてもUIが優れているので英語が苦手な方でも操作することは容易だとおもいますし、単語の意味を少し調べるだけで何をすればいいのかは理解できるので安心してください。個人的にはこのまま日本語化されずに英語のまま使っていたいなあと思っています、見た目がいいもん。

## Slackで作業とコミュニケーションを毎日を効率化する

無料で利用できるfree（フリー）プランで小規模なチームだったら十分事足りるとおもいますが、機能制限があります。

- ログの保存が10,000件
- 拡張機能（integrations）は10個
- チーム内で使用できるストレージ容量が5GB

### 後で見返したいメッセージにはスター

Slackのスレッド上では既読したものが流れてどんどんと流れていってしましますが、スターをつけておくことですぐに見返すことができます。このスターをつけておくことで無料プランの場合に投稿の保存上限を超えても削除されなくなるところもポイントです。

スターをつけてあとで見返すということですが、todoリストみたいに使用している方もいるみたいですね。

### Slackのチャンネルやチームの管理

LINEでグループをつくるように、Slackでは「チーム」をつくります。そのチーム内ではさらに「チャンネル」という部屋をつくってやりとりを管理していきます。プライベート用、社内用、ブログ用、とかで「チーム」をつくり、その中で細かく「チャンネル」をつくって必要に応じて通知を出したり出さなかったりして情報を整理していきます。

似通ったチャンネルをプレフィクス(接頭語)をつけるとリストの見通しが良くなります。オブジェクト指向ぽい感覚でしょうか。

<dl><dt>シェアしたいチャンネル</dt><dd>share_site, share_cord, share_tool</dd><dt>案件ごとのチャンネル</dt><dd>work_nanika, work_enjyou, work_kantan</dd></dl>

### SlackでRSSを購読する

Slackのintegration「 [RSS Integratoins](https://slack.com/apps/A0F81R7U7-rss) 」でRSSフィードを購読することができます。フィードのURLを入力して、チャンネルを選択します。購読したいRSSをチャンネル毎に登録して振り分けることができるので、必ず見ておきたいものにはアラートを出したり、フィードとしてかなり優秀なのではないのでしょうか。さらにそこからEvernoteなどとも連携をとって蓄積しておくのもいいかもしれません。

例えばデザインの情報はこんな感じのものを購読しています。どれも素敵なものばかり流れてくるのでフィードが美しなっていくのがたまりません。。

#### design feed

- [csswinner](http://feeds.feedburner.com/csswinner)
- [awwwards](http://feeds.feedburner.com/awwwards-sites-of-the-day)
- [cssda](http://feeds.feedburner.com/cssda-websites-of-the-day)
- [muuuuu.org](http://muuuuu.org/feed)
- [sitesee.co](https://sitesee.co/feed)
- [s5-style](http://feeds.feedburner.com/s5-styleRSS)

### SlackとBacklogを連携する

プロジェクト管理ツール「 [Backlog](http://www.backlog.jp/) 」と連携させておくことで、課題の追加など動きがあった際にSlackにログをつけておくことができます。メールだけの通知だと未読メールが溜まっていてうんざりすることも多々ありますし、メールには一定の制限をかけておいてSlackのチャンネルで管理してやると、精神衛生が保たれるような気がしてなりません。

詳しくはこのエントリーで解説されているので、参照してください。「 [Webhook を使ってノンプログラミングで Backlog と外部サービスをつなげてみよう！](https://nulab-inc.com/ja/blog/backlog/integrate-backlog-using-webhook/) 」

おわります。
