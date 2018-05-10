// @flow
import fetch from 'unfetch'
const filenameRE = /\(([^)]+\.js):(\d+):(\d+)\)$/

export async function applySourcemaps (e){
  if (!e || typeof e.stack !== 'string' || e.sourceMapsApplied) {
    return
  }

  const lines = e.stack.split('\n')

  const result = await Promise.all(lines.map((line) => {
    return rewriteTraceLine(line)
  }))

  e.stack = result.join('\n')
  // This is to make sure we don't apply the sourcemaps twice on the same object
  e.sourceMapsApplied = true
}

async function rewriteTraceLine (trace) {
  const m = trace.match(filenameRE)
  if (m == null) {
    return trace
  }
  let filePath = m[1]
  if (filePath.match(/node_modules/)) {
    return trace
  }

 // filePath=filePath.replace(/\/Users\/simon\/mapskiscoolnew\/client\/.next/i,"/_next")

  const mapPath = `${filePath}.map`

  const res = await fetch(mapPath)
  if (res.status !== 200) {
    return trace
  }

  const mapContents = await res.json()
  console.log(mapContents)
  const {SourceMapConsumer} = require('source-map')
  const map = new SourceMapConsumer(mapContents)
  const originalPosition = map.originalPositionFor({
    line: Number(m[2]),
    column: Number(m[3])
  })

console.log(originalPosition);
  if (originalPosition.source != null) {


    const { source, line, column } = originalPosition
    const mappedPosition = `(${source.replace(/^webpack:\/\/\//, '').replace(/\/Users\/simon\/mapskiscoolnew\/client\/.next/i,"/_next")}:${String(line)}:${String(column)})`
    return trace.replace(filenameRE, mappedPosition)
  }

  return trace
}
