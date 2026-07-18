import { defineField, defineType } from 'sanity'
import { CalendarIcon } from '@sanity/icons/Calendar';

import { imageField } from '@/util/image'
import { linkField } from '@/util/link'
import { programField } from '@/util/program'
import { creditFields } from '@/schemaTypes/shared/creditFields'

export const eventType = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
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
      options: { source: 'title' },
      validation: (rule) => rule.required(),
    }),
    defineField(imageField({
      title: 'Hero Image',
      name: 'heroImage',
    })),
    defineField(programField({
      title: 'Program',
      name: 'program',
    })),
    defineField({
      title: 'Description',
      name: 'description',
      type: 'array',
      of: [{ type: 'block' }],
    }),

    defineField({
      title: 'Date / Times',
      name: 'dateTimes',
      type: 'array',
      of: [
        defineField({
          type: 'object',
          name: 'dateTimeRange',
          title: 'Date / Time Range',
          fields: [
            defineField({
              title: 'Start',
              name: 'start',
              type: 'datetime',
              validation: (rule) => rule.required(),
            }),
            defineField({
              title: 'End',
              name: 'end',
              type: 'datetime',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { start: 'start', end: 'end' },
            prepare: ({ start, end }) => ({
              title: `${start} \u2013 ${end}`,
            }),
          },
        }),
      ],
    }),
    defineField({
      title: 'Cost',
      name: 'cost',
      type: 'string',
    }),
    defineField({
      title: 'Location Short',
      name: 'locationShort',
      type: 'string',
      description: 'Brief location label for the page header pin (e.g. "New York" or "New York, Online")',
    }),
    defineField({
      title: 'Location Description',
      name: 'location',
      type: 'text',
      description: 'Full address displayed in the details sidebar',
    }),
    defineField({
      title: 'Access Info',
      name: 'accessInfo',
      type: 'text',
    }),
    defineField({
      title: 'Links',
      name: 'links',
      type: 'array',
      of: [linkField()],
    }),

    // --- Optional Content Sections ---
    defineField({
      title: 'About the Artists',
      name: 'featuredArtists',
      type: 'array',
      of: [
        defineField({
          type: 'object',
          name: 'featuredArtist',
          title: 'Featured Artist',
          fields: [
            defineField({
              title: 'Artist',
              name: 'artist',
              type: 'reference',
              to: [{ type: 'artist' }],
            }),
            defineField({
              title: 'Image',
              name: 'image',
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({
                  name: 'alt',
                  type: 'string',
                  title: 'Alt text',
                }),
              ],
            }),
            defineField({
              title: 'Name',
              name: 'name',
              type: 'string',
            }),
            defineField({
              title: 'Bio',
              name: 'bio',
              type: 'array',
              of: [{ type: 'block' }],
            }),
          ],
          preview: {
            select: { name: 'name', artistName: 'artist.name', media: 'image' },
            prepare: ({ name, artistName, media }) => ({
              title: name || artistName || 'Featured Artist',
              media,
            }),
          },
        }),
      ],
    }),
    defineField({
      title: 'Artworks on View',
      name: 'artworks',
      type: 'array',
      of: [
        defineField({
          type: 'object',
          name: 'artwork',
          title: 'Artwork',
          fields: [
            defineField(imageField({
              title: 'Image',
              name: 'image',
            })),
            defineField({
              title: 'Description',
              name: 'description',
              type: 'array',
              of: [{ type: 'block' }],
            }),
          ],
          preview: {
            select: { media: 'image' },
            prepare: ({ media }) => ({
              title: 'Artwork',
              media,
            }),
          },
        }),
      ],
    }),
    defineField({
      title: 'About the Program',
      name: 'aboutProgram',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      title: 'Schedule',
      name: 'schedule',
      type: 'object',
      fields: [
        defineField({
          title: 'Description',
          name: 'description',
          type: 'array',
          of: [{ type: 'block' }],
        }),
        defineField({
          title: 'Items',
          name: 'items',
          type: 'array',
          of: [
            defineField({
              type: 'object',
              name: 'scheduleItem',
              title: 'Schedule Item',
              fields: [
                defineField({
                  title: 'Title',
                  name: 'title',
                  type: 'string',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  title: 'Time',
                  name: 'time',
                  type: 'string',
                }),
                defineField({
                  title: 'Description',
                  name: 'description',
                  type: 'array',
                  of: [{ type: 'block' }],
                }),
              ],
              preview: {
                select: { title: 'title', time: 'time' },
                prepare: ({ title, time }) => ({
                  title: title,
                  subtitle: time,
                }),
              },
            }),
          ],
        }),
      ],
    }),

    ...creditFields,
  ],
})
