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
  padding-top: $space-2;
  padding-bottom: $space-2;
  padding-left: $space-2;
  margin-bottom: $space-2;
  font-size: $font-size-l5;
  font-weight: 800;
  color: $secondary-color;
  text-align: left;
  text-transform: capitalize;
  border-bottom: 1px solid rgba($white, 0.5);
  //
  @include tablet {
    padding-top: $space-5;
    padding-left: $space-4;
    margin-bottom: $space-4;
    font-size: $font-size-l6;
  }
}
</style>
