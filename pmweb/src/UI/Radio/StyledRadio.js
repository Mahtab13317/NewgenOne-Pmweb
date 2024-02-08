import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Radio from "@material-ui/core/Radio";

const useStyles = makeStyles({
  root: {
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
  checkedIcon: {
    color: "var(--radio_color) !important",
  },
  disabled: {
    color: "rgba(0, 0, 0, 0.26) !important",
  },
});

export default function StyledRadio(props) {
  const classes = useStyles();
  return (
    <Radio
      classes={{
        root: classes.root,
        checked: classes.checkedIcon,
        disabled: classes.disabled,
      }}
      color="default"
      {...props}
    />
  );
}
