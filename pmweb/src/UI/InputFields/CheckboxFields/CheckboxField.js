import React, { useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import { Grid, Checkbox, FormGroup, FormControlLabel } from "@material-ui/core";
const useStyles = makeStyles(() => ({
  CheckBoxIcon: {
    color: "var(--checkbox_color)",

    "& .MuiSvgIcon-root": {
      width: "1.5rem !important",
      height: "1.5rem !important",
    },
  },
  icon: {
    //height: "12px",
    //width: "12px",
    // fontSize: "12px",
  },
  label: {
    fontSize: "var(--base_text_font_size)",
    color: "#000000",
    opacity: 1,
    fontWeight: 700,
  },
}));
const CheckboxField = (props) => {
  const { name, value, label, onChange, disabled } = props;
  const checkBoxFieldRef = useRef();

  const classes = useStyles();
  return (
    <Grid container>
      <Grid item>
        <FormGroup>
          <FormControlLabel
            className={classes.label}
            control={
              <Checkbox
                style={{
                  fontSize: "var(--base_text_font_size)",

                  paddingRight: "5px",
                  paddingBottom: "3px",
                  paddingTop: "3px",
                }}
                checked={value}
                icon={
                  <CheckBoxOutlineBlankIcon
                    fontSize="small"
                    className={classes.icon}
                  />
                }
                checkedIcon={
                  <CheckBoxIcon
                    fontSize="small"
                    className={classes.icon + " " + classes.CheckBoxIcon}
                  />
                }
                name={name}
                value={value}
                onChange={onChange}
                tabIndex={0}
                ref={checkBoxFieldRef}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    checkBoxFieldRef.current.click();
                    e.stopPropagation();
                  }
                }}
                disableRipple
                disabled={disabled}
              />
            }
            label={
              <span
                style={{
                  fontSize: "var(--base_text_font_size)",
                  fontWeight: 600,
                }}
              >
                {label || ""}
              </span>
            }
          />
        </FormGroup>
      </Grid>
    </Grid>
  );
};

export default CheckboxField;
