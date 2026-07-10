#!/usr/bin/env node
const https = require("https")

const projectId = "2r5hg86f"
const dataset = "production"
const apiVersion = "2025-01-01"
const token = process.env.SANITY_STUDIO_MIGRATE_TOKEN

if (!token) {
  console.error("Set SANITY_STUDIO_MIGRATE_TOKEN")
  process.exit(1)
}

function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(data) }))
    })
    req.on("error", reject)
    if (options.body) req.write(options.body)
    req.end()
  })
}

async function run() {
  const query = `*[_type == "project" && credits.locations[].organizations != null]{_id, title, credits}`
  const queryUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(query)}`

  const result = await fetch(queryUrl, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!result.body?.result) {
    console.error("Query failed:", JSON.stringify(result.body, null, 2))
    process.exit(1)
  }

  const docs = result.body.result
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

    const mutateUrl = `https://${projectId}.api.sanity.io/v${apiVersion}/data/mutate/${dataset}`
    const mutation = {
      mutations: [
        {
          patch: {
            id: doc._id,
            set: { "credits.locations": locations },
          },
        },
      ],
    }

    const patchResult = await fetch(mutateUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mutation),
    })

    if (patchResult.status === 200) {
      console.log(`  ✓ ${doc.title}`)
    } else {
      console.error(`  ✗ ${doc.title}:`, JSON.stringify(patchResult.body))
    }
  }

  console.log("✓ Done")
}

run().catch(console.error)
