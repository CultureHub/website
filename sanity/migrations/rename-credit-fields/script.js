const { createClient } = require("@sanity/client")

const client = createClient({
  projectId: "2r5hg86f",
  dataset: "production",
  apiVersion: "2025-01-01",
  token: process.env.SANITY_STUDIO_MIGRATE_TOKEN,
  useCdn: false,
})

async function renameCreditFields() {
  const projectDocs = await client.fetch(
    `*[_type == "project" && defined(credits.locations) && credits.locations[].organizations != null]`
  )

  console.log(`Found ${projectDocs.length} projects with credit data to migrate`)

  for (const doc of projectDocs) {
    const locations = (doc.credits?.locations || []).map((loc) => {
      const groups = (loc.organizations || []).map((org) => ({
        _key: org._key,
        name: org.name,
        description: org.description,
        items: (org.teams || []).map((team) => ({
          role: team.role,
          people: team.people,
        })),
      }))

      return {
        _key: loc._key,
        name: loc.name,
        description: loc.description,
        groups,
      }
    })

    await client
      .patch(doc._id)
      .set({ "credits.locations": locations })
      .commit()
    console.log(`Migrated: ${doc.title || doc._id}`)
  }

  console.log(`Migration complete. ${projectDocs.length} documents updated.`)
}

renameCreditFields().catch(console.error)
