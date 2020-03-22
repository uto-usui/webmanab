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
  padding-top: space-scalar(4);
  padding-bottom: space-scalar(4);
  padding-left: space-scalar(4);
  margin-bottom: space-scalar(4);
  font-weight: 600;
  color: $secondary-color;
  text-align: left;
  text-transform: capitalize;
  border-bottom: 1px solid rgba($white, 0.5);
  //
  @include sizes(4);
  //
  @include tablet {
    padding-top: space-scalar(12);
    padding-left: space-scalar(8);
    margin-bottom: space-scalar(8);
    //
    @include sizes(5);
  }
}
</style>
