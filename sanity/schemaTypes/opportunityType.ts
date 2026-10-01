import {defineField, defineType} from 'sanity'
import {SparklesIcon} from '@sanity/icons/Sparkles'

import {imageField} from '@/util/image'
import {linksField} from '@/util/link'

export const opportunityType = defineType({
  name: 'opportunity',
  title: 'Opportunity',
  type: 'document',
  icon: SparklesIcon,
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
    defineField(imageField({
      title: 'Hero Image',
      name: 'heroImage',
    })),
    defineField({
      title: 'Location Short',
      name: 'locationShort',
      type: 'string',
      description: 'Brief location label shown in the breadcrumb pin (e.g. "New York").',
    }),
    defineField({
      title: 'Timeline',
      name: 'timeline',
      type: 'text',
      description: 'Displayed under "Timeline" in the opportunity summary.',
    }),
    defineField({
      title: 'Where',
      name: 'where',
      type: 'text',
      description: 'Displayed under "Where" in the opportunity summary.',
    }),
    defineField({
      title: 'Benefits',
      name: 'benefits',
      type: 'text',
      description: 'Displayed under "Benefits" in the opportunity summary.',
    }),
    defineField({
      title: 'Description',
      name: 'description',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Rendered in two columns below the summary.',
    }),
    defineField(linksField({
      title: 'Links',
      name: 'links',
    })),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'heroImage',
    },
  },
})
