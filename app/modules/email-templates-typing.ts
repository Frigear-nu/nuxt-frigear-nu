import { promises as fs } from 'node:fs'
import { parse } from '@vue/compiler-sfc'
import { createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: { name: 'email-templates' },
  async setup(_, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const emailDir = resolve(nuxt.options.srcDir, 'emails')
    const files = (await fs.readdir(emailDir)).filter(f => f.endsWith('.vue'))

    const entries: Record<string, string> = {}

    for (const file of files) {
      const path = resolve(emailDir, file)
      const content = await fs.readFile(path, 'utf-8')
      const { descriptor } = parse(content)

      if (!descriptor.scriptSetup) continue

      const script = descriptor.scriptSetup.content

      // Match defineProps with inline type or named type
      const match = script.match(/defineProps<([\s\S]*?)>\(\)/)
      if (match) {
        // @ts-expect-error not typed.
        entries[file.replace(/\.vue$/, '')] = match[1].trim()
      }
    }

    // Generate TS
    const output = `
export type EmailTemplateName = ${Object.keys(entries).map(n => `'${n}'`).join(' | ')};

export interface EmailTemplateProps {
${Object.entries(entries).map(([name, props]) => `  ${name}: ${props};`).join('\n')}
}
`

    const outPath = resolve(nuxt.options.buildDir, 'types/email-templates.generated.ts')
    await fs.mkdir(resolve(nuxt.options.buildDir, 'types'), { recursive: true })
    await fs.writeFile(outPath, output)

    nuxt.options.typescript.hoist.push(outPath)
  },
})
