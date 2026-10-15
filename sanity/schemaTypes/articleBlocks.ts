import {defineField, defineType} from 'sanity'

import {imageField} from '@/util/image'

function firstText(value: unknown): string {
  if (!Array.isArray(value)) return ''
  const first = value[0] as
    | {_type?: string; question?: string; children?: Array<{text?: string}>}
    | undefined
  if (!first) return ''
  if (first._type === 'qa') return first.question || ''
  return first.children?.[0]?.text || ''
}

const ALIGN_LABELS = {left: 'Left', right: 'Right', center: 'Center'} as const
const STYLE_LABELS = {body: 'Body', lead: 'Lead', small: 'Small'} as const
const LAYOUT_LABELS = {full: 'Full', alignLeft: 'Align left', alignRight: 'Align right'} as const
const POSITION_LABELS = {left: 'Left', right: 'Right'} as const

export const qaType = defineType({
  name: 'qa',
  title: 'Q&A',
  type: 'object',
  fields: [
    defineField({
      title: 'Question',
      name: 'question',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'Answer',
      name: 'answer',
      type: 'array',
      of: [{type: 'block'}],
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'question'},
    prepare: ({title}) => ({title: title || 'Q&A'}),
  },
})

export const articleTextType = defineType({
  name: 'articleText',
  title: 'Text',
  type: 'object',
  fields: [
    defineField({
      title: 'Alignment',
      name: 'align',
      type: 'string',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Right', value: 'right'},
          {title: 'Center', value: 'center'},
        ],
      },
      initialValue: 'left',
    }),
    defineField({
      title: 'Style',
      name: 'style',
      type: 'string',
      options: {
        list: [
          {title: 'Body', value: 'body'},
          {title: 'Lead', value: 'lead'},
          {title: 'Small', value: 'small'},
        ],
      },
      initialValue: 'body',
    }),
    defineField({
      title: 'Text',
      name: 'text',
      type: 'array',
      of: [{type: 'block'}, {type: 'qa'}],
    }),
  ],
  preview: {
    select: {text: 'text', style: 'style', align: 'align'},
    prepare: ({text, style, align}) => ({
      title: firstText(text) || 'Text',
      subtitle: `${ALIGN_LABELS[align as keyof typeof ALIGN_LABELS] ?? ''} · ${STYLE_LABELS[style as keyof typeof STYLE_LABELS] ?? ''}`,
    }),
  },
})

export const pullQuoteType = defineType({
  name: 'pullQuote',
  title: 'Pull Quote',
  type: 'object',
  fields: [
    defineField({
      title: 'Quote',
      name: 'text',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'Size',
      name: 'size',
      type: 'string',
      options: {
        list: [
          {title: 'Standard', value: 'standard'},
          {title: 'Large', value: 'large'},
        ],
      },
      initialValue: 'standard',
    }),
  ],
  preview: {
    select: {text: 'text'},
    prepare: ({text}) => ({title: text || 'Pull Quote'}),
  },
})

export const articleImageType = defineType({
  name: 'articleImage',
  title: 'Image',
  type: 'object',
  fields: [
    defineField(imageField({title: 'Image', name: 'image'})),
    defineField({
      title: 'Layout',
      name: 'layout',
      type: 'string',
      options: {
        list: [
          {title: 'Full', value: 'full'},
          {title: 'Align left', value: 'alignLeft'},
          {title: 'Align right', value: 'alignRight'},
        ],
      },
      initialValue: 'full',
    }),
  ],
  preview: {
    select: {media: 'image', layout: 'layout', alt: 'image.alt'},
    prepare: ({media, layout, alt}) => ({
      title: alt || 'Image',
      subtitle: LAYOUT_LABELS[layout as keyof typeof LAYOUT_LABELS] ?? 'Full',
      media,
    }),
  },
})

export const imagePairType = defineType({
  name: 'imagePair',
  title: 'Two Images',
  type: 'object',
  fields: [
    defineField(imageField({title: 'First Image', name: 'image1'})),
    defineField(imageField({title: 'Second Image', name: 'image2'})),
  ],
  preview: {
    select: {media: 'image1', alt: 'image1.alt'},
    prepare: ({media, alt}) => ({
      title: alt || 'Two Images',
      media,
    }),
  },
})

export const imageTextType = defineType({
  name: 'imageText',
  title: 'Image + Text',
  type: 'object',
  fields: [
    defineField(imageField({title: 'Image', name: 'image'})),
    defineField({
      title: 'Image Position',
      name: 'imagePosition',
      type: 'string',
      options: {
        list: [
          {title: 'Left', value: 'left'},
          {title: 'Right', value: 'right'},
        ],
      },
      initialValue: 'left',
    }),
    defineField({
      title: 'Text',
      name: 'text',
      type: 'array',
      of: [{type: 'block'}, {type: 'qa'}],
    }),
  ],
  preview: {
    select: {media: 'image', imagePosition: 'imagePosition', text: 'text'},
    prepare: ({media, imagePosition, text}) => ({
      title: firstText(text) || 'Image + Text',
      subtitle: POSITION_LABELS[imagePosition as keyof typeof POSITION_LABELS] ?? 'Left',
      media,
    }),
  },
})

export const articleBlockTypes = [
  articleTextType,
  pullQuoteType,
  articleImageType,
  imagePairType,
  imageTextType,
]
