import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import babel from 'rollup-plugin-babel'
import filesize from 'rollup-plugin-filesize'
import { terser } from 'rollup-plugin-terser'

const babelOption = {
  presets: [['@babel/env', { modules: false }]]
}

export default [{
  input: 'src/index.js',
  plugins: [
    commonjs(),
    json(),
    babel(babelOption),
    filesize()
  ],
  output: {
    file: 'dist/basketball-court.js',
    format: 'umd',
    name: 'basketballCourt'
  }
}, {
  input: 'src/index.js',
  plugins: [
    commonjs(),
    json(),
    babel(babelOption),
    terser(),
    filesize()
  ],
  output: {
    file: 'dist/basketball-court.min.js',
    format: 'umd',
    name: 'basketballCourt'
  }
}]