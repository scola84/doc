import babel from 'rollup-plugin-babel'
import builtins from 'rollup-plugin-node-builtins'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import resolve from 'rollup-plugin-node-resolve'

const external = [
  '@scola/worker',
  'fs-extra',
  'messagebird',
  'mysql',
  'nodemailer',
  'pg',
  'pg-query-stream',
  'sqlstring'
]

const globals = {
  '@scola/worker': 'scola.worker',
  'fs-extra': 'fsExtra',
  messagebird: 'messagebird',
  mysql: 'mysql',
  nodemailer: 'nodemailer',
  pg: 'pg',
  'pg-query-stream': 'pgQueryStream',
  sqlstring: 'sqlstring'
}

const input = './index.js'

const plugins = [
  resolve(),
  commonjs(),
  builtins(),
  json(),
  babel({
    plugins: [
      ['@babel/plugin-transform-runtime', {
        helpers: false
      }]
    ],
    presets: [
      ['@babel/preset-env']
    ]
  })
]

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
