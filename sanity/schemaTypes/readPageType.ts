import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {
  canonicalId,
  validateFeaturedSelection,
  validatePreviewSource,
  type FeatureReference,
  type PreviewSource,
} from '../../shared/editorial/content'

type FeaturedEntry = FeatureReference & {previewMode?: 'image' | 'text'}

export const featuredArticleType = defineType({
  name: 'featuredArticle',
  title: 'Featured Article',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'article',
      type: 'reference',
      to: [{type: 'article'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'previewMode',
      title: 'Hover Preview',
      type: 'string',
      initialValue: 'text',
      options: {
        layout: 'radio',
        list: [
          {title: 'Opening text', value: 'text'},
          {title: 'Hero image', value: 'image'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'previewWordCount',
      title: 'Preview Word Count',
      type: 'number',
      initialValue: 80,
      description: 'Show the first 10–150 words of the article on hover or keyboard focus.',
      hidden: ({parent}) => parent?.previewMode !== 'text',
      validation: (rule) =>
        rule.custom((value, {parent}) => {
          if ((parent as FeaturedEntry | undefined)?.previewMode !== 'text') return true
          return typeof value === 'number' && Number.isInteger(value) && value >= 10 && value <= 150
            ? true
            : 'Choose a whole number from 10 to 150 words.'
        }),
    }),
  ],
  validation: (rule) =>
    rule.custom<FeaturedEntry>(async (value, context) => {
      if (!value?.article?._ref) return 'Select an article.'
      if (value.previewMode !== 'image' && value.previewMode !== 'text')
        return 'Choose an image or text preview.'
      const id = canonicalId(value.article._ref)
      try {
        const source = await context
          .getClient({apiVersion: '2024-01-01'})
          .fetch<PreviewSource | null>(
            `coalesce(*[_id == $draftId][0], *[_id == $id][0]){
          heroImage{asset}, content[_type in ["articleText", "imageText"]]{_type, text}
        }`,
            {id, draftId: `drafts.${id}`},
            {perspective: 'raw'},
          )
        return validatePreviewSource(value.previewMode, source)
      } catch {
        return 'Could not verify the article preview. Retry when connected.'
      }
    }),
  preview: {
    select: {title: 'article.title', mode: 'previewMode', media: 'article.heroImage'},
    prepare: ({title, mode, media}) => ({
      title: title || 'Select an article',
      subtitle: mode === 'image' ? 'Hero image preview' : 'Opening text preview',
      media,
    }),
  },
})

export const readPageType = defineType({
  name: 'readPage',
  title: 'Read Page',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({name: 'heading', type: 'string', initialValue: 'Editorial'}),
    defineField({
      name: 'articleIndexTitle',
      title: 'Article Index Title',
      type: 'string',
      initialValue: 'Article Index',
    }),
    defineField({
      name: 'featuredArticles',
      title: 'Featured Articles',
      type: 'array',
      description:
        'Select three articles and drag to reorder. First is the lead; the other two appear below. Remaining published articles populate the year-filtered index automatically.',
      of: [defineArrayMember({type: 'featuredArticle'})],
      validation: (rule) =>
        rule.required().length(3).custom<FeatureReference[]>(validateFeaturedSelection),
    }),
  ],
  preview: {prepare: () => ({title: 'Read Page'})},
})
