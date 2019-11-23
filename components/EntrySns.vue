<template>
  <section class="entry-sns__wrap">
    <Title2>share <br>ー</Title2>
    <ul class="entry-sns">
      <li class="entry-sns__item">
        <a class="entry-sns__target entry-sns__target--twitter" :href="`http://twitter.com/intent/tweet?url=${$store.state.domain}${postType}/${article.slug}&text=${article.title}&via=uto_ao&related=uto_ao`" onclick="window.open(this.href, 'TWwindow', 'width=600, height=400, menubar=no, toolbar=no, scrollbars=yes'); return false;" target="_blank">
          <svg>
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-twitter" />
          </svg>
          <p class="is-sr-only">
            twitter
          </p>
        </a>
      </li>
      <li class="entry-sns__item">
        <a class="entry-sns__target entry-sns__target--facebook" href="http://www.facebook.com/share.php?u=url" onclick="window.open(this.href, 'FBwindow', 'width=600, height=400, menubar=no, toolbar=no, scrollbars=yes'); return false;" target="_blank">
          <svg>
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-facebook" />
          </svg>
          <p class="is-sr-only">
            facebook
          </p>
        </a>
      </li>
      <li class="entry-sns__item">
        <a class="entry-sns__target entry-sns__target--google" href="https://plus.google.com/share?url=url" onclick="window.open(this.href, 'GPwindow', 'width=600, height=400, menubar=no, toolbar=no, scrollbars=yes'); return false;" target="_blank">
          <svg>
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-google" />
          </svg>
          <p class="is-sr-only">
            google
          </p>
        </a>
      </li>
      <li class="entry-sns__item">
        <a class="entry-sns__target entry-sns__target--hatena" :href="`http://b.hatena.ne.jp/add?mode=confirm&amp;url=${$store.state.domain}${postType}/${article.slug}&title=${article.title}`" onclick="window.open(this.href, 'HBwindow', 'width=600, height=400, menubar=no, toolbar=no, scrollbars=yes'); return false;" target="_blank">
          <svg>
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-hatena" />
          </svg>
          <p class="is-sr-only">
            hatena
          </p>
        </a>
      </li>
      <li class="entry-sns__item">
        <a class="entry-sns__target entry-sns__target--pocket" :href="`http://getpocket.com/edit?url=${$store.state.domain}${postType}/${article.slug}&title=${article.title}`" onclick="window.open(this.href, 'POwindow', 'width=600, height=400, menubar=no, toolbar=no, scrollbars=yes'); return false;" target="_blank">
          <svg>
            <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-pocket" />
          </svg>
          <p class="is-sr-only">
            pocket
          </p>
        </a>
      </li>
    </ul>
  </section>
</template>

<script>
import Title2 from '~/components/Title2'

export default {
  name: 'EntrySns',
  components: { Title2 },
  props: {
    article: {
      type: Object,
      default: () => {}
    },
    postType: {
      type: String,
      default: ''
    }
  }
}
</script>
<style lang="scss" scoped>
.entry-sns__wrap {
  margin-top: $space-3;
  //
  @include tablet {
    margin-top: $space-5;
  }
}

.entry-sns__title {
  padding-left: 0.2rem;
  font-size: $font-size-l2;
  font-style: italic;
  color: $glay;
  letter-spacing: 0.1em;
  //
  @include tablet {
    padding-left: 0.4rem;
    margin-bottom: 1rem;
    font-size: $font-size-l3;
  }
}

.entry-sns {
  display: flex;
  border-top: 6px double currentcolor;
  border-bottom: 6px double currentcolor;
}

.entry-sns__item {
  width: 25%;
}

.entry-sns__target {
  display: block;
  padding-top: 1rem;
  padding-bottom: 1rem;
  perspective: 600px;
  transform-style: preserve-3d;
  transition: 0.25s $easeOutQuart;
  //
  svg {
    width: 22px;
    height: 22px;
    transition: 0.25s $easeOutQuart;
  }

  //
  &:hover {
    background-color: $glay;
    transform: translate3d(5px, -5px, 0);
    //
    &.entry-sns__target--facebook {
      box-shadow: -5px 5px 0 #455a9e;
    }

    &.entry-sns__target--twitter {
      box-shadow: -5px 5px 0 #55acee;
    }

    &.entry-sns__target--google {
      box-shadow: -5px 5px 0 #ea3033;
    }

    &.entry-sns__target--hatena {
      box-shadow: -5px 5px 0 #00a4de;
    }

    &.entry-sns__target--pocket {
      box-shadow: -5px 5px 0 #ee4256;
    }

    //
    > svg {
      fill: $white;
      transform: rotateY(360deg) translate3d(0, 0, 10px);
    }
  }
}
</style>
