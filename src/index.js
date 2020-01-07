const Node = require('./node')
const themes = require('./themes')

const supportedTypes = ['fiba', 'nba', 'ncaa', 'wnba']
const supportedPaths = [
  'court',
  'centerCircle',
  'restrainCircle',
  'hcline',
  'tpline',
  'lane',
  'innerLane',
  'ftCircle',
  'backboard',
  'rim',
  'restricted',
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
  return {
    type,
    theme
  }
}

function court (opt = {}) {
  const { type, theme } = resolveOpt(opt)
  const halfCourt = !!opt.halfCourt

  const baseConfig = require('../data/' + type + '.json')
  const config = !opt.data ? baseConfig : { ...baseConfig, ...opt.data }
  config.actualWidth = opt.width || defaultWidth
  if (halfCourt) {
    config.length /= 2
  }
  config.scaleRatio = config.actualWidth / config.width
  config.actualLength = config.scaleRatio * config.length
  config.centerX = config.actualWidth / 2
  config.centerY = config.actualLength / 2

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
  genPath('ftCircle', genFtCircle)
  genPath('backboard', genBackboard)
  genPath('rim', genRim)
  genPath('restricted', genRestrictedArea)
  return svg

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
    return new Node('rect', {
      x: 0,
      y: 0,
      width: config.actualWidth,
      height: config.actualLength,
      ...resolveThemeProp('court')
    })
  }

  function genHcCircle (radius, path) {
    const r = radius * config.scaleRatio
    const props = resolveThemeProp(path)
    if (halfCourt) {
      const x1 = config.actualWidth / 2 - r
      const x2 = config.actualWidth - x1
      const y = config.actualLength
      return new Node('path', {
        d: `M${x1} ${y} A${r} ${r} 0 0 1 ${x2} ${y}Z`,
        ...props
      })
    }
    return new Node('circle', {
      cx: config.centerX,
      cy: config.centerY,
      r,
      ...props
    })
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
    return new Node('line', {
      x1,
      y1: y,
      x2,
      y2: y,
      ...resolveThemeProp('hcline')
    })
  }

  function genTpline () {
    const r = config.tplineDistanceFromHoop * config.scaleRatio
    const x1 = config.actualWidth / 2 - config.tplineDistanceFromHoopCorner * config.scaleRatio
    const x2 = config.actualWidth - x1
    let y1 = 0
    let y2 = config.tplineSideLength * config.scaleRatio
    let sweep = 0
    const paths = [makePath()]
    if (!halfCourt) {
      y1 = config.actualLength
      y2 = config.actualLength - y2
      sweep = 1
      paths.push(makePath())
    }
    return paths

    function makePath () {
      return new Node('path', {
        d: `M${x1} ${y1} L${x1} ${y2} A${r} ${r} 0 0 ${sweep} ${x2} ${y2} L${x2} ${y1}Z`,
        ...resolveThemeProp('tpline')
      })
    }
  }

  function genLane () {
    const width = config.laneWidth * config.scaleRatio
    const height = config.laneLength * config.scaleRatio
    const x = (config.actualWidth - width) / 2
    let y = 0
    config.laneActualLength = height
    const paths = [makePath()]
    if (!halfCourt) {
      y = config.actualLength - height
      paths.push(makePath())
    }
    return paths

    function makePath () {
      return new Node('rect', {
        x,
        y,
        width,
        height,
        ...resolveThemeProp('lane')
      })
    }
  }

  function genInnerLane () {
    const width = config.ftCircleRadius * config.scaleRatio * 2
    const height = config.laneActualLength || config.laneLength * config.scaleRatio
    const x = (config.actualWidth - width) / 2
    let y = 0
    config.innnerLaneX = x
    const paths = [makePath()]
    if (!halfCourt) {
      y = config.actualLength - height
      paths.push(makePath())
    }
    return paths

    function makePath () {
      return new Node('rect', {
        x,
        y,
        width,
        height,
        ...resolveThemeProp('innerLane')
      })
    }
  }

  function genFtCircle () {
    const r = config.ftCircleRadius * config.scaleRatio
    const x1 = config.innnerLaneX || (config.actualWidth - config.ftCircleRadius * config.scaleRatio * 2) / 2
    const x2 = x1 + r * 2
    let y = config.laneActualLength || config.laneLength * config.scaleRatio
    const gap = Math.PI * r / ftCircleDashCount
    const props = resolveThemeProp('ftCircle')
    const paths = []
    makePath()
    if (!halfCourt) {
      y = config.actualLength - y
      makePath(false)
    }
    return paths

    function makePath (top = true) {
      const upper = new Node('path', {
        d: `M${x1} ${y} A${r} ${r} 0 0 0 ${x2} ${y}`,
        ...props
      })
      const lower = new Node('path', {
        d: `M${x1} ${y} A${r} ${r} 0 0 1 ${x2} ${y}`,
        ...props
      })
      if (top) {
        lower.setAttr('stroke-dasharray', gap)
      } else {
        upper.setAttr('stroke-dasharray', gap)
      }
      paths.push(upper, lower)
    }
  }

  function genBackboard () {
    const width = config.backboardWidth * config.scaleRatio
    const x1 = (config.actualWidth - width) / 2
    const x2 = (config.actualWidth + width) / 2
    let y = config.backboardDistanceFromBaseline * config.scaleRatio
    config.backboardY = y
    const paths = [makePath()]
    if (!halfCourt) {
      y = config.actualLength - y
      paths.push(makePath())
    }
    return paths

    function makePath () {
      return new Node('line', {
        x1,
        y1: y,
        x2,
        y2: y,
        ...resolveThemeProp('backboard')
      })
    }
  }

  function genRim () {
    const r = config.rimRadius * config.scaleRatio
    const cx = config.actualWidth / 2
    let cy = (config.backboardY || config.backboardDistanceFromBaseline * config.scaleRatio) + config.rimDistanceFromBackboard * config.scaleRatio + r
    config.rimY = cy
    const paths = [makePath()]
    if (!halfCourt) {
      cy = config.actualLength - cy
      paths.push(makePath())
    }
    return paths

    function makePath () {
      return new Node('circle', {
        r,
        cx,
        cy,
        ...resolveThemeProp('rim')
      })
    }
  }

  function genRestrictedArea () {
    const r = config.restrictedAreaRadius * config.scaleRatio
    const x1 = config.actualWidth / 2 - r
    const x2 = x1 + r * 2
    let y = config.rimY || (config.backboardY || config.backboardDistanceFromBaseline * config.scaleRatio) + config.rimDistanceFromBackboard * config.scaleRatio + config.rimRadius * config.scaleRatio
    let sweep = 0
    const paths = [makePath()]
    if (!halfCourt) {
      y = config.actualLength - y
      sweep = 1
      paths.push(makePath())
    }
    return paths

    function makePath () {
      return new Node('path', {
        d: `M${x1} ${y} A${r} ${r} 0 0 ${sweep} ${x2} ${y}`,
        ...resolveThemeProp('restricted')
      })
    }
  }

  function genPath (key, func) {
    if (config[key] === false) return
    paths.push(func())
  }
}

module.exports = court
