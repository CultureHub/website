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
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null })
        } catch {
          resolve({ status: res.statusCode, body: data })
        }
      })
    })
    req.on("error", reject)
    if (options.body) req.write(options.body)
    req.end()
  })
}

async function run() {
  const query = `*[_type == "project" && defined(credits.locations)]{_id, title, credits}`
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
  console.log(`Processing ${docs.length} projects...`)

  for (const doc of docs) {
    const locations = doc.credits.locations.map((loc) => {
      // If old orgs exist, migrate them. Otherwise use existing groups.
      const orgs = loc.organizations || loc.groups || []

      const groups = orgs.map((org) => ({
        _key: org._key,
        _type: "creditGroup",
        name: org.name,
        description: org.description,
        items: (org.teams || org.items || []).map((t) => ({
          _key: t._key,
          _type: "creditItem",
          role: t.role,
          people: t.people,
        })),
      }))

      return {
        _key: loc._key,
        _type: "creditLocation",
        name: loc.name,
        description: loc.description,
        groups,
      }
    })

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
      console.log(`  \u2713 ${doc.title}`)
    } else {
      console.error(`  \u2717 ${doc.title}:`, JSON.stringify(patchResult.body))
    }
  }

  console.log("\u2713 Done")
}

run().catch(console.error)
