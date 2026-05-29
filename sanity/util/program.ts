import { Rule } from 'sanity'

export function programField(props: { title: string, name: string }) {
  return {
    type: 'reference',
    to: [{ type: 'program' }],
    validation: (rule: Rule) => rule.required(),
    ...props,
  }
}
