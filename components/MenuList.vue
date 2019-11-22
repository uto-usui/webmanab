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
  padding-right: $space-2;
  padding-left: $space-2;
  margin-bottom: $space-2;
  margin-left: -5px;
  //
  @include mobile {
    max-height: 350px;
    overflow: auto;
  }
  //
  @include desktop {
    padding-right: $space-4;
    padding-left: $space-4;
  }
}

.menu-list__target {
  display: inline-block;
  padding: 0.6em 0.8em;
  font-size: $font-size-l1;
  color: $white;
  text-transform: uppercase;
  transition: 0.25s $easeOutQuart;
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
