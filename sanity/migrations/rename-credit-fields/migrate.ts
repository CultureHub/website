import { getCliClient } from "sanity/cli"

const client = getCliClient()

async function run() {
  const docs = await client.fetch(
    `*[_type == "project" && credits.locations[].organizations != null]{_id, title, credits}`
  )
  console.log(`Found ${docs.length} projects to migrate`)

  for (const doc of docs) {
    const locations = doc.credits.locations.map((loc: any) => ({
      _key: loc._key,
      name: loc.name,
      description: loc.description,
      groups: (loc.organizations || []).map((org: any) => ({
        _key: org._key,
        name: org.name,
        description: org.description,
        items: (org.teams || []).map((t: any) => ({
          role: t.role,
          people: t.people,
        })),
      })),
    }))

    await client.patch(doc._id).set({ "credits.locations": locations }).commit()
    console.log(`Migrated: ${doc.title}`)
  }
  console.log("Done")
}

run().catch(console.error)
