import { join } from 'path'
import promisify from '../../lib/promisify'
import fs from 'fs'
import { IS_BUNDLED_PAGE } from '../../utils'

const unlink = promisify(fs.unlink)

export default class UnlinkFilePlugin {
  constructor () {
    this.prevAssets = {}
  }

  apply (compiler) {
      compiler.hooks.afterEmit.tapAsync("UnlinkFilePlugin",(compilation, callback) => {
      const removed = Object.keys(this.prevAssets)
        .filter((a) => IS_BUNDLED_PAGE.test(a) && !compilation.assets[a])

      this.prevAssets = compilation.assets

      Promise.all(removed.map(async (f) => {
        const path = join(compiler.outputPath, f)
        try {
          await unlink(path)
        } catch (err) {
          if (err.code === 'ENOENT') return
          throw err
        }
      }))
        .then(() => callback(), callback)
    })
  }
}
