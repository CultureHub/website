import { getCliClient } from "sanity/cli"

const client = getCliClient()

async function renameCreditFields() {
  const projectDocs = await client.fetch(
    `*[_type == "project" && defined(credits.locations) && credits.locations[].organizations != null]`
  )

  console.log(`Found ${projectDocs.length} projects with credit data to migrate`)

  for (const doc of projectDocs) {
    const locations = (doc.credits?.locations || []).map((loc: any) => {
      const groups = (loc.organizations || []).map((org: any) => ({
        _key: org._key,
        name: org.name,
        description: org.description,
        items: (org.teams || []).map((team: any) => ({
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

    const patches: any[] = [
      client.patch(doc._id).set({ "credits.locations": locations }),
    ]
    await client.transaction(patches).commit()
    console.log(`Migrated: ${doc.title || doc._id}`)
  }

  console.log(`Migration complete. ${projectDocs.length} documents updated.`)
}

renameCreditFields().catch(console.error)
