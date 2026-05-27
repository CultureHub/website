import { Rule } from 'sanity'

export function programField(props: { title: string, name: string }) {
  return {
    type: 'string',
    validation: (rule: Rule) => rule.required(),
    options: {
      list: [
        { title: 'Re-Fest', value: 'Re-Fest' },
        { title: 'Residency', value: 'Residency' },
        { title: 'Experiments in Digital Storytelling', value: 'Experiments in Digital Storytelling' },
      ],
    },
    ...props,
  }
}
