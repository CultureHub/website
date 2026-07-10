import { createClient } from "@sanity/client"

const projectId = "2r5hg86f"
const dataset = "production"

if (!process.env.SANITY_STUDIO_MIGRATE_TOKEN) {
  console.error("Set SANITY_STUDIO_MIGRATE_TOKEN env var")
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  token: process.env.SANITY_STUDIO_MIGRATE_TOKEN,
  useCdn: false,
})

const docs = await client.fetch(
  `*[_type == "project" && credits.locations[].organizations != null]{_id, title, credits}`
)

console.log(`Migrating ${docs.length} projects\u2026`)

for (const doc of docs) {
  const locations = doc.credits.locations.map((loc) => ({
    _key: loc._key,
    name: loc.name,
    description: loc.description,
    groups: (loc.organizations || []).map((org) => ({
      _key: org._key,
      name: org.name,
      description: org.description,
      items: (org.teams || []).map((t) => ({
        role: t.role,
        people: t.people,
      })),
    })),
  }))

  await client.patch(doc._id).set({ "credits.locations": locations }).commit()
  console.log(`  \u2713 ${doc.title}`)
}

console.log(`\u2713 Done. ${docs.length} project(s) migrated.`)
