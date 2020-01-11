const fs = require('fs')
const path = require('path')
const court = require('../src')

test('default => toString()', () => {
  const svg = court().toString()
  expect(svg).toBe(fs.readFileSync(path.resolve(__dirname, 'default.svg')).toString())
})

test('options.width => toString()', () => {
  const svg = court({
    width: 200
  }).toString()
  expect(svg).toBe(fs.readFileSync(path.resolve(__dirname, 'width.svg')).toString())
})

test('options.type => toString()', () => {
  const svg = court({
    type: 'fiba'
  }).toString()
  expect(svg).toBe(fs.readFileSync(path.resolve(__dirname, 'type.svg')).toString())
})

test('options.theme => toString()', () => {
  const svg = court({
    theme: 'beach'
  }).toString()
  expect(svg).toBe(fs.readFileSync(path.resolve(__dirname, 'theme.svg')).toString())
})

test('options.custom theme => toString()', () => {
  const svg = court({
    theme: {
      global: {
        fill: 'yellow',
        stroke: '#000'
      },
      innerLane: false,
      rim: {
        fill: 'red',
        stroke: '#fff'
      }
    }
  }).toString()
  expect(svg).toBe(fs.readFileSync(path.resolve(__dirname, 'custom-theme.svg')).toString())
})

test('options.ftCircleDashCount => toString()', () => {
  const svg = court({
    ftCircleDashCount: 10
  }).toString()
  expect(svg).toBe(fs.readFileSync(path.resolve(__dirname, 'dash.svg')).toString())
})

test('options.horizontal => toString()', () => {
  const svg = court({
    horizontal: true
  }).toString()
  expect(svg).toBe(fs.readFileSync(path.resolve(__dirname, 'horizontal.svg')).toString())
})

test('options.halfCourt => toString()', () => {
  const svg = court({
    halfCourt: true
  }).toString()
  expect(svg).toBe(fs.readFileSync(path.resolve(__dirname, 'half-court.svg')).toString())
})

test('options.reverse => toString()', () => {
  const svg = court({
    reverse: true
  }).toString()
  expect(svg).toBe(fs.readFileSync(path.resolve(__dirname, 'reverse.svg')).toString())
})

test('options.trapezoid => toString()', () => {
  const svg = court({
    trapezoid: true
  }).toString()
  expect(svg).toBe(fs.readFileSync(path.resolve(__dirname, 'trapezoid.svg')).toString())
})

test('options.data => toString()', () => {
  const svg = court({
    data: {
      global: {
        fill: 'yellow'
      },
      innerLane: false,
      rim: {
        fill: 'red',
        stroke: '#fff'
      }
    }
  }).toString()
  expect(svg).toBe(fs.readFileSync(path.resolve(__dirname, 'data.svg')).toString())
})

test('options.data mixin theme => toString()', () => {
  const svg = court({
    theme: 'beach',
    data: {
      global: {
        fill: 'red'
      },
      restrainCircle: true,
      lane: {
        fill: '#54A2C2'
      },
      innerLane: {
        fill: '#54A2C2'
      },
      restricted: {
        fill: 'none'
      }
    }
  }).toString()
  expect(svg).toBe(fs.readFileSync(path.resolve(__dirname, 'data-mixin-theme.svg')).toString())
})
