import fs from 'node:fs'

const src = fs.readFileSync('src/migrations/20260928_094827.ts', 'utf8')

const upStart = src.indexOf('export async function up')
const downStart = src.indexOf('export async function down')
const upBlock = src.slice(upStart, downStart)

const BACKTICK = String.fromCharCode(96)
const re = new RegExp('sql' + BACKTICK + '([\\s\\S]*?)' + BACKTICK, 'g')

let m
const parts = []
while ((m = re.exec(upBlock)) !== null) parts.push(m[1].trim())

const sqlText = parts.join('\n\n')
fs.mkdirSync('docs/sql', { recursive: true })
fs.writeFileSync('docs/sql/01-init-schema.sql', sqlText + '\n')

console.log('sql blocks:', parts.length)
console.log('sql chars:', sqlText.length)
console.log('CREATE/ALTER statements:', (sqlText.match(/^[ \t]*(CREATE|ALTER)\s/gm) || []).length)
console.log('wrote docs/sql/01-init-schema.sql')
