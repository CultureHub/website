import {defineField, defineType} from 'sanity'

import { imageField } from '@/util/image';

export const artistType = defineType({
  name: 'artist',
  title: 'Artist',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField(imageField({
      title: 'Image',
      name: 'image',
    })),
    defineField({
      name: 'bio',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      name: 'years',
      type: 'array',
      of: [{
        type: 'number',
        validation: (Rule) => Rule.required().min(1900).max(2100).integer()
      }],
    }),
    defineField({
      name: 'medium',
      type: 'array',
      validation: (rule) => rule.required(),
      of: [{
        type: 'string',
        options: {
          list: [
            { title: 'AI', value: 'AI' },
            { title: 'Education', value: 'Education' },
            { title: 'Installation', value: 'Installation' },
            { title: 'Livestream', value: 'Livestream' },
            { title: 'Performance', value: 'Performance' },
            { title: 'VR', value: 'VR' },
          ],
        },
      }],
    }),
    defineField({
      name: 'projects',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'project' }],
      }],
    }),
  ],
})
