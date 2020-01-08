const Node = require('./node')
const themes = require('./themes')
const data = require('../data')

const supportedTypes = ['fiba', 'nba', 'ncaa', 'wnba']
const supportedPaths = [
  'backboard',
  'centerCircle',
  'court',
  'ftCircleHigh',
  'ftCircleLow',
  'hcline',
  'innerLane',
  'lane',
  'restrainCircle',
  'restricted',
  'rim',
  'tpline',
  'global'
]
const defaultType = 'nba'
const defaultWidth = 400
const defaultTheme = 'plain'
const ftCircleDashCount = 15

function mergeTheme (opt) {
  const theme = typeof opt.theme === 'object'
    ? opt.theme
    : (themes[opt.theme] || themes[defaultTheme])
  if (opt.data && typeof opt.data === 'object') {
    for (const path in opt.data) {
      if (supportedPaths.includes(path)) {
        theme[path] = {
          ...theme[path],
          ...opt.data[path]
        }
      }
    }
  }
  return theme
}

function resolveOpt (opt) {
  const type = supportedTypes.includes(opt.type) ? opt.type : defaultType
  const theme = mergeTheme(opt)
  const halfCourt = !!opt.halfCourt
  const baseConfig = data[type]
  const config = !opt.data
    ? { ...baseConfig }
    : { ...baseConfig, ...opt.data }
  config.actualWidth = opt.width || defaultWidth
  if (halfCourt) {
    config.length /= 2
  }
  config.scaleRatio = config.actualWidth / config.width
  config.actualLength = config.scaleRatio * config.length
  return {
    theme,
    halfCourt,
    config
  }
}

