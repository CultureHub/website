import {defineField, defineType} from 'sanity'

export const projectType = defineType({
  name: 'project',
  title: 'Project',
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
      title: 'Date',
      name: 'date',
      type: 'date',
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'End Date',
      name: 'endDate',
      type: 'date',
      // TODO clarify if this should be more flexible
      description: 'Add this date if the project took place over multiple days',
    }),
    defineField({
      title: 'Hero Image',
      name: 'heroImage',
      type: 'image',
      validation: (rule) => rule.required(),
    }),
    defineField({
      title: 'Description',
      name: 'description',
      type: 'array',
      of: [{type: 'block'}],
    }),
    defineField({
      title: 'Locations',
      name: 'locations',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      title: 'Press Links',
      name: 'pressLinks',
      type: 'array',
      of: [
        {
          type: 'object',
          title: 'Link',
          fields: [
            {
              name: 'label',
              type: 'string',
              title: 'Label',
            },
            {
              name: 'url',
              type: 'url',
              title: 'URL',
            }
          ],
        }
      ],
    }),
  ],
})
