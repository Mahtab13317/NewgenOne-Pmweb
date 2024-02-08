import React from "react";
import { Typography, TextField, Grid, Box, MenuItem } from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import { Remove } from "@material-ui/icons";
import CheckboxField from "../CheckboxFields/CheckboxField";
import RadioButtonGroup from "../RadioFields/RadioButtonGroup";
import SunEditor from "../../SunEditor/SunTextEditor";
import SelectWithInput from "../../SelectWithInput";
import { useTranslation } from "react-i18next";
import { DatePickers } from "../../DatePicker/DatePickers";
import { RTL_DIRECTION } from "../../../Constants/appConstants";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingBottom: "6px",
  },
  inputTitle: {
    height: 27,
    backgroundColor: "white",
    fontSize: "var(--subtitle_text_font_size)",
  },
  input: {
    //Bug 124385 [01-03-2023] Added minHeight for DropDown fields.
    minHeight: (props) =>
      props.minHeight || props.dropdown ? "var(--line_height)" : "auto",
    height: (props) =>
      props.height || props.dropdown ? "auto" : "var(--line_height)",
    backgroundColor: "white",
    fontSize: "var(--base_text_font_size)",
    border: "1px solid #CECECE !important",
    "& .Mui-focused": {
      borderColor: "transparent",
      borderWidth: "0px !important",
    },
  },
  //Bug 124387 [01-03-2023] Added new input2 class for inner HTML element
  input2: {
    height: "100%",
    backgroundColor: "white",
    fontSize: "var(--base_text_font_size)",
    "& .Mui-focused": {
      borderColor: "transparent",
      borderWidth: "0px !important",
    },
    paddingInlineStart: "4px",
  },
  errorInput: {
    height: "var(--line_height)",
    backgroundColor: "white",
    fontSize: "var(--base_text_font_size)",
    border: "1px solid #b52a2a !important",
  },
  disabledInput: {
    height: "var(--line_height)",
    backgroundColor: "white",
    fontSize: "var(--base_text_font_size)",
  },
  multilineInput: {
    backgroundColor: "white",
    fontSize: "var(--base_text_font_size)",
    border: "1px solid #CECECE !important",
    "& focus": {
      border: "0px solid #CECECE !important",
    },
    "& .Mui-focused": {
      borderColor: "transparent",
      borderWidth: "0px !important",
    },
  },
  //Bug 124387 [01-03-2023] Added new multilineInput2 class for inner HTML element
  multilineInput2: {
    backgroundColor: "white",
    fontSize: "var(--base_text_font_size)",
    "& focus": {
      border: "0px solid #CECECE !important",
    },
    "& .Mui-focused": {
      borderColor: "transparent",
      borderWidth: "0px !important",
    },
  },
  errorMultilineInput: {
    backgroundColor: "white",
    fontSize: "var(--base_text_font_size)",
    border: "1px solid #b52a2a !important",
    "& focus": {
      border: "0px solid #CECECE !important",
    },
    "& .Mui-focused": {
      borderColor: "transparent",
      borderWidth: "0px !important",
    },
  },
  label: {
    fontSize: "var(--base_text_font_size)",
    color: "#606060",
    fontWeight: 500,
  },
  labelCheckbox: {
    fontSize: "var(--base_text_font_size)",
    color: "#686868",
    opacity: 1,
    fontWeight: 450,
  },
  helperText: {
    color: "#606060",
    fontSize: "var(--sub_text_font_size)",
  },
  colorPrimary: {
    filter: `invert(29%) sepia(90%) saturate(5100%) hue-rotate(191deg) brightness(96%) contrast(101%)`,
  },
  labelBtn: {
    border: "1px solid #c5c5c5",
    width: "23px",
    height: "16px",
    borderRadius: "2px",
  },
  labelBtnDisabled: {
    border: "1px solid #c5c5c5",
    width: "23px",
    height: "16px",
    borderRadius: "2px",
    opacity: 0.4,
  },
  required: {
    //WCAG color contrast Issue: Changed the color to rgb(181,42,42)
    //color: "#b52a2a",
    color: "rgb(181,42,42)",
    marginLeft: "0.25vw",
  },
  paperRoot: {
    display: "flex",
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(1),
      width: theme.spacing(16),
      height: theme.spacing(16),
    },
  },
  icon: {
    left: (props) => (props.direction === RTL_DIRECTION ? "0px" : "unset"),
    right: (props) => (props.direction === RTL_DIRECTION ? "unset" : "0px"),
  },
}));

