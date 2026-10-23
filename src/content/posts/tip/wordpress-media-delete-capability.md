---
id: 837
type: tip
slug: "wordpress-media-delete-capability"
title: "「User Role Editor」を使用したときなどに確認したい。メディアを削除したり編集する権限 -『wordpress』"
date: 2016-12-20T10:33:06+09:00
modified: 2017-02-13T13:10:39+09:00
excerpt: "WordPressでプラグイン「User Role Editor」を使用してカスタマイズした権限グループを作成して権限を管理していたとき、メディアの権限についてわかりにくかったので、備忘録です。 メディアを削除したり編集"
primaryTag: "wordpress"
terms:
  - { id: 85, name: "plug-in", slug: "plug-in" }
  - { id: 64, name: "wordpress", slug: "wordpress" }
legacy:
  prev: wordpress-eyecatch
  next: wordpress-body-class
---

WordPressでプラグイン「User Role Editor」を使用してカスタマイズした権限グループを作成して権限を管理していたとき、メディアの権限についてわかりにくかったので、備忘録です。

## メディアを削除したり編集する権限

権限グループを作成して権限を管理していたとき、`upload_files`でアップロードの許可はできたのですが、アップロードしたメディアが削除出来ませんでした。「User Role Editor」の設定画面にはファイルに関する権限の記述がありません。

結局のところ、メディアの権限は`others_posts`系の権限を解除することで解決しました。`edit_others_posts`と`delete_others_posts`にチェックを入れた権限は編集と削除が可能になります。
