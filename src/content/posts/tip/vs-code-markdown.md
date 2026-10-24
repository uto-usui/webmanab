---
id: 2600
type: tip
slug: "vs-code-markdown"
title: "VS code で最強の Markdown 環境をつくる方法 -『tool』"
date: 2019-03-24T21:30:36+09:00
modified: 2019-12-26T18:04:00+09:00
excerpt: "Visual Studio Code（VS Code）はデフォルトで Markdown を使って記述されたドキュメントをサポートしていますが、拡張機能でさまざまな追加機能をサポートしてあげると、最強の Markdown"
primaryTag: "tool"
terms:
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 80, name: "tool", slug: "tool" }
  - { id: 353, name: "VScode", slug: "vscode" }
legacy:
  prev: redmine-image
  next: css-grid-for-ie
---

Visual Studio Code（VS Code）はデフォルトで Markdown を使って記述されたドキュメントをサポートしていますが、拡張機能でさまざまな追加機能をサポートしてあげると、最強の Markdown の記述環境を準備できます。

## Markdown All in One

- [Markdown All in One – Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)

Markdown を扱う際には必ず入れておきたい最初の拡張機能だと思います。これを有効にすると

- ショートカットキーで Markdown を入力
- 画像の挿入時にパスの入力を補完
- Markdown のアウトライン表示
- md ファイルを開くと自動でプレビューを表示

といった機能が使えるようになります。

## markdownlint

- [markdownlint – Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)

Markdown の text lint を実行してくれる拡張機能です。開発者なら linter をかけてコードフォーマットに一貫性を持たせる文化が一般的ですが、Markdown にもそれを持ち込むことで品質の高いドキュメントを作成します。チェック内容は設定ファイルで変更して、好みのルールを設定できます。

## Paste Image

- [Paste Image – Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=mushan.vscode-paste-image)

クリップボードの画像を Markdown ファイルなどに直接貼り付けられる拡張機能です。コピーした画像を Cmd+option+v で、Markdown ファイル内に貼り付けられ、同一ディレクトリに保存されます。保存先は設定ファイルで変更できます。スクショを利用したいときなど、この辺り素敵に利用できると思います。

## テキスト校正くん

- [GitHub – ics-creative/project-japanese-proofreading: テキストファイルや Markdown ファイルの日本語の文章をチェックする VS Code の拡張機能](https://github.com/ics-creative/project-japanese-proofreading)

「テキスト校正くん」はテキストやマークダウンで、日本語のおかしい箇所をチェックできる拡張機能です。

## VS code は素敵だ

ぼくは普段、コーディングは WebStorm で作業しているのですが、Markdown を執筆するときは VS code に持ち替えて作業するようにしています。WebStorm はとても優れたエディタですが、Markdown 環境においては VScode には全然劣ってしまいますね。さすがです 👏🏻

というのも VS code は拡張機能で使いやすさを担保していく思想があるので、そういったサブリソースが発展しているなかで、日本語対応の拡張があったりしていて、より良い好みの DX を手に入れることができるようになっていますね。そういう意味では、開発環境に好奇心旺盛なエンジニアにはぴったりなエディタだと言えますね。

ただ怠惰なぼくは、とにかく楽したいの気持ちが強いので、基本は全部盛りしていてくれる WebStorm を使うことになるのですが、markdown 環境だけは VSCode に浮気していきたいと思います。

おわります。
