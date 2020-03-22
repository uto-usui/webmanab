<template>
  <div class="entry-content">
    <EntryToc v-if="toc && tocList" :list="tocList" />
    <div class="entry-content__inner" v-html="article.content" />
  </div>
</template>

<script>
import hljs from 'highlight.js/lib/highlight'

// need languages
import javascript from 'highlight.js/lib/languages/javascript'
import scss from 'highlight.js/lib/languages/scss'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import bash from 'highlight.js/lib/languages/bash'
import php from 'highlight.js/lib/languages/php'
import yaml from 'highlight.js/lib/languages/yaml'

import EntryToc from '~/components/EntryToc'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('scss', scss)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('php', php)
hljs.registerLanguage('yaml', yaml)

export default {
  name: 'EntryContent',
  components: {
    EntryToc
  },
  props: {
    article: {
      type: Object,
      default: () => {}
    },
    toc: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      tocList: []
    }
  },
  computed: {
    // currentPage() {
    //   return this.$store.getters['clip/currentPage']
    // }
  },
  watch: {
    tocList(val) {
      console.log(val)
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initHljs()
      this.createToc()
    })
  },
  methods: {
    initHljs() {
      this.$el.querySelectorAll('pre').forEach(block => {
        hljs.highlightBlock(block)
      })
    },
    createToc() {
      const titles = this.$el.querySelectorAll(
        '.entry-content__inner h2, .entry-content__inner h3'
      )

      let h2Counter = 0
      let h3Counter = 0

      titles.forEach(el => {
        const tagName = el.tagName

        if (tagName === 'H2') {
          h2Counter += 1
          h3Counter = 0
          this.tocList[h2Counter - 1] = {
            h2: el.textContent,
            h3: []
          }
          // eslint-disable-next-line
          el.id = `a${h2Counter - 1}`
        } else if (tagName === 'H3') {
          this.tocList[h2Counter - 1].h3[h3Counter] = el.textContent
          // eslint-disable-next-line
          el.id = `a${h2Counter - 1}${h3Counter}`
          h3Counter++
        }
      })
    }
  }
}
</script>

<style lang="scss">
.entry-content {
  margin-bottom: $space-4;
  //
  @include tablet {
    margin-bottom: $space-6;
  }
}

.hljs {
  display: block;
  padding: 0.5em;
  overflow-x: auto;
  color: white;
  background: #333;
}

.hljs-name,
.hljs-strong {
  font-weight: bold;
}

.hljs-code,
.hljs-emphasis {
  font-style: italic;
}

.hljs-tag {
  color: #62c8f3;
}

.hljs-variable,
.hljs-template-variable,
.hljs-selector-id,
.hljs-selector-class {
  color: #ade5fc;
}

.hljs-string,
.hljs-bullet {
  color: #a2fca2;
}

.hljs-type,
.hljs-title,
.hljs-section,
.hljs-attribute,
.hljs-quote,
.hljs-built_in,
.hljs-builtin-name {
  color: #ffa;
}

.hljs-number,
.hljs-symbol,
.hljs-bullet {
  color: #d36363;
}

.hljs-keyword,
.hljs-selector-tag,
.hljs-literal {
  color: #fcc28c;
}

.hljs-comment,
.hljs-deletion,
.hljs-code {
  color: #888;
}

.hljs-regexp,
.hljs-link {
  color: #c6b4f0;
}

.hljs-meta {
  color: #fc9b9b;
}

.hljs-deletion {
  color: #333;
  background-color: #fc9b9b;
}

.hljs-addition {
  color: #333;
  background-color: #a2fca2;
}

