import { Tooltip } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";

export const LightTooltip = withStyles(() => ({
  tooltip: {
    color: "#000000",
    background: "#FFFFFF 0% 0% no-repeat padding-box",
    boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.16)",
    border: "1px solid #E7E7E7",
    font: "normal normal normal var(--base_text_font_size) / 17px var(--font_family)",
    letterSpacing: "0px",
    zIndex: "100",
  },
  arrow: {
    "&:before": {
      backgroundColor: "#FFFFFF !important",
      border: "1px solid #E7E7E7 !important",
      zIndex: "100",
    },
  },
}))(Tooltip);