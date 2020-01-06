import { terser } from 'rollup-plugin-terser'
import filesize from 'rollup-plugin-filesize'

export default [{
  input: 'src/index.js',
  plugins: [filesize()],
  output: {
    file: 'dist/basketball-court.js',
    format: 'umd',
    name: 'Court'
  }
}, {
  input: 'src/index.js',
  plugins: [terser(), filesize()],
  output: {
    file: 'dist/basketball-court.min.js',
    format: 'umd',
    name: 'Court'
  }
}]