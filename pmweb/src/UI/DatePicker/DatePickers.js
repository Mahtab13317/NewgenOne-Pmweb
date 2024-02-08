import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import stylesheet from "../../components/Form/style.module.css";
import {
  FormHelperText,
  Tooltip,
  Typography,
  withStyles,
  makeStyles,
} from "@material-ui/core";
// import { IconImage, makeStyles, useTranslation, useTheme } from "component";
import { IconImage } from "../../components/Icon/index";
import "react-datetime/css/react-datetime.css";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";
// import moment from 'moment';
// import "moment/locale/ar-sa";
// import moment  from 'moment-hijri'
import "./index.css";

//mui datepicker imports
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { AdapterMomentHijri } from "@mui/x-date-pickers/AdapterMomentHijri";
// import hijriMoment from 'moment-hijri';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { convertToDbDateFormat, useMomentt } from "./global/helperFunction";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import useTheme from "@mui/system/useTheme";
import { createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import { ar } from "date-fns/locale";
import { useTranslation } from "react-i18next";
// import { SET_CALENDAR_OPEN } from "redux/action";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    background: "#606060 0% 0% no-repeat padding-box",
    borderRadius: "2px",
    height: "24px",
    color: "white",
  },
}))(Tooltip);

const useStyle = makeStyles((theme) => {
  return {
    container1: {
      display: "flex",
      flexDirection: "column",
      // alignItems: props => (props.direction == 'ltr' ? 'start' : 'end'),
      direction: (props) => props.direction,
      justifyContent: (props) =>
        props.direction == "ltr" ? "flex-start" : "flex-end",
      alignItems: "flex-start",
    },
    required_field: {
      color: "red",
    },

    pickerContainer: {
      background: "#fff !important",
      boxShadow: "0 0.083rem 0.25rem rgb(0 0 0 / 10%) !important",
      border: "0.083rem solid #f9f9f9 !important",
      borderRadius: "0% !important",
      minHeight: "110px !important",
      margin: "0rem !important",
    },
    inputDate: {
      "& input": {
        borderRadius: "2px",
        height: (props) => props.height,
        width: (props) => props.width,
        border: `0.083rem solid ${theme.palette.borderColor}`,
        fontSize: "11px",
        paddingLeft: "5px",
        "&::placeholder": {
          fontSize: "11px",
        },
      },
      "& .input_calender": {
        position: "relative",
        cursor: (props) => (props.disabled ? "default" : "pointer"),
        "& .wrapper_image": {
          position: "absolute",
          right: (props) => (props.direction === "ltr" ? "0.333rem" : "none"),
          left: (props) => (props.direction === "ltr" ? "none" : "0.333rem"),
          height: "1.333rem",
          top: "50%",
          transform: "translateY(-50%)",
        },
        "& .wrapper_action": {
          position: "absolute",
          right: (props) => (props.direction === "ltr" ? "0.083rem" : "none"),
          left: (props) => (props.direction === "ltr" ? "none" : "0.083rem"),
          height: "1.333rem",
          top: "35%",
          transform: "translateY(-50%)",
        },
      },
      "& .rdtPicker": {
        top: (props) =>
          props.viewMode === "time" && props.onlyTimePickerPositionTop
            ? props.onlyTimePickerPositionTop
            : props.align === "top"
            ? props.pickerTopPosition
            : props.align === "left"
            ? "-50%"
            : "28px",
        left: (props) =>
          props.align === "top" || props?.isLast
            ? props.pickerLeftPosition
              ? props.pickerLeftPosition
              : "0"
            : 0,
        right: (props) => (props.direction === "rtl" ? "-25px" : ""),
        padding: 0,
        border: "none",
        "& table": {
          direction: (props) => props.direction,
        },
      },
    },
    container: {
      direction: (props) => props.direction,
      display: (props) => (props.displayFlex ? "flex" : ""),
      alignItems: "center",
    },
    input_label_root: { display: "contents" },
    input_label: (props) => {
      return {
        ...theme.typography.input_label,
        minWidth: props.labelMinWidth,
        maxWidth: props.labelMaxWidth,
        fontSize: props.fontSize,
        fontWeight: props.fontWeight,
        color: props.fontColor,
        margin: props.margin,
        // textAlign: props.direction == 'ltr' ? 'left' : 'right',
        textAlign: props.labelStyle.textAlign
          ? props.labelStyle.textAlign
          : props.direction === "ltr"
          ? "left"
          : "right",
        padding: props.labelStyle.padding ? props.labelStyle.padding : null,
        cursor: "default",
      };
    },
  };
});

