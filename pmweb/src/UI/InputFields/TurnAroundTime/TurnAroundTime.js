import React from "react";
import { Typography, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useTranslation } from "react-i18next";
import Field from "../TextField/Field";
import { useSelector } from "react-redux";
import { useState } from "react";
import { useEffect } from "react";

const useStyles = makeStyles(() => ({
  root: {
    paddingBottom: "5px",
  },
  inputTitle: {
    height: 27,
    backgroundColor: "white",
    fontSize: "var(--subtitle_text_font_size)",
  },
  input: {
    height: 28,
    backgroundColor: "white",
    fontSize: "var(--base_text_font_size)",
  },

  multilineInput: {
    backgroundColor: "white",
    fontSize: "var(--base_text_font_size)",
    overflowY: "scroll",
  },
  label: {
    fontSize: "var(--base_text_font_size)",
    color: "#606060",
    fontWeight: 600,
  },
  labelAfter: {
    fontSize: "var(--base_text_font_size)",
    color: "#000000",
    fontWeight: 500,
  },

  helperText: {
    color: "#606060",
    fontSize: "var(--sub_text_font_size)",
  },

  required: {
    color: "red",
  },
}));
const TurnAroundTime = ({
  selectCombo = false,
  days,
  hours,
  minutes,
  calendarType = "",
  isDaysConstant = false,
  isHoursConstant = false,
  isMinutesConstant = false,
  label = "",
  required = false,
  handleChange = () => console.log("pls provide handleChange fn"),
  calendarTypeLabel = "",
  inputClass,
  constantInputClass,
  selectWithInput,
  disabled,
  isColumn,
  dropdownOptions = [],
  hoursError = false,
  hoursHelperText = "",
  daysError = false,
  daysHelperText = "",
  minsError = false,
  minsHelperText = "",
  calenderStyle,
  stopOnBlur = true,
}) => {
  const classes = useStyles();
  let { t } = useTranslation();
  const [minWidth, setMinWidth] = useState(
    window?.innerWidth < 850 ? "15vw" : "8vw"
  );

  const isDrawerExpanded = useSelector(
    (state) => state.isDrawerExpanded.isDrawerExpanded
  );
  useEffect(() => {
    const handleResize = () => {
      // Update the width when the window is resized
      setMinWidth(window?.innerWidth < 850 ? "15vw" : "8vw");
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Grid
      container
      direction={!isColumn ? "row" : "column"}
      spacing={isDrawerExpanded ? 1 : 2}
    >
      {label && (
        <Grid item>
          <Typography className={classes.label}>
            {label} {required && <span className={classes.required}>*</span>}
          </Typography>
        </Grid>
      )}

      {/*required && (
        <Grid item>
          <Typography className={classes.required}>*</Typography>
        </Grid>
      )*/}
      {selectCombo ? (
        <Grid item xs>
          <Grid
            container
            direction={isDrawerExpanded ? "row" : "column"}
            justifyContent={!isDrawerExpanded ? "flex-start" : null}
            alignItems={
              isDrawerExpanded && calendarTypeLabel
                ? "flex-end"
                : !isDrawerExpanded
                ? "flex-start"
                : "center"
            }
            spacing={1}
          >
            <Grid
              item
              md={isDrawerExpanded ? 3 : 10}
              xs={isDrawerExpanded ? 6 : 10}
            >
              <Grid container spacing={1} alignItems="center">
                <Grid item xs>
                  <Field
                    selectCombo={true}
                    dropdownOptions={dropdownOptions || []}
                    optionKey="VariableName"
                    setValue={(val, isConstant) => {
                      handleChange("days", val, isConstant);
                    }}
                    value={days}
                    isConstant={isDaysConstant}
                    showEmptyString={false}
                    showConstValue={true}
                    disabled={disabled}
                    id="pmweb_Turnaroundtime_days_select_input"
                    inputClass={inputClass}
                    constantInputClass={constantInputClass}
                    selectWithInput={selectWithInput}
                    error={daysError}
                    helperText={daysHelperText}
                  />
                </Grid>
                <Grid item>
                  <Typography className={classes.labelAfter}>
                    {t("days")}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              md={isDrawerExpanded ? 3 : 10}
              xs={isDrawerExpanded ? 6 : 10}
            >
              <Grid container spacing={1} alignItems="center">
                <Grid item xs>
                  <Field
                    selectCombo={true}
                    dropdownOptions={dropdownOptions || []}
                    optionKey="VariableName"
                    setValue={(val, isConstant) => {
                      handleChange("hours", val, isConstant);
                    }}
                    value={hours}
                    isConstant={isHoursConstant}
                    showEmptyString={false}
                    showConstValue={true}
                    disabled={disabled}
                    id="pmweb_turnaroundtime_hours_select_input"
                    inputClass={inputClass}
                    constantInputClass={constantInputClass}
                    selectWithInput={selectWithInput}
                    error={hoursError}
                    helperText={hoursHelperText}
                  />
                </Grid>
                <Grid
                  item
                  md={isDrawerExpanded ? 3 : 10}
                  xs={isDrawerExpanded ? 6 : 10}
                >
                  <Typography className={classes.labelAfter}>
                    {t("hours")}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              md={isDrawerExpanded ? 3 : 10}
              xs={isDrawerExpanded ? 6 : 10}
            >
              <Grid container spacing={1} alignItems="center">
                <Grid item xs>
                  <Field
                    selectCombo={true}
                    dropdownOptions={dropdownOptions || []}
                    optionKey="VariableName"
                    setValue={(val, isConstant) => {
                      handleChange("minutes", val, isConstant);
                    }}
                    value={minutes}
                    isConstant={isMinutesConstant}
                    showEmptyString={false}
                    showConstValue={true}
                    disabled={disabled}
                    id="pmweb_turnaroundtime_minutes_select_input"
                    inputClass={inputClass}
                    constantInputClass={constantInputClass}
                    selectWithInput={selectWithInput}
                    error={minsError}
                    helperText={minsHelperText}
                  />
                </Grid>
                <Grid item>
                  <Typography className={classes.labelAfter}>
                    {t("minutes")}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              md={isDrawerExpanded ? 3 : 12}
              xs={isDrawerExpanded ? 3 : 9}
            >
              <Grid item>
                <Field
                  style={calenderStyle}
                  minHeight="var(--line_height)"
                  id="pmweb_turnaroundtime_calendertype_field"
                  height="auto"
                  dropdown={true}
                  label={t("calendarType")}
                  disabled={disabled}
                  name={"calendarType"}
                  value={calendarType}
                  onChange={(e) => {
                    handleChange("calendarType", e.target.value);
                  }}
                  options={[
                    { name: "Working Day(s)", value: "Y" },
                    { name: "Calender Day(s)", value: "N" },
                  ]}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Grid item xs style={{ padding: "4px 8px" }}>
          <Grid
            container
            spacing={1}
            alignItems={
              isDrawerExpanded && calendarTypeLabel ? "flex-end" : null
            }
          >
            <Grid item xs={isDrawerExpanded ? 3 : 4}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs>
                  <Field
                    type="number"
                    name="Days"
                    value={days}
                    step={1}
                    min={0}
                    onChange={handleChange}
                    disabled={disabled}
                    id="pmweb_turnaroundtime_days_field"
                  />
                </Grid>
                <Grid item>
                  <Typography className={classes.labelAfter}>
                    {t("days")}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={isDrawerExpanded ? 3 : 4}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs>
                  <Field
                    type="number"
                    name="Hours"
                    step={1}
                    min={0}
                    max={23}
                    value={hours}
                    onChange={handleChange}
                    disabled={disabled}
                    id="pmweb_turnaroundtime_hours_field"
                  />
                </Grid>
                <Grid item>
                  <Typography className={classes.labelAfter}>
                    {t("hours")}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={isDrawerExpanded ? 3 : 4}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs>
                  <Field
                    type="number"
                    name="Minutes"
                    step={1}
                    min={0}
                    max={59}
                    value={minutes}
                    onChange={handleChange}
                    disabled={disabled}
                    id="pmweb_turnaroundtime_minutes_field"
                  />
                </Grid>
                <Grid item>
                  <Typography className={classes.labelAfter}>
                    {t("minutes")}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={isDrawerExpanded ? 3 : 5}>
              <Grid container spacing={1}>
                <Grid item xs>
                  <div style={{ minWidth: minWidth }}>
                    <Field
                      dropdown={true}
                      minHeight="var(--line_height)"
                      height="auto" //Bug 124385- Added the height & minHeight
                      id="pmweb_turnaroundtime_workingdayscalender_field"
                      label={calendarTypeLabel}
                      name={"CalendarType"}
                      value={calendarType}
                      onChange={handleChange}
                      disabled={disabled}
                      options={[
                        { name: "Working Day(s)", value: "Y" },
                        { name: "Calender Day(s)", value: "N" },
                      ]}
                    />
                  </div>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default TurnAroundTime;
