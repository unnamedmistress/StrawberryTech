import fs from 'fs'
import path from 'path'
import COURSES from '../nextjs-app/src/data/courses'

const SITE_URL = process.env.SITE_URL || 'https://example.com'
const pagesDir = path.join(__dirname, '../nextjs-app/src/pages')
const publicDir = path.join(__dirname, '../nextjs-app/public')

function collectRoutes(dir: string, prefix = ''): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  let routes: string[] = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      routes = routes.concat(collectRoutes(path.join(dir, entry.name), `${prefix}/${entry.name}`))
    } else if (entry.isFile()) {
      if (!/\.(tsx|ts|js|jsx)$/.test(entry.name)) continue
      const name = entry.name.replace(/\.(tsx|ts|js|jsx)$/, '')
      if (name.startsWith('_') || ['404', '500'].includes(name)) continue

      const route = name === 'index' ? (prefix || '/') : `${prefix}/${name}`
      routes.push(route)
    }
  }

  return routes
}

const staticRoutes = collectRoutes(pagesDir)
const dynamicRoutes = COURSES.map(c => c.path)
const routes = Array.from(new Set([...staticRoutes, ...dynamicRoutes]))

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(r => `  <url><loc>${SITE_URL}${r}</loc></url>`).join('\n')}\n</urlset>\n`

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true })
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml)
console.log(`Generated sitemap with ${routes.length} entries`) 

