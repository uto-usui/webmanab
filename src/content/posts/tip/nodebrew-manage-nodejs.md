---
id: 1575
type: tip
slug: "nodebrew-manage-nodejs"
title: "nodebrewでnode.jsのバージョン管理をする -『front-end』"
date: 2017-10-26T17:37:45+09:00
modified: 2018-02-04T13:19:34+09:00
excerpt: "node.jsのバージョン管理をするために、nodebrewを導入します。 node.jsをすでにパッケージでインストールしている場合は、 MacにpkgでインストールしたNode.jsをアンインストールする手順 これで"
primaryTag: "frontend"
terms:
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 29, name: "javascript", slug: "javascript" }
  - { id: 297, name: "node.js", slug: "node-js" }
legacy:
  prev: wordpress-rest-api
  next: gitlabci-ftp
---

node.jsのバージョン管理をするために、nodebrewを導入します。

node.jsをすでにパッケージでインストールしている場合は、

- [MacにpkgでインストールしたNode.jsをアンインストールする手順](http://qiita.com/yoshikoba/items/4906829faaaae8c73e56)

これでアンインストールします。

## nodebrewをインストールするためにHomebrewをインストール

Homebrewを導入していない場合は、まずHomebrewをインストールします。

- [Homebrew](https://brew.sh/)

## nodebrewをインストール

```

brew install nodebrew


```

### エラーするとき

ちょうどぼくの環境だと、インストールしようとしたら、以下のエラーが出ました。

```

Please delete these paths and run `brew update`.


```

というわけで、いらないものを削除して、アップデートします。

```

rm -rf /usr/local/share/doc/homebrew


```

そして、

```

brew update


```

これで解決しました。

### nodebrewのセットアップ

```

nodebrew setup


```

### Node.jsをインストール

インストール可能なNode.jsのバージョン一覧を見てみます。

```

nodebrew ls-remote


```

目標を確認できたらインストールします。

```

nodebrew install-binary [version]


```

インストールしたものを確認します。

```

nodebrew ls


```

最新版をインストールするには、

```

nodebrew install-binary latest


```

安定版をインストールするには、

```

nodebrew install-binary stable


```

## 使用するバージョンを指定する

幾つかのバージョンをインストールしたら、使用するバージョンを指定します。

```

nodebrew use [version]


```

## pathを通す

pathを通さないとnodeコマンドが実行できません。

`~/.bash_profile` に記述します。

```

echo 'export PATH=$HOME/.nodebrew/current/bin:$PATH' >> ~/.bash_profile


```

そして再読み込みさせます。

```

source ~/.bash_profile


```

すると、 `node -v` などなどの nodeコマンドを使うことができるようになります。

- [PATHを通すとは？ (Mac OS X) – Qiita](https://qiita.com/soarflat/items/09be6ab9cd91d366bf71)
- [PATHを通すために環境変数の設定を理解する (Mac OS X) – Qiita](https://qiita.com/soarflat/items/d5015bec37f8a8254380)

## その他

### アンインストール

不要なnode.jsのversionは削除しましょう。

```

nodebrew uninstall [version]


```

### ついでにyarnもインストール

```

brew install yarn


```

### IDEに注意される

ぼくはWebStormを使っているのですが、node.jsへのパスが変わってしまったので警告されました。パスを通すことをアシストしてくれるので、設定し直します。または、環境設定から、node.jsと検索すると、パスを通す画面に移行するので、そこから設定しておきます。

おわります。
