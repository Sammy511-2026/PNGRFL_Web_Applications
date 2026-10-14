import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = path.join(root, 'public', 'downloads')
const outputPath = path.join(outputDirectory, 'PNG-RFL-Project-Handbook.pdf')
const documents = [
    ['PROJECT README', 'README.md'],
    ['DOCUMENTATION INDEX', 'docs/README.md'],
    ['PROJECT AND CODE GUIDE', 'docs/PROJECT_GUIDE.md'],
    ['PROJECT CODE WALKTHROUGH', 'docs/PROJECT_CODE_WALKTHROUGH.md'],
    ['DESIGN AND LAYOUTS', 'docs/DESIGN_AND_LAYOUTS.md'],
    ['USER MANUAL', 'docs/USER_MANUAL.md'],
    ['API CONTRACT', 'docs/API.md'],
    ['DATABASE SCHEMA GUIDE', 'docs/DATABASE_SCHEMA.md'],
    ['BACKEND INTEGRATION GUIDE', 'docs/BACKEND_INTEGRATION.md'],
    ['POSTGRESQL STARTER SCHEMA', 'docs/database/schema.sql'],
]

function toPdfText(value) {
    return value
        .replace(/\r\n/g, '\n')
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[–—]/g, '-')
        .replace(/…/g, '...')
        .replace(/→/g, '->')
        .replace(/←/g, '<-')
        .replace(/•/g, '*')
        .replace(/×/g, 'x')
        .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '?')
}

function formatMarkdown(source) {
    return toPdfText(source)
        .split('\n')
        .map(line => {
            const heading = line.match(/^(#{1,6})\s+(.*)$/)
            if (heading) return `${'='.repeat(Math.min(heading[1].length, 3))} ${heading[2].toUpperCase()}`
            if (/^\s*```/.test(line)) {
                const language = line.trim().slice(3).toUpperCase()
                return `    ${language ? `[${language} CODE]` : '[END CODE]'}`
            }
            return line.replace(/`([^`]+)`/g, '$1')
        })
        .join('\n')
}

async function loadHandbook() {
    const sections = [
        [
            'PNG RUGBY FOOTBALL LEAGUE',
            'PROJECT DOCUMENTATION AND EXPLAINED CODE HANDBOOK',
            '',
            'This handbook combines the project guides, explained code walkthrough, and complete PostgreSQL starter schema.',
            'It documents representative source blocks; it is not a verbatim printout of all application code.',
            'Binary assets, installed dependencies, generated build output, and lockfile contents are excluded.',
            'The application repository is a frontend project and does not contain a live backend database.',
            '',
        ].join('\n'),
    ]
    for (const [title, relativePath] of documents) {
        const source = await readFile(path.join(root, relativePath), 'utf8')
        sections.push(
            `\n\n${'='.repeat(72)}\n${title}\nSource: ${relativePath}\n${'='.repeat(72)}\n\n${formatMarkdown(source)}`,
        )
    }
    return toPdfText(sections.join('\n'))
}

function wrapLine(line, width) {
    if (!line) return ['']
    const wrapped = []
    let remainder = line
    while (remainder.length > width) {
        let boundary = remainder.lastIndexOf(' ', width)
        if (boundary < Math.floor(width * 0.55)) boundary = width
        wrapped.push(remainder.slice(0, boundary))
        remainder = `    ${remainder.slice(boundary).trimStart()}`
    }
    wrapped.push(remainder)
    return wrapped
}

function hexString(value) {
    return Buffer.from(value, 'ascii').toString('hex').toUpperCase()
}

function createPdf(text) {
    const printableLines = text.split('\n').flatMap(line => wrapLine(line, 112))
    const pageSize = 66
    const pages = []
    for (let offset = 0; offset < printableLines.length; offset += pageSize) {
        pages.push(printableLines.slice(offset, offset + pageSize))
    }

    const objects = [
        '<< /Type /Catalog /Pages 2 0 R >>',
        `<< /Type /Pages /Kids [${pages.map((_, index) => `${4 + index * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`,
        '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>',
    ]

    pages.forEach((lines, index) => {
        const pageObjectId = 4 + index * 2
        const contentObjectId = pageObjectId + 1
        const drawingCommands = [
            'BT',
            '/F1 7.5 Tf',
            '36 754 Td',
            '9.8 TL',
            ...lines.map((line, lineIndex) => `${lineIndex ? 'T* ' : ''}<${hexString(line)}> Tj`),
            'ET',
            'BT',
            '/F1 7 Tf',
            '36 27 Td',
            `<${hexString(`PNG RFL Project Handbook | Page ${index + 1} of ${pages.length}`)}> Tj`,
            'ET',
        ].join('\n')

        objects.push(
            `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
        )
        objects.push(
            `<< /Length ${Buffer.byteLength(drawingCommands, 'ascii')} >>\nstream\n${drawingCommands}\nendstream`,
        )
    })

    let pdf = '%PDF-1.4\n'
    const offsets = [0]
    objects.forEach((object, index) => {
        offsets.push(Buffer.byteLength(pdf, 'ascii'))
        pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
    })

    const crossReferenceOffset = Buffer.byteLength(pdf, 'ascii')
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
    for (let id = 1; id < offsets.length; id += 1) {
        pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
    }
    pdf += [
        'trailer',
        `<< /Size ${objects.length + 1} /Root 1 0 R /Info << /Title <${hexString('PNG RFL Project Documentation and Code Handbook')}> /Creator <${hexString('PNG RFL documentation export')}> >> >>`,
        'startxref',
        String(crossReferenceOffset),
        '%%EOF',
        '',
    ].join('\n')
    return { data: Buffer.from(pdf, 'ascii'), pageCount: pages.length }
}

const handbook = await loadHandbook()
const { data, pageCount } = createPdf(handbook)
await mkdir(outputDirectory, { recursive: true })
await writeFile(outputPath, data)
console.log(`Generated ${path.relative(root, outputPath)} (${pageCount} pages, ${data.length} bytes).`)
