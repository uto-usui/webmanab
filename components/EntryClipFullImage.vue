<template>
  <LazyImage :src="article.clipImage" class="entry__img-full" :alt="`${article.title} overview image`" />
</template>
<script>
import LazyImage from '~/components/LazyImage'

export default {
  name: 'EntryClipFullImage',
  components: { LazyImage },
  props: {
    article: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
<style lang="scss" scoped>
.entry__img-full {
  margin-top: 120px;
}
</style>
