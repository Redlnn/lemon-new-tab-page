import fg from 'fast-glob'
import path from 'path'

export default [
  ...(fg.globSync(['dayjs/plugin/*.js'], {
    cwd: path.resolve('node_modules'),
    onlyFiles: true
  }))
]
