import {defineArrayMember, defineField, defineType} from 'sanity'

import { imageField } from '@/util/image';
import { linksField } from "@/util/link"
import { programField } from "@/util/program"

export const artistType = defineType({
  name: 'artist',
  title: 'Artist',
  type: 'document',
  fields: [
    defineField({
      title: 'Name',
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: "Slug",
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
      title: "Bio",
      name: 'bio',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      title: "Project Statement",
      name: 'projectStatement',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField(linksField({
      title: "Links",
      name: 'links',
    })),
    defineField({
      title: 'Program Memberships',
      name: 'programs',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'programMembership',
          title: 'Program Membership',
          fields: [
            defineField({
              title: 'Program',
              name: 'program',
              type: 'reference',
              to: [{ type: 'program' }],
              validation: (rule) => rule.required(),
            }),
            defineField({
              title: 'Year Start',
              name: 'yearStart',
              type: 'number',
              validation: (rule) => rule.required().integer().min(2000).max(2100),
            }),
            defineField({
              title: 'Year End',
              name: 'yearEnd',
              type: 'number',
              validation: (rule) => rule.required().integer().min(2000).max(2100),
            }),
            defineField({
              title: 'Location',
              name: 'location',
              type: 'string',
              description: 'e.g. "Los Angeles", "New York → Berlin"',
            }),
          ],
          preview: {
            select: {
              programTitle: 'program.title',
              yearStart: 'yearStart',
            },
            prepare: ({ programTitle, yearStart }) => ({
              title: programTitle || 'Untitled Program',
              subtitle: yearStart ? `${yearStart}` : '',
            }),
          },
        }),
      ],
      validation: (rule) => rule.min(1).warning('Each artist should belong to at least one program.'),
    }),

    // Deprecate old program field
    defineField({
      ...programField({
        title: 'Program (Deprecated)',
        name: 'program',
      }),
      deprecated: {
        reason: 'Use "Program Memberships" instead. This field will be removed in the next migration phase.',
      },
      readOnly: true,
      hidden: ({ value }) => value === undefined,
      initialValue: undefined,
    }),
    defineField({
      title: "Locations",
      name: 'locations',
      type: 'array',
      validation: (rule) => rule.required(),
      of: [{type: "string"}],
    }),
    defineField({
      name: 'projects',
      type: 'array',
      of: [{
        type: 'reference',
        to: [{ type: 'project' }],
      }],
    }),
    // TODO add other media type references
  ],
})
