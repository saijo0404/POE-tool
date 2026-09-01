export interface ScreenBounds {
  width: number;
  height: number;
}

export interface WindowDimensions {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface OverlayPositionOptions {
  cursor: Point;
  windowSize: WindowDimensions;
  screenSize: ScreenBounds;
  offset?: Point;
}

export interface RollRating {
  percentage: number;
  ratingLabel: 'Low' | 'Mid' | 'High' | 'Max' | 'None';
  tierText?: string;
}

export interface OverlaySettings {
  overlayEnabled: boolean;
  overlayOpacity: number;
  overlayClickThrough: boolean;
  overlayAutoCloseOnBlur: boolean;
  overlayScale: number;
}
