import { Rule } from 'sanity'

export function imageField(props: { title: string, name: string }) {
  return {
    type: 'image',
    validation: (rule: Rule) => rule.required(),
    fields: [
      {
        name: 'alt',
        type: 'string',
        title: 'Alt text',
        description: 'Important for SEO and accessibility.',
        validation: (rule: Rule) => rule.error('You must provide alt text for the image.').required(),
      },
      {
        name: 'credits',
        type: 'string',
        title: 'Credits text',
      }
    ],
    ...props,
  }
}

