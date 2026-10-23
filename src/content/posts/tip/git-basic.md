---
id: 467
type: tip
slug: "git-basic"
title: "gitを操作するとき普段使う基本的なコマンドのまとめ -『git基礎』"
date: 2016-10-21T15:56:05+09:00
modified: 2019-02-18T10:55:29+09:00
excerpt: "git操作で基本的で普段使うコマンドのまとめ(使う順) gitのコマンドや基本操作のコマンドや知識についてまとめておきます。 知識深まればどんどん追記します。環境はmacOSです。 []の中は任意のものを記述します。 最"
primaryTag: "git"
terms:
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 223, name: "git", slug: "git" }
legacy:
  prev: divide-retina
  next: variable-javascript
---

## git操作で基本的で普段使うコマンドのまとめ(使う順)

gitのコマンドや基本操作のコマンドや知識についてまとめておきます。\
知識深まればどんどん追記します。環境はmacOSです。\
`[]`の中は任意のものを記述します。

### 最初に必要なこと

例えばGItHubとやりとりしたい場合は、SSH接続なのでSSH keyを作っていれば、その存在確認をしてコピーして、GitHubのプロフィールにペーストします。\
SSH keyなければ作成してからコピペです。

#### SSH keyの存在確認

```

ls -al ~/.ssh


```

ここでSSH keyがあればGitHubのAdd SSHkeyでSSHをペーストします。

#### SSHの新規作成

```

ssh-keygen -t rsa -C [my-email-address@mail.com]


```

そのあと Enter押す / 自分のシステムのpass / 自分のシステムのpass

#### SSHをクリップボードにコピー

```

pbcopy &lt; ~/.ssh/id_rsa.pub


```

#### 登録できたかテスト

```
ssh -T [git@githab.com]

```

### 基本操作

いつも使う基本的な操作。これは覚えとかなきゃいけないよねというものです。

#### クローン

```

git clone [url]


```

任意のディレクトリに移動して、ローカルにリモートリポジトリをクローンします。

#### ローカルリポジトリを作成する

```

git init


```

クローンしない場合は任意のディレクトリでローカルリポジトリを作成。

#### Backlogにリモートリポジトリを作成する

```

git remote add [master] [HTTPS-url]


```

Backlogでgit設定して、HTTPSのurlをコピーして持ってきます。

#### 変更されたファイルの表示

```

git status


```

変更されたファイルだけを確認します。

#### ファイルやディレクトリをインデックスに登録

```

git add [filepattern]


```

ファイルパターンの指定はワイルドカードとかディレクトリ指定とか色々できます。\
全てのファイルをインデックスに登録する場合は、

```

git add .


```

#### ファイルをコミットする

```

git commit -m "[message]"


```

インデックスに登録したファイルをメッセージをつけてコミットします。

#### 履歴の確認

```

git log


```

#### push 変更した内容をリモートリポジトリに反映

```

git push [repository] [branchname]


```

#### pull リモートリポジトリから最新の状態を取得

```

git pull [repository] [branchname]


```

#### ファイルの削除

```

git rm [file]


```

### リモート操作のこと

#### リモートリポジトリの複製

```

git clone [url]


```

#### リモートリポジトリの追加

```

git remote add [repository] [url]


```

### gitの設定

#### ユーザ名の変更

```

git config --global user.name [username]


```

#### メールアドレスの変更

```

git config --global user.email [mailaddress]


```

## こんなときどうするのコマンド

### すでにインデックスされているファイルを監視対象から外す

ローカルにファイルは残したいけど、レポジトリからは削除したいとき。インデックスされているファイルを監視対象から外す方法。

#### gitignore

```

your_directory
your.html


```

#### terminal

```

git rm -r --cached your_directory/


```

または

```

git rm -r --cached your.html


```

上記コマンドのあと、コミットしてプッシュする。

### ローカルファイルの変更を前回のcommitまで戻す

必要なファイルを削除してしまっていたり、修正の必要がなくなったとき、直前のcommit状態に戻します。

```

git reset --hard HEAD


```

### addを取り消す

前回のaddでステージにあげたファイルを全て取り消します。

```

git reset HEAD .


```

### 複数のSSHキーの作成

プライベートと、会社用など使い分ける際は、複数のSSHキーが必要になる時があります。

#### 移動

```

cd ~/.ssh/


```

#### 鍵の作成

`[your-mail-address@mail.com]` と `[your-file-name]` は任意です。

```

ssh-keygen -t rsa -C "[your-mail-address@mail.com]" -f [your-file-name]


```

#### コピー

先ほどしていしたファイル名を入力します。

```

pbcopy < ~/.ssh/[your-file-name].pub


```

### Commiter と Author を変更する

グローバルの設定から個別のプロジェクトで変更したいとき。

#### Commiter 変更

```

git config --local user.name yourname
git config --local user.email yourname@example.com


```

```

git commit --amend


```

#### Author 変更

```

git commit --amend --author="yourname <yourname@example.com>"


```

### コンフリクトしたとき片方の変更だけを適用する

ブランチをマージでコンフリクトしたとき、どちらかだけを適用したい場合は、`checkout --ours` と `checkout --theirs` を使い分けます。

#### 現在のブランチに合わせる

```

git checkout --ours A.html


```

#### マージさせるブランチに合わせる

```

git checkout --theirs B.html


```

そして

```

git commit


```

おわります。
