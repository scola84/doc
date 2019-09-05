const { plugins } = require('@scola/worker/rollup')

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
    file: 'dist/doc.cjs.js',
    format: 'cjs',
    globals
  },
  plugins
}]
