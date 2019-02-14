<template>
  <header class="entry-head">
    <time class="entry-head__time" :datetime="getDate(article.date)" v-html="getDate(article.date)" />
    <h1 class="entry-head__title" v-html="article.title" />
    <ul v-if="article.type" class="entry-head__list">
      <li class="entry-head__item">
        <span class="entry-head__target">
          uto usui
        </span>
      </li>
      <li class="entry-head__item">
        ／／
      </li>
      <li v-for="(item, index) in article.terms[`${article.type}s`]" :key="index" class="entry-head__item">
        <nuxt-link :to="`/${article.type}/${item.term_id}/`" class="entry-head__target" v-html="item.name" />
      </li>
    </ul>
  </header>
</template>

<script>
import DateMixin from '~/mixins/Date'

export default {
  name: 'EntryHead',
  mixins: [DateMixin],
  props: {
    article: {
      type: Object,
      default: () => {}
    }
  }
}
</script>

<style lang="scss" scoped>
.entry-head {
  position: relative;
  z-index: 1;
  padding: 1rem;
  margin-bottom: 3rem;
  background-color: $glay;
  //
  @include tablet {
    padding: 45px 35px 35px;
    margin-bottom: 4rem;
  }
  //
  &::after {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99999;
    width: 40px;
    height: 40px;
    content: '';
    //
    @include tablet {
      left: 0;
      border-top: 10px solid $white;
      border-left: 10px solid $white;
      box-shadow: -5px -5px 0 $glay;
    }
  }

  //
  &::before {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 99999;
    width: 40px;
    height: 40px;
    content: '';
    //
    @include tablet {
      right: 0;
      border-right: 10px solid $white;
      border-bottom: 10px solid $white;
      box-shadow: 5px 5px 0 $primary-color;
    }
  }
}

.entry-head__time {
  position: absolute;
  top: -2.5em;
  right: 50%;
  display: inline-block;
  font-size: 1.2rem;
  font-style: italic;
  color: $black;
  transform: translateX(50%);
  //
  &::after {
    position: absolute;
    top: -6px;
    left: 0;
    width: 100%;
    height: 2px;
    content: '';
    background-color: $black;
  }

  //
  @include tablet {
    font-size: 1.4rem;
  }
}

.entry-head__title {
  font-size: 1.6rem;
  line-height: 1.65;
  color: $white;
  text-align: center;
  //
  @include tablet {
    font-size: 2.2rem;
    font-weight: lighter;
    line-height: 1.52;
  }
}

.entry-head__list {
  display: flex;
  flex-flow: wrap;
  align-items: center;
  justify-content: center;
  margin-top: 6px;
  //
  @include tablet {
    margin-top: 16px;
  }
}

.entry-head__item {
  //
  &:first-child {
    //
  }

  //
  + .entry-head__item {
    margin-left: 6px;
  }
}

.entry-head__target {
  position: relative;
  top: 0;
  left: 0;
  display: inline-block;
  padding: 6px 8px 4px;
  color: $white;
  text-transform: uppercase;
  transition: 0.25s $easeOutQuart;
  //
  &:hover {
    top: -5px;
    left: 5px;
    text-decoration: none;
    box-shadow: -5px 5px 0 $thirdry-color;
  }
}
</style>
