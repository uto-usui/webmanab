<template>
  <div class="menu__wrapper">
    <nav class="menu" :class="[{'is-open': getMenuOpen}]">
      <a class="menu__btn" href="#" @click.prevent="toggleMenuOpen">
        menu
      </a>
      <div class="menu__inner">
        <MenuList :list-data="tipsList" list-title="tip" />
        <MenuList :list-data="clipsList" list-title="clip" />
        <MenuList :list-data="labsList" list-title="lab" />
      </div>
    </nav>
    <div class="menu__overlay" />
  </div>
</template>

<style lang="scss">
.menu__wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  perspective: 800px;
  pointer-events: none;
}

.menu {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 9999;
  display: flex;
  margin: space-scalar(4);
  transition: transform 0.85s $easeInOutQuint;
  transform: translateX(100%);
  perspective: 800px;
  will-change: transform;
  //
  &.is-open {
    transform: translateX(0);
  }

  //
  @include tablet {
    margin: space-scalar(8);
  }
  //
  @include desktop {
    margin: space-scalar(10);
  }
}

.menu__btn {
  position: relative;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: space-scalar(16);
  height: space-scalar(16);
  font-style: italic;
  font-weight: 600;
  color: $secondary-color;
  text-transform: uppercase;
  pointer-events: auto;
  background-color: $glay;
  transition: transform 0.45s $easeOutSine;
  transition-delay: 0.35s;
  transform: translateX(-#{space-scalar(16)});
  will-change: transform;
  //
  @include sizes(-2);
  //
  &:hover {
    text-decoration: none;
  }

  // active
  .menu.is-open & {
    transition-delay: 0s;
    transform: translateX(0);
  }
}

.menu__inner {
  width: calc(100% - #{space-scalar(16)});
  height: 100%;
  padding-top: 2px;
  overflow-y: auto;
  background-color: rgba($glay, 0.95);
  transition: 0.85s $easeInOutExpo;
  transform: rotateY(5deg);
  transform-origin: 0% 50%;
  //
  @include desktop {
    padding-bottom: $space-5;
  }
  //
  .menu.is-open & {
    pointer-events: auto;
    opacity: 1;
    transform: rotateY(0);
  }
}

.menu__overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  margin: space-scalar(4);
  background-color: rgba($thirdry-color, 0);
  transition: 0.4s $easeInOutExpo;
  transform: rotateY(10deg) translateX(-100%) translateZ(0);
  transform-origin: 0% 50%;
  //
  @include tablet {
    margin: space-scalar(8);
  }
  //
  @include desktop {
    margin: space-scalar(10);
  }
  // active
  @at-root {
    .menu.is-open + .menu__overlay {
      background-color: rgba($thirdry-color, 0.85);
      transform: rotateY(0) translateX(0) translateZ(0);
    }
  }
}
</style>

<script>
import { mapActions, mapGetters } from 'vuex'
import MenuList from './MenuList'

export default {
  components: { MenuList },
  data() {
    return {
      tipsList: [],
      clipsList: [],
      labsList: [],
      isOpen: false
    }
  },
  computed: {
    ...mapGetters(['getMenuOpen'])
  },
  async created() {
    const query = {
      page: 1
    }
    // get taxnomy for menu
    const data = await Promise.all([
      this.$api.get('/tips', query),
      this.$api.get('/clips', query),
      this.$api.get('/labs', query)
    ])
    this.tipsList = data[0].data
    this.clipsList = data[1].data
    this.labsList = data[2].data
  },
  methods: {
    ...mapActions(['toggleMenuOpen'])
  }
}
</script>
