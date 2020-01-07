import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'

export default [{
  input: 'src/index.js',
  plugins: [
    commonjs(),
    json(),
    filesize()
  ],
  output: {
    file: 'dist/basketball-court.js',
    format: 'umd',
    name: 'court'
  }
}, {
  input: 'src/index.js',
  plugins: [
    commonjs(),
    json(),
    terser(),
    filesize()
  ],
  output: {
    file: 'dist/basketball-court.min.js',
    format: 'umd',
    name: 'court'
  }
}]