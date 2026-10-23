---
id: 240
type: tip
slug: "genymotion"
title: "フロントエンド開発を効率化。android環境でのデバッグをするために、Genymotionを使うためのまとめ – 『android』"
date: 2016-07-19T18:37:43+09:00
modified: 2017-01-19T19:49:06+09:00
excerpt: "Genymotionでandroid環境を構築 androidの開発環境および、ウェブページのチェックなどちょっとしたデバッグ環境をGenymotionを使って構築します。 Genymotionは様々な仮想デバイス環境を"
primaryTag: "android"
terms:
  - { id: 125, name: "android", slug: "android" }
  - { id: 127, name: "debug", slug: "debug" }
  - { id: 80, name: "tool", slug: "tool" }
legacy:
  prev: svg-height
  next: aquarelle
---

## Genymotionでandroid環境を構築

androidの開発環境および、ウェブページのチェックなどちょっとしたデバッグ環境をGenymotionを使って構築します。

Genymotionは様々な仮想デバイス環境を複数構築でき、個人利用に限り無料で使用できます。すごく便利です。

### Genymotionへのユーザー登録

まずは[Genymotion](https://www.genymotion.com/)へのユーザー登録を行います。

1. ナビゲーション / Sigh inをクリック
2. 「Create account」のボタンをクリック
3. 登録内容を入力 ユーザー名 / メールアドレス /パスワード
4. 「I accept terms of the privacy statement」にチェックを入れて「Create account」ボタンをクリック
5. メーラーでメールを開き、「Click here」をクリックしてアクティベートしてウェルカムページへ飛ぶ

### Genymotion.appをインストール

ウェルカムページへ飛んだ後は、ダウンロードおよびインストールを行います。

1. ナビゲーション / 「Pricing」をクリック
2. タブ / 「Individual」をクリックして切り替える
3. 左側のカード / BASICの「Get started」をクリック
4. 「Download Genymotion package」のボタンをクリック
5. 「Download for Mac OSX – 83MB」のボタンをクリック
6. 通常のアプリのインストール「Genymotion Shell」「Genymotion」と２つパッケージされていますが「Genymotion」のみでok

### Oracle VM VertualBoxをインストール

Genymotion.appはOracle VM VertualBoxがインストールしている環境でないと動かすことができません。\
[Oracle VM VertualBox](http://www.oracle.com/technetwork/server-storage/virtualbox/downloads/index.html?ssSourceSiteId=otnjp)の該当のパッケージをダウンロードしてインストールします。

## 操作説明

端末とバージョンを指定した仮想環境の構築と、日本語環境の設定です。

1. Addボタンをクリックして、「Select a new virtual device」ウインドウを開く
2. usernameとpasswordを入力して、ログインする
3. Android versionとDevice modelでソートをかけて必要な端末を絞り込む
4. 端末を選択してNextボタンでダウンロード
5. 日本語化する時は、「アプリボタン / Settings / Language & input / Language / 「日本語」を選択 」
6. 日本語入力の設定「言語と入力 / キーボードと入力方法 / Japanese IMEを選択 / デフォルト / 入力方法の選択ダイアログで、日本語 Japanese IMEを選択

## Google Playを利用できるようにする

デフォルトのままだとGoogle Playが仮想端末にダウンロードされていないので、デフォルト以外のchromeなどデバッグで使いたいアプリを利用することができません。\
[GApps](https://www.androidfilehost.com/?fid=23252070760974384)と[Google Apps for Android](http://stackoverflow.com/questions/17831990/how-do-you-install-google-frameworks-play-accounts-etc-on-a-genymotion-virt)をダウンロードして仮想環境にドロップして再起動することでGoogle Playを利用できるようになります。

ただしこの使い方は非推奨とされていて、端末の種類やバージョンによっては上手くいかないこともあり、利用できてもアラートが連発してしまうなど、多少の弊害は考慮しておきましょう。

1. GAppsのインストール
2. ダウンロードしたファイルをzipのまま、起動した仮想デバイスの画面にドロップ、再起動(ウインドウを閉じて、もう一度起動させる)
3. Google Apps for Androidの該当のバージョンをダウンロードして、起動した仮想デバイスの画面にドロップ、再起動
4. 「問題が発生」的なアラートが出るが無視して、OKを連打
5. playストアを起動しgoogleアカウント情報を入力

おわります。
