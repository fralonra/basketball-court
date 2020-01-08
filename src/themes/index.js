const plain = {
  global: {
    fill: 'transparent',
    stroke: '#000',
  }
}

const beach = {
  global: {
    fill: 'transparent',
    stroke: '#fff'
  },
  court: {
    fill: '#54A2C2'
  },
  centerCircle: {
    fill: '#CFA246'
  },
  restrainCircle: false,
  lane: {
    fill: '#CFA246'
  },
  innerLane: false
}

const steppe = {
  global: {
    fill: 'transparent',
    stroke: '#fff'
  },
  court: {
    fill: '#4C6649'
  },
  restrainCircle: false,
  innerLane: false,
}

const volcano = {
  global: {
    fill: 'transparent',
    stroke: '#fff'
  },
  court: {
    fill: '#286B5B'
  },
  centerCircle: {
    fill: '#A35A5C'
  },
  restrainCircle: false,
  lane: {
    fill: '#A35A5C'
  },
  innerLane: false
}

module.exports = {
  plain,
  beach,
  steppe,
  volcano
}
