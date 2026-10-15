import {defineField, defineType} from 'sanity'

import {imageField} from '@/util/image'

export const articleType = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      title: 'Title',
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'Slug',
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'Publish Date',
      name: 'publishDate',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'Deck',
      name: 'deck',
      type: 'string',
      description: 'Subtitle shown under the title.',
    }),
    defineField({
      title: 'Byline',
      name: 'byline',
      type: 'string',
      description: 'e.g. "Written by Mark Iosifescu" or "Scribble".',
    }),
    defineField({
      title: 'Header Layout',
      name: 'headerLayout',
      type: 'string',
      options: {
        list: [
          {title: 'Centered', value: 'centered'},
          {title: 'Split', value: 'split'},
          {title: 'Split tall', value: 'splitTall'},
        ],
      },
      initialValue: 'centered',
    }),
    defineField(imageField({title: 'Hero Image', name: 'heroImage'}, false)),
    defineField({
      title: 'Content',
      name: 'content',
      type: 'array',
      of: [
        {type: 'articleText'},
        {type: 'pullQuote'},
        {type: 'articleImage'},
        {type: 'imagePair'},
        {type: 'imageText'},
      ],
    }),
    defineField({
      title: 'Author',
      name: 'author',
      type: 'object',
      fields: [
        defineField({
          title: 'Name',
          name: 'name',
          type: 'string',
        }),
        defineField(imageField({title: 'Photo', name: 'photo'}, false)),
        defineField({
          title: 'Website',
          name: 'website',
          type: 'url',
        }),
        defineField({
          title: 'Bio',
          name: 'bio',
          type: 'array',
          of: [{type: 'block'}],
        }),
      ],
    }),
    defineField({
      title: 'Read More',
      name: 'readMore',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'article'}]}],
    }),
  ],
})
