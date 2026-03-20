import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: '2r5hg86f',
    dataset: 'production'
  },
  deployment: {
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/cli#auto-updates
     */
    autoUpdates: true,
    appId: 'oz6flu1u55v1sq2vo3bg5jz9'
  },
  typegen: {
    path: '../client/src/**/*.{ts,tsx,js,jsx}',
    schema: 'schema.json',
    generates: '../client/src/sanity/types.ts'
  }
})
