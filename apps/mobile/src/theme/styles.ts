import { ViewStyle } from "react-native";

export const BORDER = "rgba(108, 99, 255, 0.12)";

const BRACKET_SIZE = 10;
const BRACKET_THICKNESS = 1.5;

/**
 * Returns an array of 4 corner-bracket style objects (topLeft, topRight, bottomLeft, bottomRight).
 * Each is absolutely positioned and draws an L-shaped corner using two borders.
 */
export function cornerBrackets(color: string): ViewStyle[] {
  const base: ViewStyle = {
    position: "absolute",
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
  };

  return [
    // Top-left
    {
      ...base,
      top: -1,
      left: -1,
      borderTopWidth: BRACKET_THICKNESS,
      borderLeftWidth: BRACKET_THICKNESS,
      borderTopColor: color,
      borderLeftColor: color,
    },
    // Top-right
    {
      ...base,
      top: -1,
      right: -1,
      borderTopWidth: BRACKET_THICKNESS,
      borderRightWidth: BRACKET_THICKNESS,
      borderTopColor: color,
      borderRightColor: color,
    },
    // Bottom-left
    {
      ...base,
      bottom: -1,
      left: -1,
      borderBottomWidth: BRACKET_THICKNESS,
      borderLeftWidth: BRACKET_THICKNESS,
      borderBottomColor: color,
      borderLeftColor: color,
    },
    // Bottom-right
    {
      ...base,
      bottom: -1,
      right: -1,
      borderBottomWidth: BRACKET_THICKNESS,
      borderRightWidth: BRACKET_THICKNESS,
      borderBottomColor: color,
      borderRightColor: color,
    },
  ];
}

/**
 * Scanline overlay style — use as a full-size absolutely positioned View
 * with repeating semi-transparent horizontal lines via a border trick.
 */
export const scanlineStyle: ViewStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0.03,
  borderTopWidth: 1,
  borderTopColor: "#fff",
  borderStyle: "dashed",
};
