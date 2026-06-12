import {defineField, defineType} from 'sanity'

import { imageField } from '@/util/image'

export const programType = defineType({
  name: 'program',
  title: 'Program',
  type: 'document',
  fields: [
    defineField({
      title: 'Title',
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'Display Title',
      name: 'displayTitle',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      title: 'Slug',
      name: 'slug',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'Short Label',
      name: 'shortLabel',
      type: 'string',
      description: 'Abbreviated label used in compact contexts (e.g. "EDS", "Re-Fest")',
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'Description',
      name: 'description',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField(imageField({
      title: 'Hero Image',
      name: 'heroImage',
    })),
    defineField({
      title: 'Accent Color',
      name: 'accentColor',
      type: 'string',
      description: 'Hex color used for UI accents (e.g. "#B5FD8B")',
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'Thumbnails',
      name: 'thumbnails',
      type: 'array',
      of: [
        imageField({
          name: 'thumbnail',
          title: 'Thumbnail',
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'shortLabel',
      media: 'heroImage',
    },
  },
})

