---
id: 2292
type: tip
slug: "docker-instant-php"
title: "PHPの実行環境を docker-compose で簡単1分でつくる -『Docker』"
date: 2018-02-26T16:41:22+09:00
modified: 2018-02-26T17:01:25+09:00
excerpt: "docker-compose.yml ファイルひとつで、php の実行環境を構築します。php ファイルをインクルードして、テンプレートを組むように開発環境を構築したり、プレビューしたいときなどに利用します。データベース"
primaryTag: "docker"
terms:
  - { id: 338, name: "docker", slug: "docker" }
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 339, name: "php", slug: "php" }
legacy:
  prev: el-capitan-to-high-sierra
  next: plain-pattern
---

`docker-compose.yml` ファイルひとつで、php の実行環境を構築します。php ファイルをインクルードして、テンプレートを組むように開発環境を構築したり、プレビューしたいときなどに利用します。データベースは含みません。

Docker for Mac を導入前提とします。

- [Docker For Mac | Docker](https://www.docker.com/docker-mac)

次のファイルをプロジェクトルートに作ります。

#### docker-compose.yml

```bath

app:
  image: debian:jessie
  volumes:
    - ./www:/usr/share/php/html
  tty: true
php:
  image: php:7.0-cli
  expose:
    - "80"
  ports:
    - "80:80"
  volumes_from:
    - app
  working_dir: /usr/share/php/html
  command: php -S 0.0.0.0:80


```

プロジェクトルートで`docker-compose up`します。

#### terminal

```bath

docker-compose up


```

`http://0.0.0.0/` にアクセスすると、サーバが立ち上がっています。

おわります。
