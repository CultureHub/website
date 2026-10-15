import {defineField, defineType} from 'sanity'

import {imageField} from '@/util/image'

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
          {title: 'Series note', value: 'seriesNote'},
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
    select: {style: 'style'},
    prepare: ({style}) => ({title: 'Text', subtitle: style}),
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
          {title: 'Full bleed', value: 'fullBleed'},
          {title: 'Full', value: 'full'},
          {title: 'Align left', value: 'alignLeft'},
          {title: 'Align right', value: 'alignRight'},
        ],
      },
      initialValue: 'full',
    }),
  ],
  preview: {
    select: {media: 'image', layout: 'layout'},
    prepare: ({media, layout}) => ({title: 'Image', subtitle: layout, media}),
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
    select: {media: 'image1'},
    prepare: ({media}) => ({title: 'Two Images', media}),
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
    select: {media: 'image', imagePosition: 'imagePosition'},
    prepare: ({media, imagePosition}) => ({
      title: 'Image + Text',
      subtitle: imagePosition,
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
