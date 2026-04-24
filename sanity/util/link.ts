import { Rule } from 'sanity'

export function linkField() {
  return {
    type: 'object',
    title: 'Link',
    fields: [
      {
        name: 'label',
        type: 'string',
        title: 'Label',
        validation: (rule: Rule) => rule.required(),
      },
      {
        name: 'url',
        type: 'url',
        title: 'URL',
        validation: (rule: Rule) => rule.required(),
      }
    ],
  }
}

export function linksField(props: { title: string, name: string }) {
  return {
    type: 'array',
    of: [
      linkField(),
    ],
    ...props,
  };
}