export const CustomTextField = withStyles({
  input: {
    height: "100%",
  },
})((props) => <TextField {...props} />);

const Field = (props) => {
  const { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  const classes = useStyles({
    height: props.height || props.dropdown ? "auto" : "",
    minHeight:
      props.minHeight || props.dropdown ? "var(--line_height)" : "auto",
    direction: direction,
  });

  const getValueFromSunTextEditor = (e) => {
    props.onChange({
      target: {
        name: props?.name || props?.label,
        // value: e?.target?.innerHTML  || "",
        value: e?.target?.innerHTML || e || "", //Modified on 30/10/2023, bug_id:135628
      },
    });
  };

  // added on 20/10/23 for BugId 139684
  const getChangeFromSunTextEditor = (e) => {
    props.onChange({
      target: {
        name: props?.name || props?.label,
        //value: e?.target?.value  || "",
        value: e?.target?.value || e || "", //Modified on 30/10/2023, bug_id:135628
      },
    });
  };

  return (
    <div className={classes.root}>
      {props.checkbox && (
        <>
          <Grid container direction="row">
            <Grid item>
              <CheckboxField
                name={props.name}
                value={props.value}
                label={props.label}
                onChange={props.onChange}
              />
            </Grid>
          </Grid>
          {props.helperText && (
            <Grid container>
              <Grid item>
                <Typography component="small" className={classes.helperText}>
                  {props.helperText}
                </Typography>
              </Grid>
            </Grid>
          )}
        </>
      )}
      {props.radio && (
        <RadioButtonGroup
          ButtonsArray={props.ButtonsArray}
          name={props.name}
          value={props.value}
          label={props.label}
          onChange={props.onChange}
          column={props.column}
          disabled={props.disabled}
          id={props.id}
        />
      )}
      {!props.checkbox && !props.radio ? (
        <>
          <Grid container alignItems="center">
            {props.icon && (
              <Grid item>
                <Typography className={classes.label}>{props.icon}</Typography>
              </Grid>
            )}

            {props.label && (
              <Grid item>
                <label for={props.id} className={classes.label}>
                  {props.label || null}
                </label>
              </Grid>
            )}

            {props.required && (
              <Grid item>
                <Typography className={classes.required}>*</Typography>
              </Grid>
            )}
            {props.extraLabel && (
              <Grid item>
                <Typography className={classes.label}>
                  {props.extraLabel || null}
                </Typography>
              </Grid>
            )}
          </Grid>
          <Box>
            {props.range ? (
              <Grid container spacing={2}>
                <Grid item xs={5}>
                  <TextField
                    id={props.id}
                    type="text"
                    error={props.error1}
                    helperText={props.helperText1}
                    size="small"
                    name={props.name1}
                    InputProps={{
                      className: classes.input,
                    }}
                    value={props.value1}
                    onChange={props.onChange}
                    variant="outlined"
                    FormHelperTextProps={{
                      style: { marginLeft: 0, fontSize: "10px" },
                    }}
                    inputRef={props?.inputRef}
                  />
                </Grid>
                <Grid item xs={2}>
                  <Grid container justify="center">
                    <Remove />
                  </Grid>
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    id={props.id}
                    type="text"
                    error={props.error2}
                    helperText={props.helperText2}
                    size="small"
                    name={props.name2}
                    InputProps={{
                      className: classes.input,
                    }}
                    value={props.value2}
                    onChange={props.onChange}
                    variant="outlined"
                    FormHelperTextProps={{
                      style: {
                        marginLeft: 0,
                        fontSize: "10px",
                      },
                    }}
                    inputRef={props?.inputRef}
                  />
                </Grid>
              </Grid>
            ) : props.sunEditor ? (
              <Grid container>
                <Grid item xs>
                  <div
                    style={{ height: "26vh", minWidth: props.sunEditorWidth }}
                  >
                    <SunEditor
                      id="add_description_sunEditor"
                      width={props.width || "100%"}
                      customHeight={props.height || "6rem"}
                      placeholder={props.placeholder || ""}
                      value={props.value}
                      getValue={getValueFromSunTextEditor}
                      //Bug 124601 new task>> dropdown of description is getting overlapping with other fields
                      //[09-03-2023] provided zIndex
                      zIndex={props.zIndex}
                      disabled={props.disabled} // code added on 5 April 2023 for BugId 126368
                      handleChange={getChangeFromSunTextEditor} // added on 20/10/23 for BugId 139684

                      // callHandleChangeOnPaste={  props?.name==="Description"?true:false}
                    />
                  </div>
                </Grid>
              </Grid>
            ) : props.selectCombo ? (
              <Grid container>
                <Grid item xs>
                  <SelectWithInput
                    type={props.type}
                    dropdownOptions={props.dropdownOptions}
                    optionKey={props.optionKey}
                    setIsConstant={props.setIsConstant}
                    setValue={props.setValue}
                    value={props.value}
                    isConstant={props.isConstant}
                    showEmptyString={props.showEmptyString}
                    showConstValue={props.showConstValue}
                    disabled={props.disabled}
                    id={props.id}
                    onBlur={props.onBlur}
                    inputClass={props.inputClass}
                    constantInputClass={props.constantInputClass}
                    selectWithInput={props.selectWithInput}
                    error={props.error}
                    helperText={props.helperText}
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container>
                <Grid item xs>
                  {props.type === "date" ? (
                    <DatePickers
                      name={props.name || props.label}
                      onChange={props.onChange}
                      timeFormat={false}
                      value={props.value}
                      disabled={props.disabled}
                      width="100%"
                      height="var(--line_height)"
                      required={props.required}
                    />
                  ) : (
                    <TextField
                      type={
                        props.secret
                          ? "password"
                          : props.type
                          ? props.type
                          : "text"
                      }
                      id={props.id}
                      error={props.error}
                      helperText={props.helperText}
                      size="small"
                      multiline={props.multiline}
                      rows={4}
                      fullWidth={true}
                      name={props.name || props.label}
                      inputProps={{
                        "aria-label": props.label,
                        step: props.step || null,
                        min: props.min || null,
                        max: props.max || null,
                        className: props.multiline
                          ? props.error
                            ? classes.errorMultilineInput
                            : classes.multilineInput2
                          : props.disabled && !props.dropdown
                          ? classes.disabledInput
                          : props.error
                          ? classes.errorInput
                          : classes.input2,
                        //id:`pmweb_Field_lable${props.label}`
                      }}
                      InputProps={{
                        className: props.multiline
                          ? props.error
                            ? classes.errorMultilineInput
                            : classes.multilineInput
                          : props.disabled && !props.dropdown
                          ? classes.disabledInput
                          : props.error
                          ? classes.errorInput
                          : classes.input,
                        startAdornment: props.startAdornment || null,
                        endAdornment: props.endAdornment || null,
                        readOnly: props.readOnly || null,
                        spellCheck: false,
                      }}
                      value={props.value}
                      onChange={props.onChange}
                      FormHelperTextProps={{
                        style: {
                          //Modified on 9/9/2023 for bug_id: 136631
                          // marginLeft: 0,
                          display: "flex",
                          justifyContent: "start",
                          marginTop: 0,
                          fontSize: "10px",
                          fontWeight: 600,
                          color: props.error ? "#b52a2a" : "#606060",
                        },
                      }}
                      disabled={props.disabled}
                      select={props.dropdown}
                      SelectProps={{
                        MenuProps: {
                          anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left",
                          },
                          getContentAnchorEl: null,
                          PaperProps: {
                            elevation: 3,
                            square: true,
                            style: {
                              border: "1px solid #CCCEEE",
                              boxShadow: "0px 3px 6px #00000029",
                              direction: direction,
                            },
                          },
                        },
                        classes: { icon: classes.icon },
                      }}
                      inputRef={props?.inputRef}
                      onKeyPress={props?.onKeyPress}
                      onClick={props?.onClick}
                      onPaste={props?.onPaste}
                      style={props.style}
                    >
                      {props.options?.map((option, index) => {
                        return (
                          <MenuItem
                            value={option?.value}
                            style={{
                              textAlign: "center",
                            }}
                            key={index}
                          >
                            <Typography
                              style={{
                                fontSize: "12px",
                                color: props.disabled ? "grey" : "black", //Changes made to solve Bug 139105
                              }}
                              variant="h6"
                            >
                              {option?.name}
                            </Typography>
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  )}
                </Grid>
                {props.btnIconAtEnd && (
                  <Grid
                    item
                    style={{
                      marginLeft: "-2px",
                      zIndex: 1,
                    }}
                    onClick={props.btnIconDefaultHandler || null}
                  >
                    {props.btnIconAtEnd}
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        </>
      ) : null}
    </div>
  );
};

export default Field;
