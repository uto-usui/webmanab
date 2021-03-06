<template>
  <article class="article-item">
    <div class="article-item__inner">
      <strong class="article-item__tag" v-html="article.fields['primary-tag']" />
      <nuxt-link class="article-item__img-wrap" :to="`/${article.type}/${article.slug}/`">
        <div v-if="article && article.images && article.images[0]" class="article-item__img">
          <img
            v-lazy="featuredImage('large')"
            :data-srcset="`${featuredImage('thumb700')} 200w, ${featuredImage('thumb480')} 768w, ${featuredImage('thumb370')} 1480w, ${featuredImage('thumb480')} 1700w`"
          >
        </div>
      </nuxt-link>
      <h3 class="article-item__title">
        <a v-if="article.type === 'clip'" :href="article.fields['clip-url']" target="_blank" class="article-item__target">
          {{ article.title }}
        </a>
        <nuxt-link v-else :to="`/${article.type}/${article.slug}/`" class="article-item__target">
          {{ article.title }}
        </nuxt-link>
      </h3>
      <p class="u-text-right">
        <time class="article-item__time" :datetime="getDate(article.date)" v-html="getDate(article.date)" />
      </p>
    </div>
  </article>
</template>

<script>
import DateMixin from '~/mixins/Date'

export default {
  name: 'Article',
  components: {
    //
  },
  mixins: [DateMixin],
  props: {
    article: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    featuredImage() {
      return size => {
        if (
          this.article &&
          this.article.images &&
          this.article.images[0] &&
          this.article.images[0].sizes &&
          this.article.images[0].sizes[size]
        ) {
          return this.article.images[0].sizes[size].source_url
        } else {
          return { height: 0, width: 0 }
        }
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
    border-left: 2px solid currentColor;
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
  padding-left: $space-2;
  font-style: italic;
  color: $glay;
  border-bottom: 2px solid currentColor;
  //
  @include sizes(-3);
  //
  &::first-letter {
    padding-right: 6px;
    font-weight: bold;
    color: $white;
    text-shadow: -1px -1px 0 $text-color, 1px -1px 0 $text-color,
      -1px 1px 0 $text-color, 2px 3px 0 $text-color;
    text-transform: capitalize;
    //
    @include sizes(5);
  }
}

.article-item__title {
  margin: -6px $space-2 $space-2;
  text-align: justify;
  //
  @include sizes(0, 1);
  //
  @include tablet {
    //
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
  width: calc(100% - #{$space-2} * 2);
  margin-top: $space-2;
  margin-right: auto;
  margin-bottom: $space-2;
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
  //
  @include widescreen {
    //
  }
}

.article-item__img {
  position: relative;
  padding-top: calc(9 / 16 * 100%);
  overflow: hidden;
  background-color: $glay;
  //
  > img {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    will-change: opacity;
    opacity: 0;
    transform: translate(-50%, -50%);
    //
    &[lazy='loading'] {
      opacity: 0;
    }
    //
    &[lazy='loaded'] {
      opacity: 1;
      transition: opacity 0.25s;
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
  padding: 0.2em 0.1em 0.2em;
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
  padding-right: $space-2;
  padding-bottom: 4px;
  padding-left: 4px;
  font-style: italic;
  border-bottom: 2px solid currentColor;
  //
  @include sizes(-2);
}
</style>
