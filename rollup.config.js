import buble from 'rollup-plugin-buble';
import builtins from 'rollup-plugin-node-builtins';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';

const external = [
  '@scola/worker',
  'fs-extra',
  'marked',
  'messagebird',
  'mysql',
  'nodemailer'
];

const globals = {
  '@scola/worker': 'scola.worker',
  'fs-extra': 'fsExtra',
  'marked': 'marked',
  'messagebird': 'messagebird',
  'mysql': 'mysql',
  'nodemailer': 'mysql'
};

const input = './index.js';

const plugins = [
  resolve(),
  commonjs(),
  builtins(),
  json(),
  buble()
];

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
}];
