const fs = require('fs')
const path = require('path')
const vm = require('vm')

const localeMeta = {
  en: {
    plural: 'nplurals=2; plural=(n != 1);',
    language: 'English',
  },
  it: {
    plural: 'nplurals=2; plural=(n != 1);',
    language: 'Italian',
  },
}

function loadMessages(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8')
  const transformed = raw
    .replace(/export const messages =/, 'module.exports =')
    .replace(/export default messages;?/g, '')
  const script = new vm.Script(transformed, { filename: filePath })
  const sandbox = { module: { exports: {} }, exports: {} }
  script.runInNewContext(sandbox)
  const messages = sandbox.module.exports
  if (!messages || typeof messages !== 'object') {
    throw new Error(`Unable to load messages from ${filePath}`)
  }
  return messages
}

function escapePoString(input) {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
}

function createPoContent(locale, messages) {
  const meta = localeMeta[locale]
  const headerLines = [
    'msgid ""',
    'msgstr ""',
    `"Language: ${locale}\\n"`,
    `"Plural-Forms: ${meta.plural}\\n"`,
  ]

  const entries = Object.entries(messages)
    .map(([id, translation]) => {
      const msgid = escapePoString(String(id))
      const msgstr = escapePoString(String(translation))
      return `\nmsgid "${msgid}"\nmsgstr "${msgstr}"\n`
    })
    .join('\n')

  return headerLines.join('\n') + '\n' + entries
}

function main() {
  const localesDir = path.resolve(process.cwd(), 'locales')
  const locales = fs.readdirSync(localesDir).filter((name) => !name.startsWith('.'))

  for (const locale of locales) {
    const tsFile = path.join(localesDir, locale, 'messages.ts')
    if (!fs.existsSync(tsFile)) continue

    const messages = loadMessages(tsFile)
    const poContent = createPoContent(locale, messages)
    const poFile = path.join(localesDir, locale, 'messages.po')
    fs.writeFileSync(poFile, poContent, 'utf8')
    console.log(`Written ${poFile}`)
  }
}

main()
