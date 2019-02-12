<template>
  <h2 class="menu-title" v-html="listTitle" />
</template>

<script>
export default {
  name: 'MenuTitle',
  props: {
    listTitle: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss">
.menu-title {
  padding-bottom: 0.4em;
  padding-left: 0.6em;
  margin-bottom: 15px;
  font-size: 2.8rem;
  font-weight: 800;
  color: $secondary-color;
  text-align: left;
  text-transform: capitalize;
  border-bottom: 1px solid $white;
  //
  @include tablet {
    font-size: 4.6rem;
  }
}
</style>
