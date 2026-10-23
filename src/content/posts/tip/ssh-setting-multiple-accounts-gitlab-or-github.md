---
id: 2282
type: tip
slug: "ssh-setting-multiple-accounts-gitlab-or-github"
title: "GitLabやGitHubで複数アカウントを持つときのssh設定-『Git』"
date: 2018-02-11T00:50:19+09:00
modified: 2020-02-04T15:49:13+09:00
excerpt: "GitLabやGitHubで、複数アカウントを切り替えて使用するときなど、SSHを複数用意してssh接続する種のtipsです。新しくGitlabのアカウントを増やしたいとき、ということで想定して進めていきます。 秘密鍵を"
primaryTag: "git"
terms:
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 223, name: "git", slug: "git" }
  - { id: 80, name: "tool", slug: "tool" }
legacy:
  prev: webstorm-how-to-search
  next: vue-vuex
---

GitLabやGitHubで、複数アカウントを切り替えて使用するときなど、SSHを複数用意してssh接続する種のtipsです。新しくGitlabのアカウントを増やしたいとき、ということで想定して進めていきます。

## 秘密鍵を作る

移動します。

```bath

cd ~/.ssh/


```

鍵を作成します。

```bath

ssh-keygen -t rsa -C "[your-mail-address@mail.com]" -f [your-file-name]


```

`[your-mail-address@mail.com]` と `[your-file-name]` は任意です。

作成したsshキーをコピーします。

```bath

pbcopy < ~/.ssh/[your-file-name].pub


```

コピーしたものを GitLab の settings でペーストし登録します。

## configの作成

.ssh ディレクトリに config というファイルを作り(.ssh/config)、エディタで以下のように記述します。

```bath

Host gitlab-[your-name].com
  User git
  Port 22
  HostName gitlab.com
  IdentityFile ~/.ssh/[your-file-name]
  TCPKeepAlive yes
  IdentitiesOnly yes


```

`[your-name]` は任意です。 `[your-file-name]` はsshキーを作ったときのファイルと対応させます。

接続のチェックをします。

```bath

ssh -T gitlab-[your-name].com


```

## クローン／登録

クローンする場合も、リモートリポジトリをローカルに登録する場合も、`git@gitlab.com` といつもしているところを `git@gitlab-[your-name].com` に書き換える必要があります。 `[your-name]` は configファイルで記述した、`[your-name]` と一致します。

### リモートリポジトリの登録

```bath

git remote add origin git@gitlab-[your-name].com:username/repositoryname.git


```

Github が出力してくれる URL をそのままコピペするなどして、もし、リモートレポジトリの登録を間違っていたら、一旦次のコマンドで消しましょう。

```bath

git remote rm origin


```

### クローン

```bath

git clone git@gitlab-[your-name].com:username/repositoryname.git


```

おわります。
