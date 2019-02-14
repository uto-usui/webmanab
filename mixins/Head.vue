<script>
/**
 * default meta
 * @type {{img: string, description: string, title: string, ogType: string}}
 */
const meta = {
  title:
    'webmanab.html／ウェブまなぶ – ウェブ制作のあれこれについて学習したことをメモしたりクリップしたり気ままに綴っていきます。',
  description:
    'ウェブ制作のあれこれについて学習したことをメモしたりクリップしたり気ままに綴っていきます。',
  img: 'https://webmanab-html.com/ogp.png',
  ogType: 'website'
}

export default {
  /**
   * Meta information of each page
   * Insert from data {title, description, ogType}
   */
  head() {
    return {
      title: this.title || meta.title,
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: this.desc || meta.description
        },
        {
          name: 'og:title',
          content: this.title || meta.title
        },
        {
          name: 'og:description',
          content: this.desc || meta.description
        },
        { name: 'og:locale', content: 'ja_JP' },
        { name: 'og:type', content: this.ogType || meta.ogType },
        { name: 'og:url', content: 'https://webmanab-html.com/' },
        {
          name: 'og:image',
          content: meta.img
        },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: this.title || meta.title
        },
        {
          name: 'twitter:description',
          content: this.desc || meta.description
        },
        {
          name: 'twitter:image',
          content: meta.img
        },
        { name: 'twitter:site', content: '@uto_ao' }
      ]
    }
  }
}
</script>
