import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf-8')
}

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap(
    (entry) => {
      const relativePath = path.join(directory, entry.name)
      if (entry.isDirectory()) return sourceFiles(relativePath)
      if (/\.(test|spec)\.(ts|tsx)$/.test(entry.name)) return []
      if (/\.(ts|tsx|css)$/.test(entry.name)) return [relativePath]
      return []
    },
  )
}

describe('client bundle safety', () => {
  it('does not import server gateway modules into client utilities or screens', () => {
    const files = [
      'src/lib/feature-gates.ts',
      'src/screens/dashboard/dashboard-screen.tsx',
      'src/screens/settings/providers-screen.tsx',
      'src/screens/chat/components/chat-composer.tsx',
    ]

    for (const file of files) {
      const source = read(file)
      expect(source, file).not.toContain('server/gateway-capabilities')
      expect(source, file).not.toContain('@/server/gateway-capabilities')
      expect(source, file).not.toContain('@/server/hermes-api')
    }
  })

  it('uses same-origin API routes from browser code instead of direct Hermes API URLs', () => {
    const files = [
      'src/screens/settings/providers-screen.tsx',
      'src/screens/chat/components/chat-composer.tsx',
      'src/routes/settings/index.tsx',
    ]

    for (const file of files) {
      const source = read(file)
      expect(source, file).not.toContain('process.env.HERMES_API_URL')
      expect(source, file).not.toContain('HERMES_API_URL')
      expect(source, file).not.toContain('fetch(`${HERMES_API')
    }
  })

  it('only mounts the terminal workspace on the terminal route', () => {
    const source = read('src/components/workspace-shell.tsx')
    expect(source).toContain('{isOnTerminalRoute && (')
    expect(source).toContain('<TerminalWorkspace')
    expect(source).toContain('<MobileTerminalInput />')
  })

  it('does not render the connection startup overlay differently during hydration', () => {
    const source = read('src/components/workspace-shell.tsx')
    expect(source).not.toContain('!isClient || connectionVerified')
  })

  it('mounts Hermes onboarding only once at the root', () => {
    expect(read('src/routes/__root.tsx')).toContain('<HermesOnboarding />')
    expect(read('src/components/workspace-shell.tsx')).not.toContain(
      'HermesOnboarding',
    )
  })

  it('does not depend on external CDNs for client assets', () => {
    for (const file of sourceFiles('src')) {
      const source = read(file)
      expect(source, file).not.toContain('cdn.jsdelivr')
      expect(source, file).not.toContain('fonts.googleapis')
      expect(source, file).not.toContain('fonts.gstatic')
    }
  })
})
