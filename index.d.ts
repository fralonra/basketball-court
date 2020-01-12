export as namespace BasketballCourt

declare namespace BasketballCourt {
  enum CourtType {
    fiba = 'fiba',
    nba = 'nba',
    ncaa = 'ncaa',
    wnba = 'wnba'
  }

  enum Theme {
    plain = 'plain',
    beach = 'beach',
    steppe = 'steppe',
    volcano = 'volcano'
  }

  type SVGAttributeObject = object

  interface ThemeObject {
    global?: SVGAttributeObject,
    court?: SVGAttributeObject | boolean,
    centerCircle?: SVGAttributeObject | boolean,
    restrainCircle?: SVGAttributeObject | boolean,
    hcline?: SVGAttributeObject | boolean,
    tpline?: SVGAttributeObject | boolean,
    lane?: SVGAttributeObject | boolean,
    innerLane?: SVGAttributeObject | boolean,
    ftCircleHigh?: SVGAttributeObject | boolean,
    ftCircleLow?: SVGAttributeObject | boolean,
    restricted?: SVGAttributeObject | boolean,
    backboard?: SVGAttributeObject | boolean,
    rim?: SVGAttributeObject | boolean
  }

  interface ResultObject {
    toString: () => string,
    toDom: () => SVGElement
  }

  interface CourtOptions {
    width?: number,
    type?: CourtType,
    theme?: Theme | ThemeObject,
    ftCircleDashCount?: number,
    horizontal?: boolean,
    halfCourt?: boolean,
    reverse?: boolean,
    trapezoid?: boolean,
    data?: ThemeObject
  }

  export function court(options: CourtOptions): ResultObject
}

export = BasketballCourt
