#!/usr/bin/env node
const https = require("https")
const crypto = require("crypto")

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

function generateKey() {
  return crypto.randomBytes(6).toString("hex")
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

  for (const doc of docs) {
    let changed = false
    const locations = doc.credits.locations.map((loc) => {
      let locChanged = false

      const locObj = { ...loc }
      if (!locObj._key) {
        locObj._key = generateKey()
        locChanged = true
      }

      locObj.groups = (loc.groups || []).map((group) => {
        let groupChanged = false
        const g = { ...group }
        if (!g._key) {
          g._key = generateKey()
          groupChanged = true
        }

        g.items = (g.items || []).map((item) => {
          const i = { ...item }
          if (!i._key) {
            i._key = generateKey()
            groupChanged = true
          }
          return i
        })

        if (groupChanged) locChanged = true
        return g
      })

      if (locChanged) changed = true
      return locObj
    })

    if (!changed) {
      console.log(`  - ${doc.title} (no changes needed)`)
      continue
    }

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
