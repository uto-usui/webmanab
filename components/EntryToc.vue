<template>
  <div class="entry-toc__wrap">
    <section
      class="entry-toc"
      :class="[{'is-open': isOpen}]"
    >
      <a
        href="#"
        class="entry-toc__title"
        @click.prevent="isOpen = !isOpen"
      >
        table of contents<br>ー
      </a>
      <ul class="entry-toc__list">
        <li v-for="(item, index) in list" :key="`toc${index}`" class="entry-toc__item">
          <a
            v-scroll-to="`#a${index}`"
            href="#"
            class="entry-toc__target"
            v-text="item.h2"
          />
          <ul v-if="item.h3">
            <li v-for="(_item, _index) in item.h3" :key="`toc${_index}`" class="toc-item__child">
              <a
                v-scroll-to="`#a${index}${_index}`"
                href="#"
                v-text="`_${_item}`"
              />
            </li>
          </ul>
        </li>
      </ul>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.entry-toc__wrap {
  margin-right: auto;
  margin-left: auto;
  //
  @include tablet {
    margin-top: space-scalar(14);
    margin-bottom: space-scalar(14);
  }
}

.entry-toc {
  position: relative;
  display: block;
  max-height: 120px;
  padding-top: space-scalar(4);
  padding-right: space-scalar(2);
  padding-bottom: space-scalar(4);
  padding-left: space-scalar(2);
  overflow: hidden;
  border-top: 6px double currentColor;
  border-bottom: 6px solid currentColor;
  transition: 0.4s $easeInOutSine;
  //
  @include tablet {
    max-height: 140px;
    padding-right: $space-4;
    padding-left: $space-4;
  }
  //
  &.is-open {
    max-height: 1400px;
    padding-bottom: 4.5rem;
  }
  //
  &:hover {
    //
  }
}

.entry-toc__title {
  display: block;
  margin-bottom: space-scalar(4);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  cursor: pointer;
  //
  @include sizes(0, 0);
  //
  @include desktop {
    margin-bottom: space-scalar(2);
    //
    @include sizes(2, 0);
  }
  //
  &::after {
    position: absolute;
    bottom: space-scalar(4);
    left: 50%;
    z-index: 9;
    font-style: italic;
    content: 'open';
    transition: 0.2s $easeInOutQuart;
    transform: translateX(-50%);
    //
    .entry-toc_title:hover & {
      letter-spacing: 0.6em;
    }
    //
    .entry-toc.is-open & {
      content: 'close';
    }
  }
}

.entry-toc__list {
  position: relative;
  z-index: 1;
  padding-left: $space-3;
  opacity: 0;
  transition: 0.4s $easeInOutSine;
  //
  @include tablet {
    padding-top: 0.5rem;
    padding-bottom: 1rem;
  }
  //
  .entry-toc.is-open & {
    opacity: 1;
    transition-delay: 0.2s;
  }
}

.entry-toc__item {
  text-align: left;
  letter-spacing: 0.1em;
  list-style-type: decimal;
  //
  @include sizes(-1, 0);
  //
  @include tablet {
    @include sizes(0, 0);
  }
  //
  + .entry-toc__item {
    margin-top: space-scalar(6);
    //
    @include tablet {
      margin-top: space-scalar(8);
    }
  }
  //
  .entry-toc.is-open & {
    opacity: 1;
  }
}

.toc-item__child {
  margin-top: space-scalar(2);
  //
  @include sizes(-2, 1);
  //
  @include tablet {
    margin-top: space-scalar(4);
  }
}

.entry-toc__target {
  color: $text-color;
}
</style>

<script>
export default {
  name: 'EntryToc',
  props: {
    list: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      isOpen: false,
      counter: 0
    }
  },
  mounted() {
    this.$nextTick(() => {
      console.log('📜 toc list', this.list)
    })
  }
}
</script>
