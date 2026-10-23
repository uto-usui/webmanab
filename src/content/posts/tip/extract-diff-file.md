---
id: 1961
type: tip
slug: "extract-diff-file"
title: "Gitでファイルの差分抽出してzipにするいろいろなコマンド-『Git』"
date: 2018-01-20T18:27:12+09:00
modified: 2018-01-20T18:29:13+09:00
excerpt: "ファイルを納品するとき、「差分ファイルのみをください」と言われて断れない人のためのGitで差分抽出するtipsです。 git archive と git diff を使った差分抽出 コマンドはgit archiveとgi"
primaryTag: "git"
terms:
  - { id: 238, name: "frontend", slug: "frontend" }
  - { id: 223, name: "git", slug: "git" }
legacy:
  prev: aspectrat-io
  next: gulp-from-utf-8-to-shift_jis
---

ファイルを納品するとき、「差分ファイルのみをください」と言われて断れない人のためのGitで差分抽出するtipsです。

## git archive と git diff を使った差分抽出

コマンドは`git archive`と`git diff`が組み合わせることで実現します。

```bath

git archive [to_commitID] `git diff --name-only [from_commitID] [to_commitID] --diff-filter=ACMR` -o diff.zip


```

### ファイルをアーカイブする git archive

`git archive` は、指定したブランチをまるっとアーカイブするコマンドです。オプション`-o archive.zip` で、ファイル名を指定します。

```bath

git archive [commit_ID] -o diff.zip


```

commit ID は `git log --oneline` とかで調べたものを入力します。

### 差分を確認する git diff

git diffは差分を確認するコマンドです。`[from_ID]` のコミットから `[to_ID]` のコミットまでというように期間を指定します。オプション `–name-only` は更新されたファイル名だけを返すようにします。

```bath

git diff --name-only [from_commitID] [to_commitID]


```

### git diff をフィルターする –diff-filter=ACMR

ここまでの流れは、`git diff` で比較して差分のあるファイル名を返して、`git archive` でzipファイルを生成します。このままだと`git diff` の返す内容には削除したファイルも含まれていることが原因で、`git archive` するときファイルが削除されていて見つからないけどなあっていうエラーが出てしまいます。

そこで、`git diff` のオプション `–diff-filter=ACMR` で、`A` 追加、`C` コピー、`M` 変更、`R` リネームのステータスを持つファイルを返す、という処理を追加します。

```bath

git archive [to_commitID] `git diff --name-only [from_commitID] [to_commitID] --diff-filter=ACMR` -o diff.zip


```

というわけで、最初のコードが完成しました。

## 色々な差分を抽出する

コミット間の差分を取るコードを紹介しました。様々な差分を抽出してみます。

### ブランチ間の差分を抽出

develop というブランチと、リモートの master ブランチの差分を抽出します。

```bash

git archive develop `git diff --name-only origin/master develop --diff-filter=ACMR` -o archive.zip


```

### ブランチの最新コミットから数値で指定

作業しているブランチの最新コミット(HEAD)からいくつ前のコミットの差分を取るか指定します。`HEAD~[number]` で、任意の数前のコミットの差分を抽出します。

```bath

git archive HEAD `git diff --name-only HEAD~3 HEAD --diff-filter=ACMR` -o diff.zip


```

というわけで、いい感じに差分抽出できるようになりました。また、スクリプトを登録して、SourceTree からGUIで簡単に実行できるようにしても素敵かもですね。

- [SourceTreeの使い方 | コミット間の差分ファイルの抽出 (カスタム操作を使う方法) – ICS MEDIA](https://ics.media/entry/4475)

おわります。
