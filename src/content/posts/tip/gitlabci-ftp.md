---
id: 1579
type: tip
slug: "gitlabci-ftp"
title: "GitLabにコミットしたら、FTPでサーバにアップロードする自動化を１分で行う方法。-『Git』"
date: 2017-11-20T17:15:10+09:00
modified: 2017-11-22T16:18:10+09:00
excerpt: "GitLabがビルトインしているGitLabCIを使うと、.gitlab-ci.yml というファイルの設置だけで、とても簡単にデプロイの自動化を実現できます。 Git環境での作業効率化／自動化の、誰でも取り組めるTip"
primaryTag: "git"
terms:
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 223, name: "git", slug: "git" }
  - { id: 82, name: "speed", slug: "speed" }
legacy:
  prev: nodebrew-manage-nodejs
  next: prettydiff
---

GitLabがビルトインしているGitLabCIを使うと、`.gitlab-ci.yml` というファイルの設置だけで、とても簡単にデプロイの自動化を実現できます。

Git環境での作業効率化／自動化の、誰でも取り組めるTipsです。

## GitLabとは

GitLabは、ポストGitHubなGitのリポジトリをホスティングをするアプリケーションです。\
サーバーを用意してインストールすることもできるのですが、今回は便利で気軽にブラウザ上で利用出来る [GitLab.com](https://about.gitlab.com/) を前提とします。

GitLabは無料で利用できることが充実していて、非公開のプライベートプロジェクトを作れますし、今回紹介するCI/CDも上限はありますが無料です。

## １分でやりたい簡単なデプロイの自動化

要件は、

1. マスターブランチにコミット
2. リモートにプッシュ
3. サーバーにアップロード

ということです。

## .gitlab-ci.ymlを設置する

レポジトリのルートに `.gitlab-ci.yml` というファイルを追加します。やることは、このファイルの設置と書き換えのみなので、１分くらいでデプロイの自動化を実現できますね。

#### gitlab-ci.yml

```

variables:
  HOST: "example.com"
  USERNAME: "yourName"
  PASSWORD: "yourPass"
  LOCAL: "./your/dist/dir"
  SERVER: "./your/public_html"

deploy:
  script:
    - apt-get update -qq && apt-get install -y -qq lftp
    - lftp -c "set ftp:ssl-allow no; open -u $USERNAME,$PASSWORD $HOST; mirror -R $LOCAL $SERVER --parallel=10"
  only:
    - master


```

### .gitlab-ci.ymlを書き換える

それぞれの環境に合わせるために、`variables` の項目を任意のものに書き換えます。`LOCAL` はレポジトリのデプロイしたいディレクトリ、`SERVER` はサーバーへのパスを記述します。

このファイルをマスターにコミットすると、GitLabCIが動くようになります。GitLabのデフォルトの設定で、`.gitlab-ci.yml` の有無で、GitLabCI が動くようになっています。

ここでは、[lftp](https://lftp.yar.ru/) というツールをインストールし、それを利用してサーバに接続しています。`mirror` にいろいろなオプションを渡すことで、アップロードを制御できます。

- [lftp(1)](https://qz.tsugumi.org/man_lftp.html)

これで、必要なことは終わりです。

## ログとか見たい

デプロイのログは、GitLabの任意のレポジトリの中で、サイドバーの「CI/CG」 / 「Pipelines」から辿ることができるので、詳細を確認することができます。

ログから走らせたジョブをリトライをする、などの操作もできます。何かエラーが発生したときは、メールで通知が届くようになっています。

## 参考

- [Configuration of your jobs with .gitlab-ci.yml](https://gitlab.com/help/ci/yaml/README)
- [lftp(1)](https://qz.tsugumi.org/man_lftp.html)

GitLabCIはテストの自動化など、かなり複雑なCI(継続的インテグレーション)を実現できるらしいです。が、それに取り組む前に、知識がなくても簡単に実現できる自動デプロイの紹介でした。

GitLabCIは、いまのところ無料で利用できます、、GitLab素敵ですよね。

おわります。
