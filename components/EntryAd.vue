<template>
  <div class="entry-ad">
    <adsbygoogle :ad-slot="adSlot" />
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
    adSlot: {
      type: String,
      default: ''
    }
  }
}
</script>
