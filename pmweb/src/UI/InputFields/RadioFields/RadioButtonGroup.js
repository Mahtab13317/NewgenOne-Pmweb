import React from "react";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import { makeStyles } from "@material-ui/core/styles";
const useStyles = makeStyles((theme) => ({
  label: {
    fontSize: "var(--base_text_font_size)",
    color: "#000 !important",
    fontWeight: "500",
    margin: "0.5rem 0",
    marginInlineStart: "0",
    marginInlineEnd: "1vw",
    gap: "0.25vw",
  },
  radioSize: {
    "& .MuiSvgIcon-root": {
      width: "1.5rem !important",
      height: "1.5rem !important",
    },
  },
}));

const RadioButtonGroup = ({
  ButtonsArray,
  name,
  value,
  label,
  onChange,
  column,
  disabled,
}) => {
  const classes = useStyles();
  return (
    <FormControl component="fieldset">
      <FormLabel component="legend" className={classes.label}>
        {label || ""}
      </FormLabel>
      <RadioGroup
        row={column ? false : true}
        aria-label={label || "Label"}
        name={name || "radios"}
        value={value || ""}
        onChange={onChange}
      >
        {ButtonsArray?.map((button) => (
          <FormControlLabel
            key={button.label}
            className={classes.label}
            value={button.value}
            disabled={disabled}
            control={<Radio color="primary" className={classes.radioSize} />}
            label={
              <span
                style={{
                  fontSize: "var(--base_text_font_size)",
                  fontWeight: 600,
                }}
              >
                {button.label || ""}
              </span>
            }
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};
export default RadioButtonGroup;
