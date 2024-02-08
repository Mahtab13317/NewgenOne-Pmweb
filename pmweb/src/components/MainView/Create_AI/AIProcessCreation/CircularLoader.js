import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

export default function CircularLoader({
  open,
  children,
  style = { width: "72px", height: "72px" },
  backDropStyle,
}) {
  return (
    <Backdrop
      sx={
        backDropStyle
          ? {
              color: "#fff",
              zIndex: (theme) => theme.zIndex.drawer + 1,
              ...backDropStyle,
            }
          : { color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }
      }
      open={open}
    >
      <CircularProgress color="inherit" style={{ ...style }} />
    </Backdrop>
  );
}
