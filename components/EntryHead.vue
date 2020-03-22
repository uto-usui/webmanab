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
        <nuxt-link :to="`/${article.type}s/${item.term_id}/`" class="entry-head__target" v-html="item.name" />
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
  padding: space-scalar(5);
  margin-bottom: space-scalar(2);
  background-color: $glay;
  //
  @include tablet {
    padding: space-scalar(8) space-scalar(12);
    margin-bottom: space-scalar(10);
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
  top: space-scalar(-5);
  right: 50%;
  display: inline-block;
  font-style: italic;
  color: $black;
  transform: translateX(50%);
  //
  @include sizes(-2);
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
    @include sizes(-2);
  }
}

.entry-head__title {
  color: $white;
  text-align: center;
  //
  @include sizes(0, 0);
  //
  @include tablet {
    @include sizes(3, 1);
  }
}

.entry-head__list {
  display: flex;
  flex-flow: wrap;
  align-items: center;
  justify-content: center;
  //
  margin-top: get-line-height(-2, 0, 1);
  //
  @include tablet {
    margin-top: get-line-height(-1, -1, 1);
  }
}

.entry-head__item {
  //
  &:first-child {
    //
  }
  //
  + .entry-head__item {
    margin-left: space-scalar(2);
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
  @include sizes(-2);
  //
  @include tablet {
    @include sizes(-1);
  }
  //
  &:hover {
    top: -5px;
    left: 5px;
    text-decoration: none;
    box-shadow: -5px 5px 0 $thirdry-color;
  }
}
</style>
