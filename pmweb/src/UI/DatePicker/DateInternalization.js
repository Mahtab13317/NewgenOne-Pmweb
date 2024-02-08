import {
  RegexDateChecker,
  RegexDateTimeChecker,
} from "./global/helperFunction";
import moment from "moment";
import { isArabicLocaleSelected } from "../../utility/CommonFunctionCall/CommonFunctionCall";

export function convertToArabicDateTime(dateString) {
  let localeType = localStorage.getItem("calenderType");
  let direction = isArabicLocaleSelected() ? "rtl" : "ltr";

  if (!dateString) {
    return "";
  }
  let localeCode;

  let yearDatepick = RegexDateTimeChecker(dateString);
  if (!yearDatepick) {
    return dateString;
  }
  if (!yearDatepick) {
    return dateString;
  }

  if (["0", "1", "2"].includes(localeType) && direction === "ltr") {
    localeCode = "en-GB";
  } else if (localeType === "0" && direction === "rtl") {
    localeCode = "ar";
  } else if (localeType === "1" && direction === "rtl") {
    localeCode = "ar-u-ca-islamic-umalqura-nu-latn";
  } else if (localeType === "2" && direction === "rtl") {
    localeCode = "ar-SA";
  }
  const dateParts = dateString.split("-");
  const year = yearDatepick
    ? parseInt(dateParts[0], 10)
    : parseInt(dateParts[2], 10);
  const month = parseInt(dateParts[1], 10);
  const day = yearDatepick
    ? parseInt(dateParts[2], 10)
    : parseInt(dateParts[0], 10);
  const time = dateParts[2].split(" ")[1].split(":");

  const hour =
    yearDatepick && time ? parseInt(time[0], 10) : parseInt(dateParts[0], 10);

  const minute =
    yearDatepick && time ? parseInt(time[1], 10) : parseInt(dateParts[0], 10);

  const second =
    yearDatepick && time ? parseInt(time[2], 10) : parseInt(dateParts[0], 10);
  let localeDate = new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date(year, month - 1, day, hour, minute, second));
  if (direction === "ltr") {
    return localeDate.split(" ").join("/").split(",/").join(" ");
  } else {
    return localeDate.split(" ").join("/");
  }
}

export function convertToArabicDate(dateString) {
  let localeType = localStorage.getItem("calenderType");
  // let localeType = "1";
  let direction = isArabicLocaleSelected() ? "rtl" : "ltr";

  if (!dateString) {
    return "";
  }
  let localeCode = "en-GB";
  let yearDatepick = RegexDateChecker(dateString);
  if (!yearDatepick) {
    return dateString;
  }
  if (["0", "1", "2"].includes(localeType) && direction === "ltr") {
    localeCode = "en-GB";
  } else if (localeType === "0" && direction === "rtl") {
    localeCode = "ar";
  } else if (localeType === "1" && direction === "rtl") {
    localeCode = "ar-u-ca-islamic-umalqura-nu-latn";
  } else if (localeType === "2" && direction === "rtl") {
    localeCode = "ar-SA";
  }
  const dateParts = dateString.split("-");
  const year = yearDatepick
    ? parseInt(dateParts[0], 10)
    : parseInt(dateParts[2], 10);
  const month = parseInt(dateParts[1], 10);
  const day = yearDatepick
    ? parseInt(dateParts[2], 10)
    : parseInt(dateParts[0], 10);
  let localeDate = new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));

  return localeDate.split(" ").join("/");
}

//   For date Format converter
export const convertDateFormat = (date) => {
  return moment(date).locale("en").format("YYYY-MM-DD");
};

// for multiple date formate eg:- 20/Jul/2023,07/Jul/2023
export const convertMultipleDateFormat = (date) => {
  let splittedDate = date?.split(",");
  let arr = splittedDate.map((ele) => {
    return convertDateFormat(ele);
  });
  return arr.toString();
};

// for backend date to locale
export const convertToMultipleLocale = (date, direction) => {
  let splittedDate = date?.split(",");
  let arr = splittedDate.map((ele) => {
    return convertToArabicDate(ele, direction);
  });
  return arr.toString();
};

//dd-mm-yyyy
export const convertToNormalDate = (date) => {
  return moment(date, "DD-MMM-YYYY").format("DD-MM-YYYY");
};

//dd/mmm/yyyy
export const convertToDisplayDate = (dateString, direction) => {
  let localeType = localStorage.getItem("calenderType");
  let localeCode;

  if (localeType === "0" && direction === "ltr") {
    localeCode = "en-GB";
  } else if (localeType === "0" && direction === "rtl") {
    localeCode = "ar-EH";
  }
  const dateParts = dateString.split("-");
  const year = parseInt(dateParts[2], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[0], 10);
  let localeDate = new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(year, month - 1, day));
  return localeDate.split(" ").join("/");
};

// to YYYY-MM-DD from any formate with given formate
export const convertFromToAnyFormat = (date, formatFrom, formatTo) => {
  let trimmed = date.trim();
  return moment(trimmed, formatFrom).format(formatTo);
};

// any type input date will be converted to dd/mmm/yyyy and also work on multiple date and should be sepreate by ,
export function convertToLocalizedDates(dateStrings, direction) {
  const supportedLanguages = ["en", "ar", "ar-SA", "en-GB"]; // Add more supported languages as needed

  let localeType = localStorage.getItem("calenderType");

  let localeCode = "en-GB"; // Default to English (United Kingdom) if the provided language is not supported
  let language = "en-GB";
  if (localeType === "0" && direction === "ltr") {
    language = "en-GB";
  } else if (localeType === "0" && direction === "rtl") {
    language = "ar";
  } else if (localeType === "1" && direction === "ltr") {
    language = "ar";
  } else if (localeType === "2") {
    language = "ar-SA";
  }

  if (supportedLanguages.includes(language)) {
    localeCode = language;
  }

  const options = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };

  const dates = dateStrings.split(",").map((dateString) => {
    const dateObj = new Date(dateString.trim());
    if (isNaN(dateObj)) {
      // If the input date is invalid, return an empty string
      return "";
    }

    return dateObj.toLocaleDateString(localeCode, options).split(" ").join("/");
  });

  return dates.join(", ");
}
