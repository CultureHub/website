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
        description: 'Full label, e.g. "In Person Tickets"',
        validation: (rule: Rule) => rule.required(),
      },
      {
        name: 'shortLabel',
        type: 'string',
        title: 'Short Label',
        description: 'Short label for header use, e.g. "In Person"',
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
