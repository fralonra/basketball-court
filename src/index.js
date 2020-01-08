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

function court (opt = {}) {
  const type = supportedTypes.includes(opt.type) ? opt.type : defaultType
  const theme = mergeTheme(opt)
  const halfCourt = !!opt.halfCourt
  const trapezoid = !!opt.trapezoid
  const baseConfig = data[type]
  const config = !opt.data
    ? { ...baseConfig }
    : { ...baseConfig, ...opt.data }
  if (halfCourt) {
    config.length /= 2
  }
  const actualWidth = opt.width || defaultWidth
  const scaleRatio = actualWidth / config.width
  const actualLength = scaleRatio * config.length

  const paths = []
  const svg = new Node('svg', {
    version: 1.1,
    baseProfile: 'full',
    width: actualWidth,
    height: actualLength,
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
  if (!trapezoid) {
    genPath('innerLane', genInnerLane)
  }
  genPath('ftCircleHigh', genFtCircleHigh)
  genPath('ftCircleLow', genFtCircleLow)
  genPath('restricted', genRestrictedArea)
  genPath('backboard', genBackboard)
  genPath('rim', genRim)
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
        width: actualWidth,
        height: actualLength,
        ...resolveThemeProp('court')
      }
    }
  }

  function genHcCircle (radius, path) {
    const r = radius * scaleRatio
    const props = resolveThemeProp(path)
    if (halfCourt) {
      const x1 = actualWidth / 2 - r
      const x2 = actualWidth - x1
      const y = actualLength
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
        cx: getOrSet('centerX', () => actualWidth / 2),
        cy: getOrSet('centerY', () => actualLength / 2),
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
    const width = actualWidth
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
    const r = config.tplineDistanceFromHoop * scaleRatio
    const x1 = actualWidth / 2 - config.tplineDistanceFromHoopCorner * scaleRatio
    const x2 = actualWidth - x1
    let y1 = 0
    let y2 = config.tplineSideLength * scaleRatio
    let sweep = 0
    const path = makePath()
    if (!halfCourt) {
      y1 = actualLength
      y2 = actualLength - y2
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

  function resolveLaneParams () {
    const width = config.laneWidth * scaleRatio
    const height = getOrSet('laneActualLength', () => config.laneLength * scaleRatio)
    const x = (actualWidth - width) / 2
    return { width, height, x }
  }

  function genTrapezoidLane () {
    const { width, height, x } = resolveLaneParams()
    const shortBase = getOrSet('innerLaneActualWidth', () => config.ftCircleRadius * scaleRatio * 2)
    const x1 = getOrSet('innerLaneX', () => (actualWidth - shortBase) / 2)
    const x2 = x1 + shortBase
    const x3 = x + width
    let y1 = 0
    let y2 = height
    const path = makePath()
    if (!halfCourt) {
      y1 = actualLength
      y2 = actualLength - height
      return [path, makePath()]
    }
    return path

    function makePath () {
      return {
        tag: 'path',
        attrs: {
          d: `M${x} ${y1} L${x1} ${y2} L${x2} ${y2} L${x3} ${y1}Z`,
          ...resolveThemeProp('lane')
        }
      }
    }
  }

  function genRectLane () {
    const { width, height, x } = resolveLaneParams()
    let y = 0
    const path = makePath()
    if (!halfCourt) {
      y = actualLength - height
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

  function genLane () {
    return trapezoid ? genTrapezoidLane() : genRectLane()
  }

  function genInnerLane () {
    const width = getOrSet('innerLaneActualWidth', () => config.ftCircleRadius * scaleRatio * 2)
    const height = getOrSet('laneActualLength', () => config.laneLength * scaleRatio)
    const x = getOrSet('innerLaneX', () => (actualWidth - width) / 2)
    let y = 0
    const path = makePath()
    if (!halfCourt) {
      y = actualLength - height
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
    const r = config.ftCircleRadius * scaleRatio
    const x1 = getOrSet('innnerLaneX', () => (actualWidth - config.ftCircleRadius * scaleRatio * 2) / 2)
    const x2 = x1 + r * 2
    let y = getOrSet('laneActualLength', () => config.laneLength * scaleRatio)
    const gap = isLow ? Math.PI * r / ftCircleDashCount : 0
    const path = makePath()
    if (!halfCourt) {
      y = actualLength - y
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
    const width = config.backboardWidth * scaleRatio
    const x1 = (actualWidth - width) / 2
    const x2 = (actualWidth + width) / 2
    let y = getOrSet('backboardY', () => config.backboardDistanceFromBaseline * scaleRatio)
    const path = makePath()
    if (!halfCourt) {
      y = actualLength - y
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
    const r = config.rimRadius * scaleRatio
    const cx = actualWidth / 2
    let cy = getOrSet('rimY', () => getOrSet('backboardY', () => config.backboardDistanceFromBaseline * scaleRatio) + config.rimDistanceFromBackboard * scaleRatio + r)
    const path = makePath()
    if (!halfCourt) {
      cy = actualLength - cy
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
    const r = config.restrictedAreaRadius * scaleRatio
    const x1 = actualWidth / 2 - r
    const x2 = x1 + r * 2
    let y = getOrSet('rimY', () => (config.backboardY || config.backboardDistanceFromBaseline * scaleRatio) + config.rimDistanceFromBackboard * scaleRatio + config.rimRadius * scaleRatio)
    let sweep = 0
    const path = makePath()
    if (!halfCourt) {
      y = actualLength - y
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
