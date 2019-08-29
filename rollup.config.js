import {
  banner,
  plugins
} from '@scola/cli/rollup'

import {
  name,
  version
} from './package.json'

const external = [
  '@scola/worker',
  'messagebird',
  'mysql',
  'nodemailer',
  'pg',
  'pg-query-stream',
  'sqlstring'
]

const globals = {
  '@scola/worker': 'scola.worker',
  messagebird: 'messagebird',
  mysql: 'mysql',
  nodemailer: 'nodemailer',
  pg: 'pg',
  'pg-query-stream': 'pgQueryStream',
  sqlstring: 'sqlstring'
}

const input = './index.js'

export default [{
  input,
  external,
  output: {
    banner: banner(name, version),
    extend: true,
    file: 'dist/doc.umd.js',
    format: 'umd',
    globals,
    name: 'scola.doc'
  },
  plugins
}, {
  input,
  external,
  output: {
    banner: banner(name, version),
    file: 'dist/doc.cjs.js',
    format: 'cjs',
    globals
  },
  plugins
}]