export const DatePickers = (props) => {
  const allGlobalSettings = useSelector((store) => store.globalSettingsReducer);
  const globalSettings = allGlobalSettings?.globalSettings;
  const GlobalInisState = allGlobalSettings?.GlobalInisState;
  const { t } = useTranslation();
  const moment = useMomentt();

  const [locale, setLocale] = useState(
    GlobalInisState?.locale_type === "0"
      ? "0"
      : GlobalInisState?.locale_type === "2"
      ? "2"
      : ""
  );
  const direction = `${t("HTML_DIR")}`;
  const isEnglish =
    (locale === "0" || locale === "1" || locale === "2") && direction === "ltr";
  const isArabic = locale === "0" && direction === "rtl";
  const isArabicHijri = locale === "1" && direction === "rtl";
  const isAllHijri = locale === "2" && direction === "rtl";
  const [isClear, setIsClear] = useState(false);
  const [clearHappening, setClearHappening] = useState(false);
  const [viewMode, setViewMode] = useState("");

  if (isAllHijri) {
    require("moment/locale/ar-sa");
  }

  const {
    id = "",
    label = null,
    helperText = null,
    changeOpenCalender = false,
    width = "150px",
    height = "27px",
    value = "",
    initialValue = "",
    onChange = null,
    relative = false,
    name = "input_box",
    labelMinWidth = "95px",
    labelMaxWidth = "95px",
    disabled = false,
    align = "bottom",
    pickerTopPosition = "-280px",
    pickerLeftPosition = "",
    onlyTimePickerPositionTop = false,
    form = true,
    isLast = false,
    required = false,
    onOpenCalender = () => {},
    dateFormat = globalSettings.date_format
      ? globalSettings.date_format
      : "DD/MMM/YYYY",
    placeholder = globalSettings.date_format
      ? globalSettings.date_format
      : "DD/MMM/YYYY",
    timeFormat = "HH:mm:ss", // to disable time just pass 'false' boolean
    className = "",
    defaultValues = false,
    disableBefore = isArabicHijri || isAllHijri
      ? `1937-03-14`
      : `${moment().subtract(10, "year").format("DD/MMM/YYYY")}`,
    disableAfter = isArabicHijri || isAllHijri
      ? `2076-11-26`
      : isEnglish
      ? `${moment().add(101, "year").format("DD/MMM/YYYY")}`
      : `${moment().add(101, "year").format("DD/MMM/YYYY")}`,
    onFocusCallback = null,
    // direction = t('common:HTML_DIR'),
    calenderRequired = true,
    containerRight = "",
    readOnly = true,
    description = { msg: "" },
    fontSize = "1rem",
    fontWeight = "600",
    displayFlex = true,
    fontColor = "rgb(96, 96, 96)",
    margin = "",
    hideCalendarIcon,
    calanderWidth = "250px",
    // disablePast,
    timeConstraints = false,
    enableSafariFormatCheck = false,
    formatTimeAndDate = false,
    showClear = false,
    clearParent = () => {},
    customMargin = "",
    closeOnSelect = false,
    disablePast = false,
    disableFuture = false,
    // setReminderTime = false,
    pickerPosition = "auto",
    onClose = () => {},
    showSavedTimeFormat = false,
    onAcceptInput = false, // callback called when clicked on Ok
    onAccept = () => {},
    autoFocusProp = false,
    inputFocus = false,
    setCalendarOpen,
    ariaLabel = "",
    labelStyle = {},
    ...rest
  } = props;

  const classes = useStyle({
    labelMinWidth,
    labelMaxWidth,
    align,
    pickerTopPosition,
    pickerLeftPosition,
    direction,
    height,
    disabled,
    form,
    fontSize,
    width,
    fontWeight,
    isLast,
    displayFlex,
    fontColor,
    margin,
    onlyTimePickerPositionTop,
    viewMode,
    labelStyle,
  });

  const clearDate = () => {
    setIsClear(true);
    setClearHappening(true);
  };
  const dispatch = useDispatch();
  const onChangeHandler = (val) => {
    if (!clearHappening) {
      if (showClear && val === "") {
        onChange({ target: { name: name, val: "", value: "" } }, clearDate);
      } else if (timeFormat && dateFormat) {
        onChange(
          {
            target: {
              name: name,
              val: val,
              // value: isArabic ? momentToDateFns(val) : moment(val._d).format(`DD/MMM/YYYY ${timeFormat}`),
              value: isAllHijri
                ? convertToDbDateFormat(val._d, "longDate")
                : val?._d
                ? moment(val._d).locale("en").format("YYYY-MM-DD HH:mm:ss")
                : moment(val).locale("en").format("YYYY-MM-DD HH:mm:ss"),
            },
          },
          clearDate
        );
      } else if (timeFormat) {
        onChange(
          {
            target: {
              val: val,
              name: name,
              value: moment(val)
                .locale("en")
                .format(showSavedTimeFormat ? "HHmm" : "HH:mm:ss"),
            },
          },
          clearDate
        );
      } else {
        onChange(
          {
            target: {
              val: val,
              name: name,
              // value: isArabic ? momentToDateFns(val) : moment(val._d).format('DD/MMM/YYYY'),
              value: isAllHijri
                ? convertToDbDateFormat(val._d, "shortDate")
                : val?._d
                ? moment(val._d).locale("en").format("YYYY-MM-DD")
                : moment(val).locale("en").format("YYYY-MM-DD"),
            },
          },
          clearDate
        );
      }
    } else setClearHappening(false);
  };

  //new MUI calendar implementation from here
  const views =
    timeFormat === false
      ? ["year", "month", "day"]
      : dateFormat === false
      ? timeFormat && timeFormat.toLowerCase() === "hh:mm"
        ? ["hours", "minutes"]
        : ["hours", "minutes", "seconds"]
      : timeFormat && timeFormat.toLowerCase() === "hh:mm"
      ? ["year", "month", "day", "hours", "minutes"]
      : ["year", "month", "day", "hours", "minutes", "seconds"];
  const ampm =
    (timeFormat && timeFormat.toLowerCase() === "hh:mm:ss") ||
    (timeFormat && timeFormat.toLowerCase() === "hh:mm")
      ? false
      : true;
  // const format = timeFormat === false ? isArabic ? 'dd/MMM/yyyy' : isArabicHijri ?'iDD/iMMM/iYYYY': dateFormat : dateFormat === false ? timeFormat : ampm ? 'DD/MMM/YYYY hh:mm:ss A' : 'DD/MMM/YYYY HH:mm:ss';
  let format;
  let placeholderNew;

  switch (true) {
    case timeFormat === false && isArabic:
      format = "dd/MMM/yyyy";
      placeholderNew = "DD/MMM/YYYY";
      break;

    case (timeFormat === false && isArabicHijri) ||
      (timeFormat === false && isAllHijri):
      format = "iDD/iMMM/iYYYY";
      placeholderNew = "DD/MMM/YYYY";
      break;
    /*code edited on 17 Aug 2023 for Bug 134180 - Regression : process designer -> Audit logs-> From 
    and to format is wrong and calender is not aligned properly and selected date not displayed in 
    from and to fields (not sure if we selected any date then which day should be fall under date. */
    case timeFormat === false && !!dateFormat:
      format = isEnglish ? dateFormat.toUpperCase() : dateFormat;
      placeholderNew = isEnglish ? dateFormat.toUpperCase() : dateFormat;
      break;
    // case timeFormat === false && !!dateFormat:
    //   format = dateFormat;
    //   placeholderNew = dateFormat;
    //   break;

    case dateFormat === false &&
      !!timeFormat &&
      (timeFormat.toLowerCase() === "hh:mm:ss" ||
        timeFormat.toLowerCase() === "hh:mm:ss a"):
      format = "HH:mm:ss";
      placeholderNew = "HH:mm:ss";
      break;
    case dateFormat === false &&
      !!timeFormat &&
      (timeFormat.toLowerCase() === "hh:mm" ||
        timeFormat.toLowerCase() === "hh:mm a"):
      format = "HH:mm";
      placeholderNew = "HH:mm";
      break;

    case ampm && isArabic:
      // format = 'dd/MMM/yyyy hh:mm:ss A';   for: Bug 131626
      format = "dd/MMM/yyyy HH:mm:ss";
      placeholderNew = "DD/MMM/YYYY HH:mm:ss";
      break;

    case (ampm && isArabicHijri) || (ampm && isAllHijri):
      // format = 'iDD/iMMM/iYYYY hh:mm:ss A';  for: Bug 131626
      format = "iDD/iMMM/iYYYY HH:mm:ss";
      placeholderNew = "DD/MMM/YYYY HH:mm:ss";
      break;

    case ampm:
      // format = 'DD/MMM/YYYY hh:mm:ss A';
      format = "DD/MMM/YYYY HH:mm:ss";
      placeholderNew = "DD/MMM/YYYY HH:mm:ss";
      break;

    case isArabic:
      format = "dd/MMM/yyyy HH:mm:ss";
      placeholderNew = "DD/MMM/YYYY HH:mm:ss";
      break;

    case isArabicHijri || isAllHijri:
      format = "iDD/iMMM/iYYYY HH:mm:ss";
      placeholderNew = "DD/MMM/YYYY HH:mm:ss";
      break;

    default:
      format = "DD/MMM/YYYY HH:mm:ss";
      placeholderNew = "DD/MMM/YYYY HH:mm:ss";
      break;
  }

  // const initialLabel = timeFormat === false ? 'DD/MMM/YYYY' : dateFormat === false ? 'HH:MM' : 'DD/MM/YYYY HH:MM';
  const [momentVal, setMomentVal] = useState(
    isArabic
      ? momentToDateFns(moment(value))
      : dateFormat === false
      ? moment("00:00:00", "HH:mm:ss")
      : moment(value)
  );
  const [momentdisableBefore, setMomentDisableBefore] = useState(
    // isArabic ? momentToDateFns(moment(disableBefore, 'DD/MMM/YYYY')) : moment(disableBefore, 'DD/MMM/YYYY'),
    isArabic ? momentToDateFns(moment(disableBefore)) : moment(disableBefore)
  );
  const [momentdisableAfter, setMomentDisableAfter] = useState(
    // isArabic ? momentToDateFns(moment(disableAfter, 'DD/MMM/YYYY')) : moment(disableAfter, 'DD/MMM/YYYY'),
    isArabic ? momentToDateFns(moment(disableAfter)) : moment(disableAfter)
  );
  // const disablePastTime = setReminderTime === true ? moment() : null;

  useEffect(() => {
    // setMomentVal(isArabic ? momentToDateFns(moment(value)) : moment(value));
    setMomentVal(
      isArabic
        ? momentToDateFns(moment(value))
        : dateFormat
        ? moment(value)
        : moment(value, "HH:mm")
    );
    setMomentDisableBefore(
      // isArabic ? momentToDateFns(moment(disableBefore, 'DD/MMM/YYYY')) : moment(disableBefore, 'DD/MMM/YYYY'),
      isArabic ? momentToDateFns(moment(disableBefore)) : moment(disableBefore)
    );
    setMomentDisableAfter(
      isArabic ? momentToDateFns(moment(disableAfter)) : moment(disableAfter)
    );
  }, [value, disableBefore, disableAfter]);

  // const locale_type = '0-Default (English and Non-Hijri Arabic), 1=Hijri English format, 2=Hijri Arabic format'
  useEffect(() => {
    if (GlobalInisState?.locale_type === "0") {
      setLocale("0"); //'English(geogergian)'
    } else if (GlobalInisState?.locale_type === "1") {
      setLocale("1"); //'Engish hijri day/year &(urdu Hijri month)'
    } else if (GlobalInisState?.locale_type === "2") {
      setLocale("2"); //'urdu hijri day/year &(urdu Hijri month)''
    } else {
      setLocale("0"); //'English(geogergian)'
    }
  }, [GlobalInisState]);

  const existingTheme = useTheme();
  const theme = React.useMemo(
    () => createTheme({ direction: direction }, existingTheme),
    [existingTheme, direction]
  );

  // moment to date obj convertor
  function momentToDateFns(momentDate) {
    let dateObj;
    if (isArabic && momentDate.hasOwnProperty("_d")) {
      dateObj = momentDate?._d;
    } else {
      dateObj = momentDate;
    }
    const dateFnsDate = dateObj ? new Date(dateObj) : new Date();
    return dateFnsDate;
  }

  return (
    <div
      className={`${
        !form ? classes.container : classes.container1
      } ${className}`}
      id={`dateInputWrapper${id ? "-" + id : ""}`}
      style={{
        margin: customMargin,
        textAlign: direction === "ltr" ? "left" : "right",
      }}
    >
      {label != null && label.length !== 0 && (
        <React.Fragment>
          <Tooltip
            shrink
            htmlFor={name}
            className={stylesheet.labeltype}
            classes={{ root: clsx(classes.input_label_root, "base_text") }}
            title={label}
            arrow
          >
            <Typography
              noWrap={true}
              variant="div"
              className={classes.input_label}
            >
              {label}
              {required && <span className={classes.required_field}>*</span>}
              {description.msg !== "" && (
                <HtmlTooltip
                  direction={"ltr"}
                  title={
                    <React.Fragment>
                      <div style={{ background: "#606060" }}>
                        <Typography
                          style={{ fontSize: "11px", color: "white" }}
                        >
                          {description.msg}
                        </Typography>
                      </div>
                    </React.Fragment>
                  }
                >
                  <IconImage
                    style={{
                      margin:
                        direction === "ltr" ? "0 0 0 5px" : "0 0.417rem 0 0",
                    }}
                    height={14}
                    width={14}
                    url={`${process.env.REACT_APP_CONTEXT_PATH}/icons/info_icon.svg`}
                  />
                </HtmlTooltip>
              )}
            </Typography>
          </Tooltip>
        </React.Fragment>
      )}
      <div style={{ width: width }}>
        <ThemeProvider theme={theme}>
          <div dir={direction}>
            <LocalizationProvider
              dateAdapter={
                isArabic
                  ? AdapterDateFns
                  : isArabicHijri || isAllHijri
                  ? AdapterMomentHijri
                  : AdapterMoment
              }
              adapterLocale={isArabic && ar}
            >
              {timeFormat === false ? (
                <DatePicker
                  // label={initialLabel}
                  disabled={disabled}
                  // onOpen={() => dispatch(SET_CALENDAR_OPEN(true))}
                  // onClose={() => dispatch(SET_CALENDAR_OPEN(false))}
                  format={format}
                  views={views}
                  sx={{
                    width: width,
                    "& .MuiInputAdornment-root": {
                      margin:
                        direction === "ltr" ? "-30px !important" : "-12px",
                    },
                    "& .MuiInputBase-root": {
                      /*code edited on 17 Aug 2023 for Bug 134180*/
                      paddingInlineEnd: "1vw",
                      paddingInlineStart: "0",
                      borderRadius: "2px",
                    },
                    "& .MuiIconButton-root": {
                      margin: "0 !important",
                    },
                  }}
                  id={id}
                  maxDate={
                    isArabic && disableAfter === ""
                      ? momentToDateFns(moment().add(101, "years"))
                      : isAllHijri
                      ? // ? moment(new Date(2075, 11, 31))
                        momentdisableAfter
                      : momentdisableAfter
                  }
                  // minDate={isAllHijri ? moment(new Date(1938, 0, 1)) : momentdisableBefore}
                  minDate={momentdisableBefore}
                  // closeOnSelect={closeOnSelect}
                  value={momentVal}
                  onChange={(val) => {
                    onChangeHandler(val);
                  }}
                  slots={{
                    leftArrowIcon: ArrowBackIosIcon,
                    rightArrowIcon: ArrowForwardIosIcon,
                  }}
                  slotProps={{
                    popper: {
                      popperOptions: {
                        placement: pickerPosition,
                      },
                    },
                    day: {
                      className: "datePickerCustomization",
                    },
                    textField: {
                      placeholder: placeholderNew,
                      id: id,
                      // 'aria-label': 'DatePicker'
                      inputProps: {
                        "aria-label": `${ariaLabel} Date picker`,
                        border: "1px solid transparent !important",
                        boxShadow: "0px 0px transparent !important",
                      },
                    },
                  }}
                  defaultValue={initialValue}
                  clearable={true}
                  disablePast={disablePast}
                  disableFuture={disableFuture}
                  localeText={{
                    okButtonLabel:
                      isArabic || isArabicHijri || isAllHijri ? "نعم" : "Ok",
                    cancelButtonLabel:
                      isArabic || isArabicHijri || isAllHijri
                        ? "يلغي"
                        : "Cancel",
                    fieldYearPlaceholder: () => "YYYY",
                    fieldMonthPlaceholder: () => "MMM",
                    fieldDayPlaceholder: () => "DD",
                  }}
                  autoFocus={autoFocusProp || inputFocus}
                />
              ) : dateFormat === false ? (
                <TimePicker
                  disabled={disabled}
                  format={format}
                  views={views}
                  // onOpen={setCalendarOpen(true)}
                  // onClose={setCalendarOpen(false)}
                  sx={{
                    width: width,
                    "& .MuiInputAdornment-root": {
                      margin:
                        direction === "ltr" ? "-30px !important" : "-12px",
                    },
                  }}
                  // maxTime={disableAfter}
                  // minTime={disableBefore}
                  closeOnSelect={false}
                  value={momentVal}
                  onChange={(val) => {
                    onChangeHandler(val);
                  }}
                  defaultValue={moment("00:00:00", "HH:mm:ss")}
                  slotProps={{
                    popper: {
                      popperOptions: {
                        placement: pickerPosition,
                      },
                    },
                    textField: {
                      placeholder: placeholderNew,
                      inputProps: { "aria-label": `${ariaLabel} Time picker` },
                    },
                  }}
                  // ampm={ampm} //Bug 131626
                  ampm={false}
                  clearable={true}
                  disablePast={disablePast}
                  // minTime={disablePastTime}
                  disableFuture={disableFuture}
                  localeText={{
                    okButtonLabel:
                      isArabic || isArabicHijri || isAllHijri ? "نعم" : "Ok",
                    cancelButtonLabel:
                      isArabic || isArabicHijri || isAllHijri
                        ? "يلغي"
                        : "Cancel",
                    fieldHoursPlaceholder: () => "HH",
                    fieldMinutesPlaceholder: () => "mm",
                    fieldSecondsPlaceholder: () => "ss",
                    // fieldMeridiemPlaceholder: () => 'aa',   //no need if 24 hour format
                  }}
                  // onOpen={() => dispatch(SET_CALENDAR_OPEN(true))}
                  onClose={() => {
                    onClose();
                    // dispatch(SET_CALENDAR_OPEN(false));
                  }}
                  timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                  autoFocus={autoFocusProp || inputFocus}
                />
              ) : (
                <DateTimePicker
                  disabled={disabled}
                  format={format}
                  views={views}
                  sx={{
                    width: width,
                    "& .MuiInputAdornment-root": {
                      margin:
                        direction === "ltr" ? "-30px !important" : "-12px",
                    },
                    "& .MuiInputBase-root": {
                      paddingInlineEnd: "1vw",
                      paddingInlineStart: "0",
                      borderRadius: "2px",
                    },
                  }}
                  closeOnSelect={false}
                  value={momentVal}
                  onChange={(val) => {
                    onChangeHandler(val);
                  }}
                  slots={{
                    leftArrowIcon: ArrowBackIosIcon,
                    rightArrowIcon: ArrowForwardIosIcon,
                  }}
                  slotProps={{
                    popper: {
                      popperOptions: {
                        placement: pickerPosition,
                      },
                    },
                    day: {
                      className: "datePickerCustomization",
                    },
                    textField: {
                      placeholder: placeholderNew,
                      inputProps: {
                        "aria-label": `${ariaLabel} Date time picker`,
                      },
                    },
                  }}
                  // ampm={ampm}
                  ampm={false}
                  clearable={true}
                  // onOpen={() => dispatch(SET_CALENDAR_OPEN(true))}
                  onClose={() => {
                    // dispatch(SET_CALENDAR_OPEN(false));
                    onClose();
                  }}
                  onAccept={(val) => {
                    onAcceptInput &&
                      onAccept({
                        target: {
                          name: name,
                          val: val,
                          value: isArabic
                            ? momentToDateFns(val)
                            : moment(val._d).format(
                                `DD/MMM/YYYY ${timeFormat}`
                              ),
                        },
                      });
                  }}
                  disablePast={disablePast}
                  // minTime={disablePastTime}
                  disableFuture={disableFuture}
                  maxDate={
                    isArabic && disableAfter === ""
                      ? momentToDateFns(moment().add(101, "years"))
                      : isAllHijri
                      ? // ? moment(new Date(2075, 11, 31))
                        momentdisableAfter
                      : momentdisableAfter
                  }
                  // minDate={isAllHijri ? moment(new Date(1938, 0, 1)) : momentdisableBefore}
                  minDate={momentdisableBefore}
                  localeText={{
                    okButtonLabel:
                      isArabic || isArabicHijri || isAllHijri ? "نعم" : "Ok",
                    cancelButtonLabel:
                      isArabic || isArabicHijri || isAllHijri
                        ? "يلغي"
                        : "Cancel",
                    fieldYearPlaceholder: () => "YYYY",
                    fieldMonthPlaceholder: () => "MMM",
                    fieldDayPlaceholder: () => "DD",
                    fieldHoursPlaceholder: () => "HH",
                    fieldMinutesPlaceholder: () => "mm",
                    fieldSecondsPlaceholder: () => "ss",
                  }}
                  timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                  autoFocus={autoFocusProp || inputFocus}
                />
              )}
              {helperText != null && form && (
                <FormHelperText
                  id="my-helper-text"
                  className={classes.helper_text}
                >
                  {helperText}
                </FormHelperText>
              )}
            </LocalizationProvider>
          </div>
        </ThemeProvider>
      </div>
    </div>
  );
};

DatePickers.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  required: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  helperText: PropTypes.string,
  labelMinWidth: PropTypes.string,
  labelMaxWidth: PropTypes.string,
  disabled: PropTypes.bool,
  align: PropTypes.string, // bottom || top || left
  form: PropTypes.bool,
  dateFormat: PropTypes.string, // "DD/MM/YYYY" || false
  timeFormat: PropTypes.string || PropTypes.bool, // "h:mm A" || false
  className: PropTypes.string,
  direction: PropTypes.string,
  disableBefore: PropTypes.string,
  disableAfter: PropTypes.string,
  onFocusCallback: PropTypes.func,
  onOpenCalender: PropTypes.func,
  calenderRequired: PropTypes.bool,
  readOnly: PropTypes.bool,
};
