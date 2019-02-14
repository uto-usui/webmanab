<template>
  <Wrapper>
    <SectionEntry>
      <EntryHead :article="article" />
      <EntryAd :article="article" />
      <EntryContent :article="article" />
      <EntryClipLink :article="article" :img="featuredImage.source_url" :alt="featuredImage.alt" />
      <LazyImage :src="article.clipImage" class="entry__img-full" :alt="`${article.title} overview image`" />
      <EntryAd :article="article" />
      <EntrySns :article="article" />
      <EntryTag :article="article" />
      <EntryRelated :article="article" />
      <EntryNav :article="article" />
    </SectionEntry>
  </Wrapper>
</template>

<style lang="scss" scoped>
.entry__img-full {
  margin-top: 120px;
}
</style>

<script>
import nuxtend from 'nuxtend'

import Wrapper from '~/components/Wrapper'
import LazyImage from '~/components/LazyImage'
import EntryHead from '~/components/EntryHead'
import EntryContent from '~/components/EntryContent'
import EntryClipLink from '~/components/EntryClipLink'
import SectionEntry from '~/components/SectionEntry'

import SingleAsyncData from '~/mixins/Single'

export default nuxtend({
  mixins: [SingleAsyncData],

  components: {
    LazyImage,
    Wrapper,
    EntryHead,
    EntryContent,
    EntryClipLink,
    SectionEntry,
    EntryAd: () => import('~/components/EntryAd'),
    EntrySns: () => import('~/components/EntrySns'),
    EntryTag: () => import('~/components/EntryTag'),
    EntryRelated: () => import('~/components/EntryRelated'),
    EntryNav: () => import('~/components/EntryNav')
  },

  data() {
    return {
      postType: 'clip'
    }
  }
})
</script>
