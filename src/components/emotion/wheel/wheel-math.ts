import { Skia, SkPath } from '@shopify/react-native-skia';

/**
 * Creates a Skia path for an annular sector (a curved slice of a ring).
 * @param cx Center X
 * @param cy Center Y
 * @param innerRadius Inner circle radius
 * @param outerRadius Outer circle radius
 * @param startAngle Start angle in degrees (0 is 3 o'clock)
 * @param sweepAngle Sweep angle in degrees
 */
export const createSectorPath = (
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  sweepAngle: number
): SkPath => {
  const outerRect = {
    x: cx - outerRadius,
    y: cy - outerRadius,
    width: outerRadius * 2,
    height: outerRadius * 2,
  };
  const innerRect = {
    x: cx - innerRadius,
    y: cy - innerRadius,
    width: innerRadius * 2,
    height: innerRadius * 2,
  };

  const startRad = (Math.PI / 180) * startAngle;
  const endRad = (Math.PI / 180) * (startAngle + sweepAngle);

  // Use PathBuilder instead of deprecated SkPath mutations
  return Skia.PathBuilder.Make()
    .moveTo(
      cx + Math.cos(startRad) * outerRadius,
      cy + Math.sin(startRad) * outerRadius
    )
    .arcToOval(outerRect, startAngle, sweepAngle, false)
    .lineTo(
      cx + Math.cos(endRad) * innerRadius,
      cy + Math.sin(endRad) * innerRadius
    )
    .arcToOval(innerRect, startAngle + sweepAngle, -sweepAngle, false)
    .close()
    .build();
};

/**
 * Creates a curved path perfectly centered for text rendering.
 * Adjusts direction so text doesn't render upside down on the bottom half.
 */
export const createTextPath = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  sweepAngle: number
): SkPath => {
  const builder = Skia.PathBuilder.Make();
  const rect = {
    x: cx - radius,
    y: cy - radius,
    width: radius * 2,
    height: radius * 2,
  };

  // Draw all arcs counter-clockwise so the baseline is facing the outside of the wheel
  // This satisfies the requirement "como se pra fora da roda fosse o chao"
  builder.addArc(rect, startAngle + sweepAngle, -sweepAngle);

  return builder.build();
};
