<template>
  <ul class="entry-content__toc">
    <li v-for="(item, index) in list" :key="`toc${index}`" class="entry-content__toc-item">
      <a :href="`#${index}`" v-html="item" />
    </li>
  </ul>
</template>
<script>
export default {
  name: 'EntryToc',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  }
}
</script>
