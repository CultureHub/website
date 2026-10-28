import {createClient} from '@sanity/client'

const token =
  process.env.CULTUREHUB_SANITY_TOKEN ?? process.env.SANITY_API_WRITE_TOKEN

if (!token) {
  throw new Error(
    'CULTUREHUB_SANITY_TOKEN or SANITY_API_WRITE_TOKEN is required',
  )
}

export const client = createClient({
  projectId: '2r5hg86f',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token,
  useCdn: false,
})
