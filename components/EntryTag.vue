<template>
  <section class="entry-tag">
    <Title2>tag <br>ー</Title2>
    <ul v-if="article.type" class="entry-tag__list">
      <li v-for="(item, index) in article.terms[`${article.type}s`]" :key="index" class="entry-tag__item">
        <nuxt-link :to="`/${article.type}s/${item.term_id}/`" class="entry-tag__target" v-html="item.name" />
      </li>
    </ul>
  </section>
</template>
<script>
import Title2 from '~/components/Title2'

export default {
  name: 'EntryTag',
  components: { Title2 },
  props: {
    article: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
<style lang="scss" scoped>
.entry-tag {
  margin-top: $space-3;
  //
  @include tablet {
    margin-top: $space-5;
  }
}

.entry-tag__list {
  display: flex;
  flex-flow: wrap;
}

.entry-tag__item {
  margin-right: $space-2;
}

.entry-tag__target {
  position: relative;
  top: 0;
  left: 0;
  padding: 0.2em 0.5em 0.15em;
  color: $white;
  text-transform: uppercase;
  background-color: $glay;
  transition: 0.25s $easeOutQuart;
  //
  @include sizes(-1, 2);
  //
  &:hover {
    top: -5px;
    left: 5px;
    text-decoration: none;
    box-shadow: -5px 5px 0 $thirdry-color;
  }
}
</style>
