<template>
  <article class="entry">
    <slot />
  </article>
</template>

<script>
export default {
  name: 'SectionList'
}
</script>

<style lang="scss" scoped>
.entry {
  max-width: $space-11;
  padding-top: $space-5;
  margin-right: auto;
  margin-left: auto;
  //
  @include desktop {
    //
  }
}
</style>
