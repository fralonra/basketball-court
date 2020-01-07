const nameSpace = 'http://www.w3.org/2000/svg'

function Node (tag, attrs, children) {
  this.tag = tag
  this.attrs = attrs || {}
  this.children = children || []
}

Node.prototype.setAttr = function (key, value) {
  this.attrs[key] = value
}

Node.prototype.toString = function () {
  const children = this.children.reduce((p, c) => {
    return p + c.toString()
  }, '')
  return `<${this._stringifyAttrs()}>${children}</${this.tag}>`
}

Node.prototype.toDom = function () {
  if (!window || !window.document) {
    console.error('"window" or "window.document" is undefined, using string output instead.')
    return this.toString()
  }
  const el = window.document.createElementNS(nameSpace, this.tag)
  for (const attr in this.attrs) {
    el.setAttribute(attr, this.attrs[attr])
  }
  this.children.forEach(child => {
    el.appendChild(child.toDom())
  })
  return el
}

Node.prototype._stringifyAttrs = function () {
  const res = [this.tag]
  for (const attr in this.attrs) {
    res.push(`${attr}="${this.attrs[attr]}"`)
  }
  return res.join(' ')
}

module.exports = Node
