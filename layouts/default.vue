<template>
  <div class="default-layout" :class="$route.name">
    <Bar v-for="index in 4" :key="`bar${index}`" />
    <Header />
    <slot />
    <Menu />
    <Icon />
  </div>
</template>

<script>
import Menu from '~/components/Menu'
import Bar from '~/components/Bar'
import Header from '~/components/Header'
import Icon from '~/components/Icon'

export default {
  components: { Menu, Bar, Header, Icon }
}
</script>

<style lang="scss">
@include tablet {
  //
}

@include desktop {
  //
}

@include widescreen {
  //
}

@font-face {
  font-family: 'MyYuGothicM';
  font-weight: normal;
  src: local('YuGothic-Medium'), local('Yu Gothic Medium'),
    local('YuGothic-Regular');
}

@font-face {
  font-family: 'MyYuGothicM';
  font-weight: bold;
  src: local('YuGothic-Bold'), local('Yu Gothic');
}

@import '~Sass/foundation/_reset';
@import '~Sass/foundation/base/_base';
@import '~Sass/object/utility/_utility';
</style>
