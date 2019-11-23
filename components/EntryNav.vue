<template>
  <ul class="entry-nav">
    <li
      v-if="article.prev && article.prev.length !== 0 && article.prev.slug"
      class="entry-nav__item entry-nav__item--prev u-text-left"
    >
      <nuxt-link :to="`/${article.type}/${article.prev.slug}/`" class="entry-nav__target">
        <div class="entry-nav__inner">
          <p class="entry-nav__text">
            previous
            <br>ー
          </p>
          <h3 class="entry-nav__title" v-html="article.prev.title" />
        </div>
      </nuxt-link>
      <div v-if="article.prev.img" class="entry-nav__bg" :style="{ backgroundImage: `url(${article.prev.img})` }" />
    </li>
    <li
      v-if="article.prev && article.next.length !== 0 && article.next.slug"
      class="entry-nav__item entry-nav__item--next u-text-right"
    >
      <nuxt-link :to="`/${article.type}/${article.next.slug}/`" class="entry-nav__target">
        <div class="entry-nav__inner">
          <p class="entry-nav__text">
            next
            <br>ー
          </p>
          <h3 class="entry-nav__title" v-html="article.next.title" />
        </div>
      </nuxt-link>
      <div v-if="article.next.img" class="entry-nav__bg" :style="{ backgroundImage: `url(${article.next.img})` }" />
    </li>
  </ul>
</template>
<script>
export default {
  name: 'EntryNav',
  props: {
    article: {
      type: Object,
      default: () => {}
    }
  },
  mounted() {
    console.log('mounted entryNav - article', this.article)
  }
}
</script>
<style lang="scss" scoped>
.entry-nav {
  margin-top: $space-3;
  //
  @include tablet {
    display: flex;
    margin-top: $space-5;
  }
}

.entry-nav__item {
  position: relative;
  z-index: 5;
  overflow: hidden;
  perspective: 800px;
  transform-style: preserve-3d;
  //
  @include mobile {
    //
    + .entry-nav__item {
      margin-top: 1rem;
    }
  }
  //
  @include tablet {
    width: 50%;
  }
}

.entry-nav__target {
  display: flex;
  align-items: center;
  height: 120px;
  //
  @include tablet {
    height: 180px;
  }
  //
  &:hover {
    text-decoration: none;
  }

  //
  .entry-nav__item.entry-nav__item--next & {
    justify-content: flex-end;
  }
}

.entry-nav__inner {
  //
}

.entry-nav__text {
  font-size: 1.8rem;
  font-style: italic;
  color: $white;
  text-transform: capitalize;
  transition: 0.3s $easeOutQuint;
  //
  @include tablet {
    font-size: 2.2rem;
  }
  //
  .entry-nav__item:hover & {
    color: $glay;
    letter-spacing: 0.2em;
  }
}

.entry-nav__title {
  display: inline;
  font-size: $font-size-l2;
  line-height: 1.7;
  color: $black;
  background-color: $white;
  //
  @include tablet {
    line-height: 2;
  }
}

.entry-nav__bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: -1;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  transition: 0.35s $easeOutQuint;
  //
  &::after {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: -2;
    content: '';
    background-color: rgba($glay, 0.7);
  }

  //
  .entry-nav__item.entry-nav__item--prev & {
    transform-origin: right center;
  }

  .entry-nav__item.entry-nav__item--next & {
    transform-origin: left center;
  }

  .entry-nav__item.entry-nav__item--prev:hover & {
    transform: rotateY(-45deg);
  }

  .entry-nav__item.entry-nav__item--next:hover & {
    transform: rotateY(45deg);
  }
}
</style>
