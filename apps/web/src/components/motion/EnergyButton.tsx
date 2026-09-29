import { forwardRef, type ReactNode } from "react";
import { Box, Button, type ButtonProps } from "@mui/material";
import { aurora, auroraGradient, duration, easing, distance, radius } from "@/theme/tokens";

/**
 * A button whose hover reads as energy crossing its edge (§13).
 *
 * Default is a dark or transparent surface with a precise border and a
 * high-contrast label. On hover an Aurora streak travels across the lower
 * border — §13 is explicit that the whole button must NOT fill with a rainbow,
 * so the gradient lives on a single edge and sweeps, rather than flooding the
 * surface.
 *
 * The streak moves `background-position` on a 1px element, so nothing reflows
 * and the label never repaints.
 *
 * Keyboard parity is not optional. §12 and §20 both require a focus state
 * equivalent to hover, so `:focus-visible` drives the same treatment — a
 * pointer-only affordance is invisible to keyboard users.
 */

const STREAK = "energy-streak";

export interface EnergyButtonProps extends Omit<ButtonProps, "variant"> {
  /**
   * `outline` is the default: dark surface, precise border, streak on hover.
   * `solid` is for primary CTAs, which §13 allows to carry a restrained static
   * gradient accent.
   */
  tone?: "outline" | "solid";
  children: ReactNode;
}

const EnergyButton = forwardRef<HTMLButtonElement, EnergyButtonProps>(function EnergyButton(
  { tone = "outline", children, sx, ...rest },
  ref,
) {
  const solid = tone === "solid";

  return (
    <Button
      ref={ref}
      variant={solid ? "contained" : "outlined"}
      disableElevation
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: radius.pill,
        px: 3.5,
        py: 1.25,
        fontWeight: 700,
        // Pressed state is physical but small: §13 asks for 1-2px, not a bounce.
        transition: `transform ${duration.feedback}s ${easing.css.out}, border-color ${duration.ui}s ${easing.css.out}`,
        "&:active": { transform: `translateY(${distance.press}px)` },

        ...(solid
          ? {
              // Two adjacent Aurora stops. The full four-stop spectrum on a
              // control this small reads as noise.
              background: `linear-gradient(135deg, ${aurora.teal} 0%, ${aurora.blue} 100%)`,
              color: "#04121A",
              "&:hover": { background: "linear-gradient(135deg, #38D3EB 0%, #5A96F8 100%)" },
            }
          : {
              borderColor: "divider",
              color: "text.primary",
              "&:hover, &:focus-visible": {
                borderColor: `${aurora.teal}66`,
                background: "transparent",
              },
            }),

        // The streak is driven from the button so hover and focus both reach it.
        [`& .${STREAK}`]: {
          opacity: 0,
          backgroundPosition: "100% 0",
          transition: `opacity ${duration.ui}s ${easing.css.out}, background-position ${duration.narrative}s ${easing.css.out}`,
        },
        [`&:hover .${STREAK}, &:focus-visible .${STREAK}`]: {
          opacity: 1,
          backgroundPosition: "0 0",
        },

        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:active": { transform: "none" },
          // §20 removes decorative effects rather than speeding them up.
          [`& .${STREAK}`]: { display: "none" },
        },
        ...sx,
      }}
      {...rest}
    >
      {children}
      {!solid && (
        <Box
          aria-hidden
          className={STREAK}
          sx={{
            position: "absolute",
            insetInline: 0,
            bottom: 0,
            height: "1px",
            backgroundImage: auroraGradient(90),
            backgroundSize: "220% 100%",
          }}
        />
      )}
    </Button>
  );
});

export default EnergyButton;
