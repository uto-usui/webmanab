<template>
  <section class="entry-tag">
    <h3 class="entry-tag_title u-text-left">
      tag <br>ー
    </h3>
    <ul class="entry-tag_list">
      <li class="entry-tag_item">
        <a href="" class="entry-tag_target">
          tagtag
        </a>
      </li>
      <li class="entry-tag_item">
        <a href="" class="entry-tag_target">
          tagtag
        </a>
      </li>
      <li class="entry-tag_item">
        <a href="" class="entry-tag_target">
          tagtag
        </a>
      </li>
      <li class="entry-tag_item">
        <a href="" class="entry-tag_target">
          tagtag
        </a>
      </li>
      <li class="entry-tag_item">
        <a href="" class="entry-tag_target">
          tagtag
        </a>
      </li>
      <li class="entry-tag_item">
        <a href="" class="entry-tag_target">
          tagtag
        </a>
      </li>
      <li class="entry-tag_item">
        <a href="" class="entry-tag_target">
          tagtag
        </a>
      </li>
      <li class="entry-tag_item">
        <a href="" class="entry-tag_target">
          tagtag
        </a>
      </li>
    </ul>
  </section>
</template>
<script>
export default {
  name: 'EntryTag',
  props: {
    article: {
      type: Object,
      default: () => {}
    }
  }
}
</script>
<style lang="scss" scoped>
.entry-tag {
  margin-top: 2rem;
  //
  @include tablet {
    margin-top: 5rem;
  }
}

.entry-tag_title {
  padding-left: 0.2rem;
  font-size: 1.25rem;
  font-style: italic;
  color: $glay;
  letter-spacing: 0.1em;
  //
  @include tablet {
    padding-left: 0.4rem;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
}

.entry-tag_list {
  display: flex;
  flex-flow: wrap;
}

.entry-tag_item {
  margin-right: 1.5rem;
}

.entry-tag_target {
  position: relative;
  top: 0;
  left: 0;
  padding: 0.2em 0.5em 0.15em;
  line-height: 2.5;
  color: $white;
  text-transform: uppercase;
  background-color: $glay;
  transition: 0.25s $easeOutQuart;
  //
  &:hover {
    top: -5px;
    left: 5px;
    text-decoration: none;
    box-shadow: -5px 5px 0 $thirdry-color;
  }
}
</style>
