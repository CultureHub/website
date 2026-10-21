import {defineArrayMember, defineField, defineType, Rule} from 'sanity'
import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'

import {imageField} from '@/util/image'
import {linkField, linksField} from '@/util/link'
import {programField} from '@/util/program'

const COLOR_VARIANTS = [
  {title: 'Highlighter', value: 'highlighter'},
  {title: 'Pool', value: 'pool'},
  {title: 'Midnight', value: 'midnight'},
  {title: 'Ocher', value: 'ocher'},
  {title: 'Cream', value: 'cream'},
  {title: 'Metal', value: 'metal'},
]

export const festivalType = defineType({
  name: 'festival',
  title: 'Festival',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      title: 'Title',
      name: 'title',
      type: 'string',
      description: 'Theme name, e.g. "Re–Collect", "Re–New", "Re–Mapping".',
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      title: 'Year',
      name: 'year',
      type: 'number',
      validation: (rule: Rule) => rule.required().integer().min(2000).max(2100),
    }),
    defineField({
      title: 'Slug',
      name: 'slug',
      type: 'slug',
      options: {source: 'year'},
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      ...programField({
        title: 'Program',
        name: 'program',
      }),
      options: {filter: 'slug.current == "re-fest"'},
      validation: (rule: Rule) => rule.required(),
    }),
    defineField({
      title: 'Start Date',
      name: 'startDate',
      type: 'date',
    }),
    defineField({
      title: 'End Date',
      name: 'endDate',
      type: 'date',
    }),
    defineField({
      title: 'Summary',
      name: 'summary',
      type: 'text',
      rows: 3,
      description: 'Short copy for the current feature and archive preview.',
    }),
    defineField({
      title: 'About',
      name: 'about',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Long theme copy for the festival template About section.',
    }),
    defineField(imageField({
      title: 'Hero Image',
      name: 'heroImage',
    })),
    defineField(imageField({
      title: 'Logo',
      name: 'logo',
    }, false)),
    defineField({
      title: 'Location Summary',
      name: 'locationSummary',
      type: 'string',
      description:
        'Archive label override, e.g. "New York & Los Angeles", "Worldwide", "Online". Derived from locations when empty.',
    }),
    defineField(linksField({
      title: 'Festival Links',
      name: 'links',
    })),
    defineField({
      title: 'Locations',
      name: 'locations',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'festivalLocation',
          title: 'Location',
          fields: [
            defineField({
              title: 'Name',
              name: 'name',
              type: 'string',
              validation: (rule: Rule) => rule.required(),
            }),
            defineField({
              title: 'Kind',
              name: 'kind',
              type: 'string',
              options: {
                list: [
                  {title: 'In Person', value: 'in-person'},
                  {title: 'Virtual', value: 'virtual'},
                ],
                layout: 'radio',
              },
              initialValue: 'in-person',
              validation: (rule: Rule) => rule.required(),
            }),
            defineField({
              title: 'Color Variant',
              name: 'colorVariant',
              type: 'string',
              options: {
                list: COLOR_VARIANTS,
                layout: 'dropdown',
              },
              initialValue: 'highlighter',
              validation: (rule: Rule) => rule.required(),
            }),
            defineField({
              title: 'Date Label',
              name: 'dateLabel',
              type: 'string',
              description: 'Display date, e.g. "March 6-9th", "April 20–29, 2023".',
            }),
            defineField({
              title: 'Venue Name',
              name: 'venueName',
              type: 'string',
            }),
            defineField({
              title: 'Address',
              name: 'address',
              type: 'text',
            }),
            defineField({
              title: 'Details',
              name: 'details',
              type: 'text',
              description: 'Additional time or access notes.',
            }),
            defineField(linksField({
              title: 'Location Links',
              name: 'links',
            })),
            defineField({
              title: 'Participating Artists',
              name: 'participatingArtists',
              type: 'array',
              of: [{type: 'string'}],
            }),
            defineField({
              title: 'Schedule',
              name: 'schedule',
              type: 'object',
              fields: [
                defineField({
                  title: 'Days',
                  name: 'days',
                  type: 'array',
                  of: [
                    defineArrayMember({
                      type: 'object',
                      name: 'festivalScheduleDay',
                      title: 'Day',
                      fields: [
                        defineField({
                          title: 'Date Label',
                          name: 'dateLabel',
                          type: 'string',
                          description:
                            'Day or program heading, e.g. "Thursday, March 6th" or "Performances".',
                          validation: (rule: Rule) => rule.required(),
                        }),
                        defineField({
                          title: 'Items',
                          name: 'items',
                          type: 'array',
                          of: [
                            defineArrayMember({
                              type: 'object',
                              name: 'festivalScheduleItem',
                              title: 'Schedule Item',
                              fields: [
                                defineField({
                                  title: 'Time',
                                  name: 'time',
                                  type: 'string',
                                }),
                                defineField({
                                  title: 'Description',
                                  name: 'description',
                                  type: 'text',
                                }),
                                defineField(linksField({
                                  title: 'Links',
                                  name: 'links',
                                })),
                              ],
                              preview: {
                                select: {title: 'description', subtitle: 'time'},
                                prepare: ({title, subtitle}) => ({
                                  title: title || 'Schedule Item',
                                  subtitle,
                                }),
                              },
                            }),
                          ],
                        }),
                      ],
                      preview: {
                        select: {title: 'dateLabel'},
                        prepare: ({title}) => ({title: title || 'Day'}),
                      },
                    }),
                  ],
                }),
              ],
            }),
            defineField({
              title: 'Featured Artworks',
              name: 'featuredArtworks',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'festivalArtwork',
                  title: 'Artwork',
                  fields: [
                    defineField({
                      title: 'Title',
                      name: 'title',
                      type: 'string',
                      validation: (rule: Rule) => rule.required(),
                    }),
                    defineField({
                      title: 'Artist',
                      name: 'artist',
                      type: 'string',
                      validation: (rule: Rule) => rule.required(),
                    }),
                    defineField({
                      title: 'Description',
                      name: 'description',
                      type: 'text',
                    }),
                    defineField(imageField({
                      title: 'Image',
                      name: 'image',
                    })),
                    defineField({
                      title: 'Link',
                      name: 'link',
                      type: 'url',
                    }),
                  ],
                  preview: {
                    select: {title: 'title', subtitle: 'artist', media: 'image'},
                    prepare: ({title, subtitle, media}) => ({
                      title: title || 'Artwork',
                      subtitle,
                      media,
                    }),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {title: 'name', subtitle: 'dateLabel'},
            prepare: ({title, subtitle}) => ({
              title: title || 'Location',
              subtitle,
            }),
          },
        }),
      ],
    }),
    defineField({
      title: 'Partner Groups',
      name: 'partnerGroups',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'festivalPartnerGroup',
          title: 'Partner Group',
          fields: [
            defineField({
              title: 'Title',
              name: 'title',
              type: 'string',
              validation: (rule: Rule) => rule.required(),
            }),
            defineField({
              title: 'Names',
              name: 'names',
              type: 'array',
              of: [{type: 'string'}],
            }),
          ],
          preview: {
            select: {title: 'title'},
          },
        }),
      ],
    }),
    defineField({
      title: 'Videos',
      name: 'videos',
      type: 'array',
      description:
        'Video section stub. Full playback is handled by the videos ticket.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'festivalVideo',
          title: 'Video',
          fields: [
            defineField({
              title: 'Title',
              name: 'title',
              type: 'string',
              validation: (rule: Rule) => rule.required(),
            }),
            defineField({
              title: 'Artist',
              name: 'artist',
              type: 'string',
            }),
            defineField(imageField({
              title: 'Thumbnail',
              name: 'thumbnail',
            }, false)),
            defineField({
              title: 'URL',
              name: 'url',
              type: 'url',
            }),
          ],
          preview: {
            select: {title: 'title', subtitle: 'artist', media: 'thumbnail'},
            prepare: ({title, subtitle, media}) => ({
              title: title || 'Video',
              subtitle,
              media,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'year', media: 'heroImage'},
    prepare: ({title, subtitle, media}) => ({
      title: title || 'Untitled Festival',
      subtitle: subtitle ? String(subtitle) : '',
      media,
    }),
  },
})
