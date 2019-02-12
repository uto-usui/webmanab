<template>
  <section class="entry-related">
    <Title2>related<br>ー</Title2>
    <ul class="entry-related__list">
      <li v-for="(item, index) in posts" :key="`related${index}`" class="entry-related__item">
        <nuxt-link class="entry-related__target" :to="`${article.type}/${item.slug}`" v-html="item.title" />
      </li>
    </ul>
  </section>
</template>

<script>
import Title2 from '~/components/Title2'

export default {
  name: 'EntryRelated',
  components: { Title2 },
  props: {
    article: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      posts: []
    }
  },
  async mounted() {
    const query = {
      orderby: 'date',
      per_page: 3,
      'filter[meta_key]': 'primary-tag',
      'filter[meta_value]': this.article.fields['primary-tag']
    }
    const posts = await this.$api.get(`/${this.article.type}`, query)
    this.posts = posts.data
  }
}
</script>

<style lang="scss" scoped>
.entry-related {
  margin-top: 2rem;
  text-align: justify;
  //
  @include tablet {
    padding: 1rem;
    margin-top: 5rem;
    border: 6px double currentColor;
  }
  //
  @include desktop {
    padding: 2rem;
  }
}

.entry-related__title {
  padding-left: 0.2rem;
  font-size: 1.25rem;
  font-style: italic;
  color: $glay;
  letter-spacing: 0.1em;
  //
  @include tablet {
    padding-left: 0.4rem;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
}

.entry-related__list {
  //
}

.entry-related__item {
  line-height: 1.7;
  //
  + .entry-related__item {
    margin-top: 1rem;
  }
}

.entry-related__target {
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
</style>
