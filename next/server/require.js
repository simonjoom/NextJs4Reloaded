import {join, posix} from 'path'
import {PAGES_MANIFEST} from '../lib/constants'

export function pageNotFoundError (page) {
  const err = new Error(`Cannot find module for page: ${page}`)
  err.code = 'ENOENT'
  return err
}

export function normalizePagePath (page) {
  // If the page is `/` we need to append `/index`, otherwise the returned directory root will be bundles instead of pages
  let pg=page;
  if (pg === '/') {
    pg = '/index'
  }

  // Resolve on anything that doesn't start with `/`
  if (pg[0] !== '/') {
    pg = `/${pg}`
  }

  // Throw when using ../ etc in the pathname
  const resolvedPage = posix.normalize(pg)
  if (pg !== resolvedPage) {
    throw new Error('Requested and resolved page mismatch')
  }

  return pg
}

export function getPagePath (page, {dir, dist}) {
  let pg=page;
  const serverBuildPath = join(dir, dist, 'dist')
  const pagesManifest = require(join(serverBuildPath, PAGES_MANIFEST))

  try {
    pg = normalizePagePath(pg)
  } catch (err) {
    throw pageNotFoundError(pg)
  }

  if (!pagesManifest[pg]) {
    throw pageNotFoundError(pg)
  }

  return join(serverBuildPath, pagesManifest[pg])
}

export default async function requirePage (page, {dir, dist}) {
  const pagePath = getPagePath(page, {dir, dist})
  return require(pagePath)
}
