<template>
  <ul class="entry-nav">
    <li class="entry-nav__item u-text-left" v-if="article.prev">
      <nuxt-link :to="`${article.type}/${article.prev.slug}`" class="entry-nav__target">
        <div class="entry-nav__inner">
          <p class="entry-nav__text">
            previous
            <br>ー
          </p>
          <h3 class="entry-nav__title" v-html="article.prev.title" />
        </div>
      </nuxt-link>
      <div class="entry-nav__bg" :style="{ backgroundImage: `url(${article.prev.img})` }" />
    </li>
    <li class="entry-nav__item u-text-right" v-if="article.next">
      <nuxt-link :to="`${article.type}/${article.next.slug}`" class="entry-nav__target">
        <div class="entry-nav__inner">
          <p class="entry-nav__text">
            next
            <br>ー
          </p>
          <h3 class="entry-nav__title" v-html="article.next.title" />
        </div>
      </nuxt-link>
      <div class="entry-nav__bg" :style="{ backgroundImage: `url(${article.next.img})` }" />
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
  }
}
</script>
<style lang="scss" scoped>
.entry-nav {
  margin-top: 2rem;
  //
  @include tablet {
    display: flex;
    margin-top: 5rem;
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
  .entry-nav__item:last-child & {
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
  .entry-nav__item:first-of-type & {
    transform-origin: right center;
  }

  .entry-nav__item:last-of-type & {
    transform-origin: left center;
  }

  .entry-nav__item:first-of-type:hover & {
    transform: rotateY(-45deg);
  }

  .entry-nav__item:last-of-type:hover & {
    transform: rotateY(45deg);
  }
}
</style>