.entry-content__inner {
  padding-right: $space-3;
  padding-left: $space-3;
  margin-right: auto;
  margin-left: auto;
  //
  @include tablet {
    padding-right: 0;
    padding-left: 0;
  }
  //
  img {
    margin: $space-3 calc(100% / 12 * 1 * -1) $space-2 0;
  }

  //
  strong {
    font-weight: bold;
    background-image: linear-gradient(
      0deg,
      rgba(255, 255, 0, 0.3) 45%,
      rgba(255, 255, 0, 0) 60%
    );
  }

  //
  pre {
    padding: 1px 2rem;
    margin-top: $space-2;
    margin-right: -2rem;
    margin-bottom: $space-2;
    margin-left: -2rem;
    text-align: left;
    letter-spacing: normal;
    //
    @include sizes(-1, 0);
    //
    @include tablet {
      padding: 0 2em;
      margin-right: 0;
      margin-bottom: $space-3;
      margin-left: calc(100% / 12 * 4);
      //
      @include sizes(0, 0);
    }
  }

  //
  code {
    font-family: $font-mono;
  }

  //
  a {
    transition: 0.35s $easeOutQuint;
    //
    &:hover {
      color: $white;
      text-decoration: none;
      background-color: $glay;
    }
  }

  //
  dl {
    padding: 8px;
    margin: get-line-height(-1, 0, 1) auto;
    text-align: left;
    border: 6px double currentColor;
    //
    @include sizes(-1, 0);
    //
    @include tablet {
      padding: $space-2 $space-3;
      margin-top: get-line-height(0, 1, 1);
      margin-bottom: get-line-height(0, 1, 1);
      margin-left: calc(100% / 12 * 4);
    }
    //
    code {
      padding: 2px 8px;
      margin-right: 0.2em;
      margin-left: 0.2em;
      background-color: rgba(white, 0.35);
      border-radius: 3px;
      box-shadow: 0 0 4px rgba($black, 0.1);
    }
  }

  //
  dt {
    margin-bottom: 0.2rem;
    font-weight: bold;
  }

  //
  dd {
    + dt {
      margin-top: $space-2;
    }
  }

  //
  ul,
  ol {
    padding: $space-unit $space-2 $space-unit space-scalar(4);
    margin: get-line-height(-1, 0, 1) auto;
    text-align: left;
    border: 6px double currentColor;
    //
    @include sizes(-1, 0);
    //
    @include tablet {
      padding: $space-2 $space-2 $space-2 space-scalar(6);
      margin-top: get-line-height(0, 1, 1);
      margin-bottom: get-line-height(0, 1, 1);
      margin-left: calc(100% / 12 * 4);
    }
    //
    code {
      padding: 2px 8px;
      margin-right: 0.2em;
      margin-left: 0.2em;
      background-color: rgba(white, 0.35);
      border-radius: 3px;
      box-shadow: 0 0 4px rgba($black, 0.1);
    }
  }

  //
  li {
    margin-left: $space-2;
    //
    + li {
      margin-top: $space-1;
    }
  }

  //
  ul {
    //
    > li {
      list-style-type: square;
    }
  }

  //
  ol {
    padding-left: $space-3;
    //
    @include tablet {
      padding-left: space-scalar(10);
    }
    //
    > li {
      list-style-type: decimal-leading-zero;
    }
  }

  //
  figure {
    min-height: 200px;
    padding: 1em;
    margin-bottom: 1.5rem;
    background-color: rgba(white, 0.75);
  }

  //
  p {
    margin: get-line-height(-1, 0, 1) auto;
    text-align: left;
    //
    @include sizes(-1, 0);
    //
    @include tablet {
      margin-top: get-line-height(0, 1, 1);
      margin-bottom: get-line-height(0, 1, 1);
      margin-left: calc(100% / 12 * 4);
      text-align: justify;
      //
      @include sizes(0, 1);
    }
    //
    > img {
      display: block;
      margin-top: 0;
      margin-bottom: 0;
    }

    //
    code {
      padding: 2px 8px;
      margin-right: 0.2em;
      margin-left: 0.2em;
      background-color: rgba(white, 0.35);
      border-radius: 3px;
      box-shadow: 0 0 4px rgba($black, 0.1);
    }
  }

  //
  h2 {
    padding-top: 0.2em;
    padding-bottom: 0.2em;
    padding-left: 0.2em;
    margin-top: get-line-height(-1, 0, 3);
    margin-bottom: get-line-height(-1, 0, 1);
    font-weight: 600;
    color: $glay;
    text-align: left;
    border-top: 6px double rgba($glay, 0.95);
    border-bottom: 6px double rgba($glay, 0.95);
    //
    @include sizes(3, 1);
    //
    @include tablet {
      padding-top: 0.25em;
      padding-bottom: 0.25em;
      padding-left: 0.25em;
      margin-top: get-line-height(0, 1, 3);
      margin-bottom: get-line-height(0, 1, 2);
      //
      @include sizes(4, 1);
    }
  }

  //
  h3 {
    padding-right: 0.2em;
    padding-bottom: 0.1em;
    padding-left: 0.2em;
    margin-top: get-line-height(-1, 0, 2);
    margin-bottom: get-line-height(-1, 0, 1);
    font-weight: 600;
    color: rgba($glay, 0.95);
    text-align: left;
    border-bottom: 6px double $glay;
    //
    @include sizes(1, 1);
    //
    @include tablet {
      padding-right: 0.4em;
      padding-left: 0.4em;
      margin-top: get-line-height(0, 1, 2);
      margin-bottom: get-line-height(0, 1, 1);
      margin-left: calc(100% / 12 * 4);
      //
      @include sizes(1, 1);
    }
  }

  h4 {
    margin-top: $space-3;
    font-style: italic;
    color: $glay;
    text-align: left;
    letter-spacing: 0.1em;
    //
    @include sizes(-1, 0);
    //
    @include tablet {
      margin-left: calc(100% / 12 * 4);
      //
      @include sizes(0, 0);
    }
    //
    + pre {
      margin-top: $space-unit;
      //
      @include tablet {
        margin-top: $space-1;
      }
    }

    + ol {
      margin-top: $space-unit;
      //
      @include tablet {
        margin-top: $space-1;
      }
    }

    + ul {
      margin-top: $space-unit;
      //
      @include tablet {
        margin-top: $space-1;
      }
    }

    + dl {
      margin-top: $space-unit;
      //
      @include tablet {
        margin-top: $space-1;
      }
    }
  }

  //
  h5 {
    margin-top: 2em;
    font-size: 1.6rem;
    font-weight: 600;
    line-height: 1.5;
    color: $glay;
    text-align: left;
    letter-spacing: 0.1em;
    //
    @include tablet {
      font-size: 1.8rem;
    }
  }
}
</style>
