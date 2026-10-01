import {defineArrayMember, defineField, defineType} from 'sanity'

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
    defineField({
      title: 'Page Description',
      name: 'pageDescription',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Rich text shown in the program page header. Leave empty to omit the header description.',
    }),
    defineField({
      title: 'Has Page',
      name: 'hasPage',
      type: 'boolean',
      initialValue: true,
      description: 'When disabled, visiting this program\'s slug returns a 404.',
    }),
    defineField({
      title: 'Open Call',
      name: 'openCall',
      type: 'reference',
      to: [{ type: 'opportunity' }],
      description: 'The opportunity powering this program\'s open call section.',
    }),
    defineField({
      title: 'Location Content',
      name: 'locationContent',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'locationTab',
          fields: [
            defineField({
              title: 'Location',
              name: 'location',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              title: 'Display Title',
              name: 'displayTitle',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              title: 'Description',
              name: 'description',
              type: 'array',
              of: [{ type: 'block' }],
            }),
            defineField({
              title: 'Accent Color',
              name: 'accentColor',
              type: 'string',
              description: 'Hex color for tab styling',
            }),
          ],
          preview: {
            select: { title: 'location', subtitle: 'displayTitle' },
            prepare: ({ title, subtitle }) => ({
              title: title || 'Location',
              subtitle,
            }),
          },
        }),
      ],
    }),
    defineField({
      title: 'Featured Artists',
      name: 'featuredArtists',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'artist' }] }],
    }),
    defineField({
      title: 'Featured Projects',
      name: 'featuredProjects',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'project' }] }],
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

