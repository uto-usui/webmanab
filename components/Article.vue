<template>
  <article class="article-item">
    <div class="article-item__inner">
      <strong class="article-item__tag" v-html="article.fields['primary-tag']" />
      <nuxt-link class="article-item__img-wrap" :to="`/${article.type}/${article.slug}/`">
        <div class="article-item__img">
          <LazyImage :src="featuredImage.source_url" :alt="featuredImage.alt" />
        </div>
      </nuxt-link>
      <h3 class="article-item__title">
        <nuxt-link :to="`/${article.type}/${article.slug}/`" class="article-item__target">
          {{ article.title }}
        </nuxt-link>
      </h3>
      <p class="u-text-right">
        <time class="article-item__time" datetime="">
          2016-01-01
        </time>
      </p>
    </div>
  </article>
</template>

<script>
import LazyImage from '~/components/LazyImage.vue'

export default {
  components: {
    LazyImage
  },
  props: {
    article: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    featuredImage() {
      if (this.article && this.article.images && this.article.images[0]) {
        const featuredImage = this.article.images[0]
        return featuredImage.sizes.large || featuredImage.sizes.full || false
      } else {
        return { height: 0, width: 0 }
      }
    }
  }
}
</script>


<style lang="scss" scoped>
.article-item {
  width: 100%;
  margin-bottom: 30px;
  //
  @include tablet {
    width: 50%;
    border-left: 2px solid currentcolor;
  }
  //
  @include desktop {
    width: 33.3333333%;
  }
  //
  @include widescreen {
    width: 25%;
  }
}

.article-item__inner {
  text-align: justify;
}

.article-item__tag {
  display: inline-block;
  min-width: 100px;
  padding-right: 4px;
  padding-bottom: 4px;
  padding-left: 16px;
  font-style: italic;
  color: $glay;
  border-bottom: 2px solid currentcolor;
  //
  &::first-letter {
    padding-right: 6px;
    font-size: 5rem;
    font-weight: bold;
    color: $white;
    text-shadow: -1px -1px 0 $text-color, 1px -1px 0 $text-color,
      -1px 1px 0 $text-color, 2px 3px 0 $text-color;
    text-transform: capitalize;
  }
}

.article-item__title {
  margin: 20px 16px;
  text-align: justify;
  //
  @include tablet {
    font-size: 1.8rem;
  }
}

@include tablet {
  //
}

@include desktop {
  //
}

@include widescreen {
  //
}

.article-item__img-wrap {
  display: block;
  width: calc(100% - 32px);
  margin-top: 20px;
  margin-right: auto;
  margin-left: auto;
  vertical-align: bottom;
  transition: 0.25s $easeOutQuart;
  //
  &:hover {
    text-decoration: none;
    box-shadow: -10px 10px 0 $secondary-color;
    transform: translate(10px, -10px);
  }
  //
  @include tablet {
    //
  }

  @include desktop {
    //
  }

  @include widescreen {
    //
  }
}

.article-item__img {
  position: relative;
  padding-top: calc(9 / 16 * 100%);
  overflow: hidden;
  //
  > img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    will-change: transform;
    opacity: 0;
    transform: translate(-50%, -10%) scaleY(1.12);
    //
    &[lazy='loading'] {
      opacity: 0;
      transform: translate(-50%, -10%) scaleY(1.12);
    }
    //
    &[lazy='loaded'] {
      opacity: 1;
      transition: transform 1.1s $easeSmoothOut;
      transform: translate(-50%, -50%) scaleY(1);
    }
  }
  //
  &:hover {
    //
  }
}

.article-item__target {
  position: relative;
  top: 0;
  left: 0;
  padding: 0.2em 0.5em 0.15em;
  line-height: 2.5;
  color: $white;
  background-color: $glay;
  transition: 0.25s $easeOutQuart;
  //
  &:hover {
    top: -5px;
    left: 5px;
    text-decoration: none;
    box-shadow: -5px 5px 0 $primary-color;
  }
}

.article-item__time {
  display: inline-block;
  padding-right: calc(100px - 5em);
  padding-bottom: 4px;
  padding-left: 4px;
  font-size: 1.4rem;
  font-style: italic;
  border-bottom: 2px solid currentcolor;
}
</style>
