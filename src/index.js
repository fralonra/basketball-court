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

  let path = ''
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
  wrapSvg()
  return path

  function resolveThemeProp (path, key) {
    return theme[path] && theme[path][key]
      ? theme[path][key]
      : theme.global && theme.global[key]
        ? theme.global[key]
        : ''
  }

  function getThemePropsStr (path, keys = []) {
    const props = []
    keys.forEach(key => {
      push(key)
    })
    for (const key in theme[path]) {
      if (!keys.includes(key)) {
        push(key)
      }
    }
    return props.join(' ')

    function push (key) {
      props.push(stringify(key, resolveThemeProp(path, key)))
    }

    function stringify (key, value) {
      return `${key}="${value}"`
    }
  }

  function genCourt () {
    const props = getThemePropsStr('court')
    return `<rect x="0" y="0" width="${config.actualWidth}" height="${config.actualLength}" ${props} />`
  }

  function genHcCircle (radius, path) {
    const r = radius * config.scaleRatio
    const props = getThemePropsStr(path)
    if (halfCourt) {
      const x1 = config.actualWidth / 2 - r
      const x2 = config.actualWidth - x1
      const y = config.actualLength
      return `<path d="M${x1} ${y} A${r} ${r} 0 0 1 ${x2} ${y}Z" ${props} />`
    }
    return `<circle cx="${config.centerX}" cy="${config.centerY}" r="${r}" ${props} />`
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
    const props = getThemePropsStr('hcline')
    return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" ${props} />`
  }

  function genTpline () {
    const r = config.tplineDistanceFromHoop * config.scaleRatio
    const props = getThemePropsStr('tpline')
    const x1 = config.actualWidth / 2 - config.tplineDistanceFromHoopCorner * config.scaleRatio
    const x2 = config.actualWidth - x1
    let y1 = 0
    let y2 = config.tplineSideLength * config.scaleRatio
    let paths = `<path d="M${x1} ${y1} L${x1} ${y2} A${r} ${r} 0 0 0 ${x2} ${y2} L${x2} ${y1}Z" ${props} />`
    if (!halfCourt) {
      y1 = config.actualLength
      y2 = config.actualLength - y2
      paths += `<path d="M${x1} ${y1} L${x1} ${y2} A${r} ${r} 0 0 1 ${x2} ${y2} L${x2} ${y1}Z" ${props} />`
    }
    return paths
  }

  function genLane () {
    const width = config.laneWidth * config.scaleRatio
    const length = config.laneLength * config.scaleRatio
    const x = (config.actualWidth - width) / 2
    let y = 0
    config.laneActualLength = length
    const props = getThemePropsStr('lane')
    let paths = `<rect x="${x}" y="${y}" width="${width}" height="${length}" ${props} />`
    if (!halfCourt) {
      y = config.actualLength - length
      paths += `<rect x="${x}" y="${y}" width="${width}" height="${length}" ${props} />`
    }
    return paths
  }

  function genInnerLane () {
    const width = config.ftCircleRadius * config.scaleRatio * 2
    const length = config.laneActualLength || config.laneLength * config.scaleRatio
    const x = (config.actualWidth - width) / 2
    let y = 0
    config.innnerLaneX = x
    const props = getThemePropsStr('innerLane')
    let paths = `<rect x="${x}" y="${y}" width="${width}" height="${length}" ${props} />`
    if (!halfCourt) {
      y = config.actualLength - length
      paths += `<rect x="${x}" y="${y}" width="${width}" height="${length}" ${props} />`
    }
    return paths
  }

  function genFtCircle () {
    const r = config.ftCircleRadius * config.scaleRatio
    const x1 = config.innnerLaneX || (config.actualWidth - config.ftCircleRadius * config.scaleRatio * 2) / 2
    const x2 = x1 + r * 2
    let y = config.laneActualLength || config.laneLength * config.scaleRatio
    const props = getThemePropsStr('ftCircle')
    let paths = `<path d="M${x1} ${y} A${r} ${r} 0 0 1 ${x2} ${y}" ${props} /><path d="M${x1} ${y} A${r} ${r} 0 0 0 ${x2} ${y}Z" ${props} />`
    if (!halfCourt) {
      y = config.actualLength - y
      paths += `<path d="M${x1} ${y} A${r} ${r} 0 0 1 ${x2} ${y}" ${props} /><path d="M${x1} ${y} A${r} ${r} 0 0 0 ${x2} ${y}Z" ${props} />`
    }
    return paths
  }

  function genBackboard () {
    const width = config.backboardWidth * config.scaleRatio
    const x1 = (config.actualWidth - width) / 2
    const x2 = (config.actualWidth + width) / 2
    let y = config.backboardDistanceFromBaseline * config.scaleRatio
    config.backboardY = y
    const props = getThemePropsStr('backboard', ['stroke'])
    let paths = `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" ${props} />`
    if (!halfCourt) {
      y = config.actualLength - y
      paths += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" ${props} />`
    }
    return paths
  }

  function genRim () {
    const r = config.rimRadius * config.scaleRatio
    const x = config.actualWidth / 2
    let y = (config.backboardY || config.backboardDistanceFromBaseline * config.scaleRatio) + config.rimDistanceFromBackboard * config.scaleRatio + r
    config.rimY = y
    const props = getThemePropsStr('rim')
    let paths = `<circle cx="${x}" cy="${y}" r="${r}" ${props} />`
    if (!halfCourt) {
      y = config.actualLength - y
      paths += `<circle cx="${x}" cy="${y}" r="${r}" ${props} />`
    }
    return paths
  }

  function genRestrictedArea () {
    const r = config.restrictedAreaRadius * config.scaleRatio
    const x1 = config.actualWidth / 2 - r
    const x2 = x1 + r * 2
    let y = config.rimY || (config.backboardY || config.backboardDistanceFromBaseline * config.scaleRatio) + config.rimDistanceFromBackboard * config.scaleRatio + config.rimRadius * config.scaleRatio
    const props = getThemePropsStr('restricted')
    let paths = `<path d="M${x1} ${y} A${r} ${r} 0 0 0 ${x2} ${y}" ${props} />`
    if (!halfCourt) {
      y = config.actualLength - y
      paths += `<path d="M${x1} ${y} A${r} ${r} 0 0 1 ${x2} ${y}" ${props} />`
    }
    return paths
  }

  function genPath (key, func) {
    if (config[key] === false) return
    if (typeof config[key] === 'function') {
      path += config[key](baseConfig)
      return
    }
    path += func()
  }

  function wrapSvg () {
    const props = getThemePropsStr('global', ['fill', 'stroke'])
    path = `<svg version="1.1" baseProfile="full" width="${config.actualWidth}" height="${config.actualLength}" ${props} xmlns="http://www.w3.org/2000/svg">${path}</svg>`
  }
}

module.exports = court
