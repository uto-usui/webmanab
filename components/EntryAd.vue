<template>
  <div class="entry-ad">
    <img src="http://dummyimage.com/860x90/4d494d/686a82.gif&text=placeholder+image" alt="placeholder+image">
  </div>
</template>

<style lang="scss">
.entry-ad {
  padding: 0.8rem;
  margin-top: 4rem;
  margin-bottom: 4rem;
  border: 6px double $black;
}
</style>

<script>
export default {
  name: 'EntryAd',
  props: {
    article: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
