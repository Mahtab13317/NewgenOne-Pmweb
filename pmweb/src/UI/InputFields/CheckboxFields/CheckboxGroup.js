import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import { Grid, Checkbox, FormGroup, FormControlLabel } from "@material-ui/core";
const useStyles = makeStyles((theme) => ({
  CheckBoxIcon: {
    color: "var(--checkbox_color)",
    "& .MuiSvgIcon-root": {
      width: "1.5rem !important",
      height: "1.5rem !important",
    },
  },
  icon: {
    // height: "16px",
    //width: "16px",
    // fontSize: "12px",
  },
  label: {
    fontSize: "var(--base_text_font_size)",
    color: "#686868",
    opacity: 1,
    fontWeight: 450,
  },
}));
const CheckboxGroup = (props) => {
  const classes = useStyles();
  const { checkboxArray, direction = "column" } = props;

  return (
    <Grid container direction={direction} spacing={1}>
      {checkboxArray &&
        checkboxArray.map((item, index) => {
          const { name, value, onChange, label, disabled } = item;
          return (
            <Grid item key={name || index}>
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
                      checked={value}
                      name={name}
                      value={value}
                      onChange={onChange}
                      disabled={disabled}
                      disableRipple
                    />
                  }
                  label={
                    <span
                      style={{
                        fontSize: "var(--base_text_font_size)",
                        fontWeight: 600,
                      }}
                    >
                      {label || name || ""}
                    </span>
                  }
                />
              </FormGroup>
            </Grid>
          );
        })}
    </Grid>
  );
};

export default CheckboxGroup;
