<template>
  <header class="header" :class="[{'is-fixed': isFixed}]">
    <div ref="target" class="header__inner" :class="[{'is-fixed': isFixed}]">
      <h1 class="header__title">
        <nuxt-link to="/">
          webmanab.html
        </nuxt-link>
      </h1>
      <nav class="header__nav">
        <ul class="header__nav-list">
          <li class="header__nav-item">
            <nuxt-link class="header__nav-target" to="/tip/">
              tip
            </nuxt-link>
          </li>
          <li class="header__nav-item">
            <nuxt-link class="header__nav-target" to="/clip/">
              clip
            </nuxt-link>
          </li>
          <li class="header__nav-item">
            <nuxt-link class="header__nav-target" to="/clip/">
              about
            </nuxt-link>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<style lang="scss">
.header {
  //
  &.is-fixed {
    padding-top: 120px;
  }
}

.header__inner {
  padding: 15px;
  //
  @include tablet {
    padding: 30px;
  }
  //
  @include desktop {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 51px 40px 35px;
  }
  //
  &.is-fixed {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 99;
    height: 40px;
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
  }
}

.header__title {
  margin-top: 30px;
  margin-bottom: 30px;
  //
  > a {
    font-size: 3.2rem;
    font-weight: bold;
    color: $glay;

    .header.fixed & {
      font-size: 3rem;
    }
  }
  //
  @include tablet {
    margin-top: 45px;
    font-size: 4rem;
  }
  //
  @include desktop {
    padding-left: 16px;
    margin-top: 0;
    margin-bottom: 0;
  }
}

.header__nav {
  width: 80%;
  margin-right: auto;
  margin-left: auto;
  //
  @include desktop {
    width: 300px;
    margin-right: 100px;
  }
}

.header__nav-list {
  display: flex;
  justify-content: center;
  //
  @include desktop {
    justify-content: flex-end;
  }
}

.header__nav-item {
  //
  + .header__nav-item {
    margin-left: 3rem;
    //
    @include tablet {
      margin-left: 5rem;
    }
  }
}

.header__nav-target {
  font-size: 1.8rem;
  font-style: italic;
  color: $glay;
  //
  &:hover {
    text-decoration: none;
  }
}
</style>

<script>
export default {
  components: {},
  data() {
    return {
      isFixed: false
    }
  },
  mounted() {
    this.checkFixed()
  },
  methods: {
    checkFixed() {
      this.isFixed = window.innerWidth >= 1080 && window.pageYOffset > 51

      requestAnimationFrame(this.checkFixed)
    }
  }
}
</script>
