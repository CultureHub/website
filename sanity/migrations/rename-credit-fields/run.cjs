const { getCliClient } = require("sanity/cli")

async function run() {
  const client = getCliClient()

  const docs = await client.fetch(
    `*[_type == "project" && credits.locations[].organizations != null]{_id, title, credits}`
  )

  console.log(`Migrating ${docs.length} projects...`)

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

    await client
      .patch(doc._id)
      .set({ "credits.locations": locations })
      .commit()
    console.log(`  ✓ ${doc.title}`)
  }

  console.log("✓ Done")
}

run().catch(console.error)
