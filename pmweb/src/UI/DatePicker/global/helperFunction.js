import moment from "moment";
import hijriMoment from "moment-hijri";
import { useSelector } from "react-redux";

const calendarVariables = {
  //calendar format for backend
  dateFormat: "YYYY-MM-DD",
  timeFormat: "HH:mm:ss",
  dateTimeFormat: "YYYY-MM-DD HH:mm:ss",
  isApplied: true,
};

export const RegexDateTimeChecker = (inputValue) => {
  // Define a regular expression for the datetime format (YYYY-MM-DD HH:MM:SS)
  const datetimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  return datetimeRegex.test(inputValue);
};

export const RegexDateChecker = (inputValue) => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  return dateRegex.test(inputValue);
};

const convertToDbDateFormat = (stdDate, dateType) => {
  const dateString = stdDate;
  const dateObject = new Date(dateString);

  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Adding 1 to month since months are zero-based
  const day = String(dateObject.getDate()).padStart(2, "0");
  const hour = String(dateObject.getHours()).padStart(2, "0");
  const minute = String(dateObject.getMinutes()).padStart(2, "0");
  const second = String(dateObject.getSeconds()).padStart(2, "0");

  if (dateType === "shortDate") {
    return `${year}-${month}-${day}`;
  } else if (dateType === "longDate") {
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
};

const useMomentt = () => {
  const allGlobalSettings = useSelector((store) => store.globalSettingsReducer);
  const GlobalInisState = allGlobalSettings?.globalInis; // should be fetch from getloginconf api (key :locale_type)

  let dateLibrary;

  switch (GlobalInisState?.locale_type) {
    case "0":
      dateLibrary = moment;
      break;
    case "1":
    case "2":
      dateLibrary = hijriMoment;
      break;
    default:
      dateLibrary = moment;
      break;
  }
  return dateLibrary;
};

export { useMomentt, convertToDbDateFormat };
