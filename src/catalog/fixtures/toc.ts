// 目次の見出し。render() の headings と同じ形で、src/content/posts/ の本文から写した
import type { MarkdownHeading } from 'astro'

export const headings = {
  // tip/ffmpeg-mp4-to-mp3: h3 のない h2 を含む
  typical: [
    { depth: 2, slug: 'a0', text: 'インストール' },
    { depth: 2, slug: 'a1', text: '変換' },
    { depth: 3, slug: 'a10', text: '参考' },
    { depth: 2, slug: 'a2', text: 'その他のコマンド' },
    { depth: 3, slug: 'a20', text: '基本の動画変換' },
    { depth: 3, slug: 'a21', text: '幅(1920)を基準にしたリサイズ' },
    { depth: 3, slug: 'a22', text: '動画の圧縮' },
  ],
  // tip/nuxt-static-site-tips: 項目がいちばん多い（27 件）。開くと max-height の 1400px を超える
  many: [
    { depth: 2, slug: 'a0', text: 'Nuxt のいいところ' },
    { depth: 3, slug: 'a00', text: 'Nuxt で静的なサイトを作る' },
    { depth: 2, slug: 'a1', text: 'Nuxt のかんたんな環境構築' },
    { depth: 3, slug: 'a10', text: 'Nuxt のコマンド' },
    { depth: 2, slug: 'a2', text: 'Nuxt のディレクトリ構造' },
    { depth: 3, slug: 'a20', text: 'layouts/ -> template' },
    { depth: 3, slug: 'a21', text: 'pages/*.vue -> pages' },
    { depth: 3, slug: 'a22', text: 'components/ -> molecules / organisms' },
    { depth: 3, slug: 'a23', text: 'Sass functions -> atoms' },
    { depth: 2, slug: 'a3', text: 'nuxt.config.js' },
    { depth: 3, slug: 'a30', text: 'head への設定' },
    { depth: 3, slug: 'a31', text: 'CSS を外部化する' },
    { depth: 3, slug: 'a32', text: 'ルートディレクトリの設定' },
    { depth: 3, slug: 'a33', text: 'autoprefixer の設定をカスタマイズ' },
    { depth: 3, slug: 'a34', text: 'エイリアスを設定する' },
    { depth: 3, slug: 'a35', text: '動的なディレクトリ（ルート）を作る' },
    { depth: 2, slug: 'a4', text: '開発のためのお役立ちな tips' },
    { depth: 3, slug: 'a40', text: 'https 環境でサーバを起動する' },
    { depth: 3, slug: 'a41', text: 'WebStorm のパスを解決' },
    { depth: 3, slug: 'a42', text: 'scrollToTop が効かない' },
    { depth: 3, slug: 'a43', text: 'ビュー全体のレンダリングを待つ' },
    { depth: 3, slug: 'a44', text: 'IE11 へのポリフィル' },
    { depth: 3, slug: 'a45', text: 'gtag.js のトラッキング' },
    { depth: 3, slug: 'a46', text: 'port と host を変更する' },
    {
      depth: 3,
      slug: 'a47',
      text: 'Nuxt のビルドとデプロイを CI でやってみる',
    },
    { depth: 2, slug: 'a5', text: 'Nuxt を深めるための資料' },
    { depth: 2, slug: 'a6', text: 'Nuxt 関連書籍' },
  ],
  // 見出しのない記事。枠だけ出る（03 の 2.5）
  empty: [],
} satisfies Record<string, MarkdownHeading[]>
