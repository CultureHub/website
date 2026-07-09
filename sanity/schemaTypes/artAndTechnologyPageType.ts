import {defineField, defineType} from 'sanity'

export const artAndTechnologyPageType = defineType({
  name: 'artAndTechnologyPage',
  title: 'Art & Technology Page',
  type: 'document',
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      initialValue: 'Art & Technology',
    }),
    defineField({
      name: 'introText',
      title: 'Intro Text',
      type: 'text',
      rows: 3,
      initialValue:
        'Artists at CultureHub explore the convergence of art and technology. Through residencies, an annual festival, and our digital storytelling lab, we present work that crosses genres, cultures, and media.',
    }),
    defineField({
      name: 'featuredPrograms',
      title: 'Featured Programs',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'program'}]}],
      description:
        'Programs displayed in the carousel. Leave empty to show all.',
    }),
  ],
})
