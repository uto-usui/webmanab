<template>
  <Wrapper>
    <SectionEntry>
      <EntryHead :article="article" />
      <!--<EntryAd :article="article" />-->
      <EntryContent :article="article" />
      <EntryClipLink :article="article" :img="featuredImage.source_url" :alt="featuredImage.alt" />
      <EntryClipFullImage v-if="article.clipImage" :article="article" />
      <!--<EntryAd :article="article" />-->
      <EntrySns :article="article" />
      <EntryTag :article="article" />
      <EntryRelated :article="article" />
      <EntryNav :article="article" />
    </SectionEntry>
  </Wrapper>
</template>

<script>
import nuxtend from 'nuxtend'

import Wrapper from '~/components/Wrapper'
import EntryHead from '~/components/EntryHead'
import EntryContent from '~/components/EntryContent'
import EntryClipLink from '~/components/EntryClipLink'
import EntryClipFullImage from '~/components/EntryClipFullImage'
import SectionEntry from '~/components/SectionEntry'

import SingleAsyncData from '~/mixins/Single'

export default nuxtend({
  mixins: [SingleAsyncData],

  components: {
    Wrapper,
    EntryHead,
    EntryContent,
    EntryClipLink,
    EntryClipFullImage,
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
