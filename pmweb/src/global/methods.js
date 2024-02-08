import moment from "moment";
import Cookies from "js-cookie";
import secureLocalStorage from "react-secure-storage";
import { encryptSessionStorage } from "utils/EncryptStorage";

const capitalize = (data) => {
  return data && data[0].toUpperCase() + data.slice(1);
};
const delayMethod = (method, delay) => {
  let timer;
  return function () {
    let context = this,
      args = arguments;
    clearTimeout(timer);
    timer = setTimeout(() => {
      method.apply(context, args);
    }, delay);
  };
};
const EmptyObject = (obj) => {
  if (typeof obj === "object") {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  } else {
    return false;
  }
};

const dbToLocalDate = (date = "", type = "short") => {
  if (moment(date).isValid()) {
    const format = type === "short" ? "DD/MMM/YYYY" : "DD/MMM/YYYY HH:mm:ss";
    return moment(date)?.locale("en")?.format(format);
  }
  return date;
};

const localToDBDate = (date = "", type = "short") => {
  if (moment(date).isValid()) {
    const initialformat =
      type === "short" ? "DD/MMM/YYYY" : "DD/MMM/YYYY HH:mm:ss";
    const format = type === "short" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss";
    return moment(date, initialformat)?.locale("en")?.format(format);
  }
  return date;
};

const convertDateFunc = (currentDate, currentFormatString, newFormatString) => {
  const newDate = moment(currentDate, currentFormatString).format(
    newFormatString
  );
  return newDate;
};

const convertArrayKeys = (arr = [], inputkeys = [], outputkeys = []) => {
  const mapedArray = arr.map((items) => {
    let obj = { ...items };
    for (let i = 0; i < outputkeys.length; i++) {
      if (outputkeys[i] !== inputkeys[i]) {
        obj[outputkeys[i]] = items[inputkeys[i]];
        delete obj[inputkeys[i]];
      }
    }
    return obj;
  });
  return mapedArray;
};

const encode_utf8 = (ch) => {
  var ENCODING = "UTF-8";
  var hexArr = new Array(
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F"
  );

  if (ENCODING.toUpperCase() != "UTF-8") return escape(ch);

  return encodeURIComponent(ch);

  var i, bytes;
  var utf8 = new String();
  var temp;

  for (i = 0, bytes = 0; i < ch.length; i++) {
    temp = ch.charCodeAt(i);
    if (temp < 0x80) {
      utf8 += String.fromCharCode(temp);
    } else if (temp < 0x0800) {
      utf8 += String.fromCharCode((temp >> 6) | 0xc0);
      utf8 += String.fromCharCode((temp & 0x3f) | 0x80);
    } else {
      utf8 += String.fromCharCode((temp >> 12) | 0xe0);
      utf8 += String.fromCharCode(((temp >> 6) & 0x3f) | 0x80);
      utf8 += String.fromCharCode((temp & 0x3f) | 0x80);
    }
  }

  if (navigator.appName.indexOf("Netscape") == -1) {
    return escape(utf8);
  }
  var esc = new String();
  for (var l = 0; l < utf8.length; l++) {
    if (utf8.charCodeAt(l) < 128) esc += escape(utf8[l]);
    else {
      esc += "%";
      esc += hexArr[utf8.charCodeAt(l) >> 4];
      esc += hexArr[utf8.charCodeAt(l) & 0xf];
    }
  }
  return esc;
};

const HasAuthToken = () => {
  if (secureLocalStorage.getItem("launchpadKey")) return true;
  else if (encryptSessionStorage.getItem("Authorization")) return true;
  // else if (secureLocalStorage.getItem('Authorization')) return true;
  else return false;
};

const invalidSessionHandler = (res) => {
  if (res?.status === 200) {
    if (invalidMaincodes.includes(+res?.data?.status?.maincode)) manageLogout();
    else return res;
  } else if (res?.response?.status === 401) manageLogout();
  else if (res?.response?.status === 400) return res;
  return null;
};

const clearCacheData = () => {
  caches.keys().then((names) => {
    names.forEach((name) => {
      caches.delete(name);
    });
  });
};
const clearCookiesData = () => {
  Cookies.remove("JSESSIONID");
};
export {
  capitalize,
  delayMethod,
  EmptyObject,
  convertArrayKeys,
  encode_utf8,
  HasAuthToken,
  dbToLocalDate,
  localToDBDate,
  invalidSessionHandler,
  convertDateFunc,
  clearCacheData,
  clearCookiesData,
};
