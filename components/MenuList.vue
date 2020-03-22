<template>
  <div class="menu-list__wrapper">
    <MenuTitle :list-title="listTitle" />
    <ul class="menu-list">
      <li v-for="(item, index) in listData" :key="`listIndex${index}`" class="menu-list__item">
        <nuxt-link class="menu-list__target" :to="`/${item.taxonomy}/${item.id}/`">
          {{ item.name }}
        </nuxt-link>
      </li>
    </ul>
  </div>
</template>

<script>
import MenuTitle from '~/components/MenuTitle'

export default {
  name: 'MenuList',
  components: { MenuTitle },
  props: {
    listData: {
      type: Array,
      default: () => []
    },
    listTitle: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss">
.menu-list__wrapper {
  //
}

.menu-list {
  display: flex;
  flex-wrap: wrap;
  padding-right: space-scalar(4);
  padding-left: space-scalar(4);
  margin-bottom: space-scalar(4);
  margin-left: -5px;
  //
  @include mobile {
    max-height: space-scalar(90);
    overflow: auto;
  }
  //
  @include desktop {
    padding-right: space-scalar(8);
    padding-left: space-scalar(8);
  }
}

.menu-list__target {
  display: inline-block;
  padding: 0.6em 0.8em;
  color: $white;
  text-transform: uppercase;
  transition: 0.25s $easeOutQuart;
  //
  @include sizes(-2);
  //
  @include desktop {
    @include sizes(-1);
  }
  //
  &:hover {
    text-decoration: none;
    background-color: $black;
    box-shadow: -5px 5px 0 $primary-color;
    transform: translate(5px, -5px);
    //
    &::after {
      top: 0;
      left: 0;
    }
  }
}

.menu-list__item {
  //
}
</style>
