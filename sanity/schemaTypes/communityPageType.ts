import {defineArrayMember, defineField, defineType} from 'sanity'

import {imageField} from '@/util/image'

export const communityPageType = defineType({
  name: 'communityPage',
  title: 'Community Page',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Community',
    }),
    defineField({
      name: 'introText',
      title: 'Intro Text',
      type: 'text',
      rows: 3,
    }),

    defineField({
      name: 'featuredArtistsTitle',
      title: 'Featured Artists Title',
      type: 'string',
      initialValue: 'Featured Artists',
    }),
    defineField({
      name: 'featuredArtists',
      title: 'Featured Artists',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'artist'}]}],
    }),

    defineField({
      name: 'artistDirectoryTitle',
      title: 'Artist Directory Title',
      type: 'string',
      initialValue: 'Artist Directory',
      description: 'The directory itself is populated dynamically from artists.',
    }),

    defineField({
      name: 'opportunitiesTitle',
      title: 'Opportunities Title',
      type: 'string',
      initialValue: 'Opportunities',
    }),
    defineField({
      name: 'opportunitiesIntro',
      title: 'Opportunities Intro',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'currentOpportunitiesTitle',
      title: 'Current Opportunities Title',
      type: 'string',
      initialValue: 'Current Opportunities',
    }),
    defineField({
      name: 'opportunities',
      title: 'Opportunities',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'opportunity'}, {type: 'program'}]}],
      description:
        'Opportunities and programs to display. The card tag uses the program short label, or "Opportunity" for opportunity documents.',
    }),

    defineField({
      name: 'supportTitle',
      title: 'Support Title',
      type: 'string',
      initialValue: 'Support CultureHub',
    }),
    defineField({
      name: 'supportImages',
      title: 'Support Images',
      type: 'array',
      of: [imageField({name: 'image', title: 'Image'})],
      description: 'Slideshow images shown in the support section.',
    }),
    defineField({
      name: 'supportText',
      title: 'Support Text',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'supportSubtext',
      title: 'Support Subtext',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'membershipTitle',
      title: 'Membership Title',
      type: 'string',
      initialValue: 'Become a Member',
    }),
    defineField({
      name: 'membershipIntro',
      title: 'Membership Intro',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'membershipTiers',
      title: 'Membership Tiers',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'membershipTier',
          title: 'Membership Tier',
          fields: [
            defineField({
              title: 'Name',
              name: 'name',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              title: 'Price',
              name: 'price',
              type: 'string',
              description: 'e.g. "$6 per Month"',
            }),
            defineField({
              title: 'Benefits',
              name: 'benefits',
              type: 'text',
              description: 'One benefit per line, prefixed with "+".',
            }),
          ],
          preview: {
            select: {name: 'name', price: 'price'},
            prepare: ({name, price}) => ({
              title: name || 'Tier',
              subtitle: price,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'donationTitle',
      title: 'Donation Title',
      type: 'string',
      initialValue: 'Make a Donation',
    }),
    defineField({
      name: 'donationText',
      title: 'Donation Text',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'donationMethods',
      title: 'Donation Methods',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'donationMethod',
          title: 'Donation Method',
          fields: [
            defineField({
              title: 'Title',
              name: 'title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              title: 'Body',
              name: 'body',
              type: 'array',
              of: [{type: 'block'}],
            }),
          ],
          preview: {
            select: {title: 'title'},
            prepare: ({title}) => ({
              title: title || 'Donation Method',
            }),
          },
        }),
      ],
    }),
  ],
})
