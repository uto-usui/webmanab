#!/bin/sh
# Netlify の build.ignore から呼ぶ。本番のビルドに使わないファイルだけの変更なら exit 0 で止める。
# テスト・カタログ・道具の変更は GitHub の CI がビルドまで確かめる
git diff --quiet "$CACHED_COMMIT_REF" "$COMMIT_REF" -- . \
  ':(exclude)docs' \
  ':(exclude)README.md' \
  ':(exclude).claude' \
  ':(exclude).github' \
  ':(exclude)test' \
  ':(exclude)e2e' \
  ':(exclude)src/catalog' \
  ':(exclude)scripts/export-markdown' \
  ':(exclude)scripts/eyecatch' \
  ':(exclude)scripts/check-links.ts' \
  ':(exclude)scripts/a11y-compare.ts' \
  ':(exclude)scripts/security-update.mjs' \
  ':(exclude)playwright.config.ts' \
  ':(exclude)playwright.catalog.config.ts' \
  ':(exclude)vitest.config.ts' \
  ':(exclude)eslint.config.js' \
  ':(exclude)stylelint.config.js' \
  ':(exclude).prettierrc' \
  ':(exclude).prettierignore' \
  ':(exclude).editorconfig' \
  ':(exclude).env.example' \
  ':(exclude).gitignore'
