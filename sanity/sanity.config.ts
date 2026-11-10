import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'website',

  projectId: '2r5hg86f',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  document: {
    actions: (previous, context) =>
      context.schemaType === 'readPage'
        ? previous.filter((action) => action.action !== 'duplicate')
        : previous,
  },

  schema: {
    types: schemaTypes,
    templates: (previous) => previous.filter((template) => template.schemaType !== 'readPage'),
  },
})