function court (opt = {}) {
  const { theme, halfCourt, config } = resolveOpt(opt)

  const paths = []
  const svg = new Node('svg', {
    version: 1.1,
    baseProfile: 'full',
    width: config.actualWidth,
    height: config.actualLength,
    ...resolveThemeProp('global', ['fill', 'stroke'])
  }, paths)

  genPath('court', genCourt)
  genPath('centerCircle', genCenterCircle)
  genPath('restrainCircle', genRestrainCircle)
  if (!halfCourt) {
    genPath('hcline', genHcline)
  }
  genPath('tpline', genTpline)
  genPath('lane', genLane)
  genPath('innerLane', genInnerLane)
  genPath('ftCircleHigh', genFtCircleHigh)
  genPath('ftCircleLow', genFtCircleLow)
  genPath('backboard', genBackboard)
  genPath('rim', genRim)
  genPath('restricted', genRestrictedArea)
  return svg

  function getOrSet (key, func) {
    if (key in config) {
      return config[key]
    }
    config[key] = func()
    return config[key]
  }

  function resolveThemeProp (path, keys = []) {
    const props = {}
    keys.forEach(key => {
      push(key)
    })
    for (const key in theme[path]) {
      if (!keys.includes(key)) {
        push(key)
      }
    }
    return props

    function push (key) {
      props[key] = theme[path] && theme[path][key]
        ? theme[path][key]
        : theme.global && theme.global[key]
          ? theme.global[key]
          : ''
    }
  }

  function genCourt () {
    return {
      tag: 'rect',
      attrs: {
        x: 0,
        y: 0,
        width: config.actualWidth,
        height: config.actualLength,
        ...resolveThemeProp('court')
      }
    }
  }

  function genHcCircle (radius, path) {
    const r = radius * config.scaleRatio
    const props = resolveThemeProp(path)
    if (halfCourt) {
      const x1 = config.actualWidth / 2 - r
      const x2 = config.actualWidth - x1
      const y = config.actualLength
      return {
        tag: 'path',
        attrs: {
          d: `M${x1} ${y} A${r} ${r} 0 0 1 ${x2} ${y}Z`,
          ...props
        }
      }
    }
    return {
      tag: 'circle',
      attrs: {
        cx: getOrSet('centerX', () => config.actualWidth / 2),
        cy: getOrSet('centerY', () => config.actualLength / 2),
        r,
        ...props
      }
    }
  }

  function genCenterCircle () {
    return genHcCircle(config.centerCircleRadius, 'centerCircle')
  }

  function genRestrainCircle () {
    return genHcCircle(config.restrainCircleRadius, 'restrainCircle')
  }

  function genHcline () {
    const width = config.actualWidth
    const x1 = 0
    const x2 = width
    const y = config.centerY
    return {
      tag: 'line',
      attrs: {
        x1,
        y1: y,
        x2,
        y2: y,
        ...resolveThemeProp('hcline')
      }
    }
  }

  function genTpline () {
    const r = config.tplineDistanceFromHoop * config.scaleRatio
    const x1 = config.actualWidth / 2 - config.tplineDistanceFromHoopCorner * config.scaleRatio
    const x2 = config.actualWidth - x1
    let y1 = 0
    let y2 = config.tplineSideLength * config.scaleRatio
    let sweep = 0
    const path = makePath()
    if (!halfCourt) {
      y1 = config.actualLength
      y2 = config.actualLength - y2
      sweep = 1
      return [path, makePath()]
    }
    return path

    function makePath () {
      return {
        tag: 'path',
        attrs: {
          d: `M${x1} ${y1} L${x1} ${y2} A${r} ${r} 0 0 ${sweep} ${x2} ${y2} L${x2} ${y1}Z`,
          ...resolveThemeProp('tpline')
        }
      }
    }
  }

  function genLane () {
    const width = config.laneWidth * config.scaleRatio
    const height = getOrSet('laneActualLength', () => config.laneLength * config.scaleRatio)
    const x = (config.actualWidth - width) / 2
    let y = 0
    const path = makePath()
    if (!halfCourt) {
      y = config.actualLength - height
      return [path, makePath()]
    }
    return path

    function makePath () {
      return {
        tag: 'rect',
        attrs: {
          x,
          y,
          width,
          height,
          ...resolveThemeProp('lane')
        }
      }
    }
  }

  function genInnerLane () {
    const width = config.ftCircleRadius * config.scaleRatio * 2
    const height = getOrSet('laneActualLength', () => config.laneLength * config.scaleRatio)
    const x = getOrSet('innerLaneX', () => (config.actualWidth - width) / 2)
    let y = 0
    const path = makePath()
    if (!halfCourt) {
      y = config.actualLength - height
      return [path, makePath()]
    }
    return path

    function makePath () {
      return {
        tag: 'rect',
        attrs: {
          x,
          y,
          width,
          height,
          ...resolveThemeProp('innerLane')
        }
      }
    }
  }

  function genFtCircleArch (key) {
    const isLow = key === 'low'
    const r = config.ftCircleRadius * config.scaleRatio
    const x1 = getOrSet('innnerLaneX', () => (config.actualWidth - config.ftCircleRadius * config.scaleRatio * 2) / 2)
    const x2 = x1 + r * 2
    let y = getOrSet('laneActualLength', () => config.laneLength * config.scaleRatio)
    const gap = isLow ? Math.PI * r / ftCircleDashCount : 0
    const path = makePath()
    if (!halfCourt) {
      y = config.actualLength - y
      return [path, makePath(1)]
    }
    return path

    function makePath (sweep = 0) {
      const path = {
        tag: 'path',
        attrs: {
          d: `M${x1} ${y} A${r} ${r} 0 0 ${isLow ? sweep ^ 1 : sweep} ${x2} ${y}`,
          ...resolveThemeProp('ftCircle' + key)
        }
      }
      if (isLow) {
        path.attrs['stroke-dasharray'] = gap
      }
      return path
    }
  }

  function genFtCircleHigh () {
    return genFtCircleArch('high')
  }

  function genFtCircleLow () {
    return genFtCircleArch('low')
  }

  function genBackboard () {
    const width = config.backboardWidth * config.scaleRatio
    const x1 = (config.actualWidth - width) / 2
    const x2 = (config.actualWidth + width) / 2
    let y = getOrSet('backboardY', () => config.backboardDistanceFromBaseline * config.scaleRatio)
    const path = makePath()
    if (!halfCourt) {
      y = config.actualLength - y
      return [path, makePath()]
    }
    return path

    function makePath () {
      return {
        tag: 'line',
        attrs: {
          x1,
          y1: y,
          x2,
          y2: y,
          ...resolveThemeProp('backboard')
        }
      }
    }
  }

  function genRim () {
    const r = config.rimRadius * config.scaleRatio
    const cx = config.actualWidth / 2
    let cy = getOrSet('rimY', () => getOrSet('backboardY', () => config.backboardDistanceFromBaseline * config.scaleRatio) + config.rimDistanceFromBackboard * config.scaleRatio + r)
    const path = makePath()
    if (!halfCourt) {
      cy = config.actualLength - cy
      return [path, makePath()]
    }
    return path

    function makePath () {
      return {
        tag: 'circle',
        attrs: {
          r,
          cx,
          cy,
          ...resolveThemeProp('rim')
        }
      }
    }
  }

  function genRestrictedArea () {
    const r = config.restrictedAreaRadius * config.scaleRatio
    const x1 = config.actualWidth / 2 - r
    const x2 = x1 + r * 2
    let y = getOrSet('rimY', () => (config.backboardY || config.backboardDistanceFromBaseline * config.scaleRatio) + config.rimDistanceFromBackboard * config.scaleRatio + config.rimRadius * config.scaleRatio)
    let sweep = 0
    const path = makePath()
    if (!halfCourt) {
      y = config.actualLength - y
      sweep = 1
      return [path, makePath()]
    }
    return path

    function makePath () {
      return {
        tag: 'path',
        attrs: {
          d: `M${x1} ${y} A${r} ${r} 0 0 ${sweep} ${x2} ${y}`,
          ...resolveThemeProp('restricted')
        }
      }
    }
  }

  function genPath (key, func) {
    if (theme[key] === false) return
    const node = func()
    if (Array.isArray(node)) {
      node.forEach(n => {
        paths.push(genNode(n))
      })
    } else {
      paths.push(genNode(node))
    }

    function genNode (data) {
      return new Node(data.tag, data.attrs)
    }
  }
}

module.exports = court
