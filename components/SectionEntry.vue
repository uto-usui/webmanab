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
  max-width: 940px;
  margin-right: auto;
  margin-left: auto;
  //
  @include desktop {
    padding-right: 30px;
    padding-left: 30px;
  }
  //
  @include desktop {
    padding-right: 40px;
    padding-left: 40px;
  }
}
</style>
