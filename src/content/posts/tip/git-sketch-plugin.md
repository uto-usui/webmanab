---
id: 2725
type: tip
slug: "git-sketch-plugin"
title: "Git Sketch Plugin を使ってデザインをバージョン管理する -『Sketch』"
date: 2019-11-28T12:46:30+09:00
modified: 2019-11-28T12:46:30+09:00
excerpt: "Sketch.app で作ったデザインを Git Sketch Plugin を使って、簡易的にバージョン管理します。アートボードのスクリーンショットをエクスポートしてくれるのと、簡単な Git の GUI を提供してく"
primaryTag: "design"
terms:
  - { id: 52, name: "design", slug: "design" }
  - { id: 223, name: "git", slug: "git" }
  - { id: 357, name: "sketch", slug: "sketch" }
legacy:
  prev: array-usage
  next: css-redering-performance
---

Sketch.app で作ったデザインを Git Sketch Plugin を使って、簡易的にバージョン管理します。アートボードのスクリーンショットをエクスポートしてくれるのと、簡単な Git の GUI を提供してくれるので、GitHub などからアートボードの diff を確認できるようになります。\
とても便利！

- [Git Sketch Plugin by mathieudutour](https://mathieudutour.github.io/git-sketch-plugin/)

SketchPack などのプラグインマネジメントツールから、Git Sketch Plugin を検索してインストールします。

インストールが完了すると、plugins に Git が追加されているので、そこから　commit や push など、ショートカット付きの GUI としてコントロールできます。

.sketch ファイルを編集後に保存し、advanceed/Generate files for pretty diffs を実行します。

するとアートボードを自動で画像化し、.exportedArtboards/ ファイル内に生成します。合わせて画像を一覧化した md も生成します。そこから commit するなり、コマンドラインから操作するなり、その他のツールでその差分を確認できるようになります。

ポイントとしては、アートボードの名前が一意でないと、重複した画像は生成されないので注意します。

おわります。
