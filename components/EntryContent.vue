<template>
  <div class="entry-content">
    <EntryToc :list="tocList" />
    <div class="entry-content__inner" v-html="article.content" />
  </div>
</template>

<script>
import hljs from 'highlight.js/lib/highlight'
;[
  'javascript',
  'bash',
  'css',
  'php',
  'typescript',
  'scss',
  'yaml',
  'xml'
].forEach(langName => {
  const langModule = require(`highlight.js/lib/languages/${langName}`)
  hljs.registerLanguage(langName, langModule)
})

export default {
  name: 'EntryContent',
  components: {
    EntryToc: () => import('~/components/EntryToc')
  },
  props: {
    article: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      tocList: []
    }
  },
  computed: {
    getList() {
      return this.tocList
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
        '.entry-content h2, .entry-content h3'
      )
      titles.forEach((value, i) => {
        this.tocList[i] = value.textContent
        // eslint-disable-next-line
        value.id = i
      })
    }
  }
}
</script>

<style lang="scss">
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
  max-width: calc(1em * 42);
  padding-right: 1em;
  padding-left: 1em;
  margin-right: auto;
  margin-left: auto;
  font-size: 1.5rem;
  //
  @include tablet {
    font-size: 1.6rem;
  }
  //
  img {
    margin: 1.5rem auto 1rem;
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
    padding: 1px 16px 1px 22px;
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    line-height: 1.6;
    text-align: left;
    letter-spacing: normal;
    //
    @include tablet {
      margin-bottom: 2rem;
      font-size: 1.6rem;
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
    margin: 1rem auto 1.5rem;
    line-height: 1.55;
    text-align: left;
    border: 6px double currentcolor;
    //
    @include tablet {
      padding: 1.5rem 2rem;
      margin-bottom: 3rem;
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
      margin-top: 1.5rem;
    }
  }

  //
  ul,
  ol {
    padding: 0.6rem 1.5rem 0.6rem 2rem;
    margin: 1.5rem auto 1rem;
    line-height: 1.55;
    text-align: left;
    border: 6px double currentcolor;
    //
    @include tablet {
      padding: 1.5rem 1.5rem 1.5rem 3rem;
      margin-bottom: 3rem;
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
    margin-left: 1rem;
    //
    + li {
      margin-top: 1rem;
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
    padding-left: 2rem;
    //
    @include tablet {
      padding-left: 3rem;
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
    margin: 1.5rem auto;
    line-height: 1.9;
    text-align: justify;
    //
    @include tablet {
      margin: 2rem auto;
      line-height: 2;
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
    padding-top: 0.2rem;
    padding-bottom: 0.2rem;
    padding-left: 0.2rem;
    margin-top: 4rem;
    font-size: 2.25rem;
    font-weight: bold;
    line-height: 1.3;
    color: $glay;
    text-align: left;
    letter-spacing: 0.05em;
    border-top: 6px double rgba($glay, 0.95);
    border-bottom: 6px double rgba($glay, 0.95);
    //
    @include tablet {
      padding-top: 0.4rem;
      padding-bottom: 0.4rem;
      padding-left: 0.4rem;
      margin-top: 6rem;
      font-size: 3rem;
    }
  }

  //
  h3 {
    padding-right: 0.2rem;
    padding-bottom: 0.1rem;
    padding-left: 0.2rem;
    margin-top: 3rem;
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.35;
    color: rgba($glay, 0.95);
    text-align: left;
    border-bottom: 6px double $glay;
    //
    @include tablet {
      padding-right: 0.4rem;
      padding-left: 0.4rem;
      margin-top: 5rem;
      font-size: 2.5rem;
    }
  }

  h4 {
    padding-left: 0.2rem;
    margin-top: 2rem;
    font-size: 1.5rem;
    font-style: italic;
    line-height: 1.4;
    color: $glay;
    text-align: left;
    letter-spacing: 0.1em;
    //
    @include tablet {
      padding-left: 0.4rem;
      font-size: 2rem;
    }
    //
    + pre {
      margin-top: 1rem;
    }

    + ol {
      margin-top: 1rem;
    }

    + ul {
      margin-top: 1rem;
    }

    + dl {
      margin-top: 1rem;
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
