// code modified for bug ids 137011,137336,136855,137345,136517 on 25-09-2023
/*export function encode_utf8(ch) {
  if (ENCODING.toUpperCase() != "UTF-8") return escape(ch);
  // let i, bytes;
  // let temp;
  let i = 0;
  //let bytes=0;
  let temp;

  let utf8 = new String();

  for (i = 0, bytes = 0; i < ch?.length; i++) {
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

  ch?.split("").forEach((item, i) => {
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
  });

  if (navigator.appName.indexOf("Netscape") == -1) {
    return escape(utf8);
  }
  let esc = new String();
  let l;
  for (l = 0; l < utf8.length; l++) {
    if (utf8.charCodeAt(l) < 128) esc += escape(utf8[l]);
    else {
      esc += "%";
      esc += hexArr[utf8.charCodeAt(l) >> 4];
      esc += hexArr[utf8.charCodeAt(l) & 0xf];
    }
  }
  return esc;
}*/

/*export function encode_utf8(ch) {
  if (ENCODING.toUpperCase() !== "UTF-8") {
    return encodeURIComponent(ch);
  }

  let utf8 = "";

  ch.split("").forEach((item, i) => {
    const temp = ch.charCodeAt(i);
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
  });

  if (navigator.appName.indexOf("Netscape") == -1) {
    return encodeURIComponent(utf8);
  }

  let esc = new String();
  let l;
  for (l = 0; l < utf8.length; l++) {
    if (utf8.charCodeAt(l) < 128) esc += encodeURIComponent(utf8[l]);
    else {
      esc += "%";
      esc += hexArr[utf8.charCodeAt(l) >> 4];
      esc += hexArr[utf8.charCodeAt(l) & 0xf];
    }
  }
  return esc;
}*/

/*export function decode_utf8(utftextBytes) {
  let utftext = unescape(utftextBytes);
  if (ENCODING.toUpperCase() != "UTF-8") return utftext;
  let plaintext = "",
    temp;
  let i, c1, c2, c3, c4;
  i = c1 = c2 = c3 = c4 = 0;
  *while (i < utftext?.length) {
    c1 = utftext.charCodeAt(i);
    temp = "?";
    if (c1 < 0x80) {
      temp = String.fromCharCode(c1);
      i++;
    } else if (c1 >> 5 == 6) {
      //2 bytes
      c2 = utftext.charCodeAt(i + 1);
      if (!((c2 ^ 0x80) & 0xc0))
        temp = String.fromCharCode(((c1 & 0x1f) << 6) | (c2 & 0x3f));
      i += 2;
    } else if (c1 >> 4 == 0xe) {
      //3 bytes
      c2 = utftext.charCodeAt(i + 1);
      c3 = utftext.charCodeAt(i + 2);
      if (!(((c2 ^ 0x80) | (c3 ^ 0x80)) & 0xc0))
        temp = String.fromCharCode(
          ((c1 & 0xf) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f)
        );
      i += 3;
    } else i++;
    plaintext += temp;
  }*

  Array(utftext?.length)
    .fill(0)
    .forEach((item, j) => {
      if (j >= i) {
        c1 = utftext.charCodeAt(i);
        temp = "?";
        if (c1 < 0x80) {
          temp = String.fromCharCode(c1);
          i++;
        } else if (c1 >> 5 == 6) {
          //2 bytes
          c2 = utftext.charCodeAt(i + 1);
          if (!((c2 ^ 0x80) & 0xc0))
            temp = String.fromCharCode(((c1 & 0x1f) << 6) | (c2 & 0x3f));
          i += 2;
        } else if (c1 >> 4 == 0xe) {
          //3 bytes
          c2 = utftext.charCodeAt(i + 1);
          c3 = utftext.charCodeAt(i + 2);
          if (!(((c2 ^ 0x80) | (c3 ^ 0x80)) & 0xc0))
            temp = String.fromCharCode(
              ((c1 & 0xf) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f)
            );
          i += 3;
        } else i++;
        plaintext += temp;
      }
    });
  return plaintext;
}
*/
/*export function decode_utf8(utftextBytes) {
  let utftext = decodeURIComponent(utftextBytes);
  if (ENCODING.toUpperCase() !== "UTF-8") {
    return utftext;
  }
  let plaintext = "";
  let temp;
  let i = 0;
  let c1, c2, c3;

  while (i < utftext.length) {
    c1 = utftext.charCodeAt(i);
    temp = "?";
    if (c1 < 0x80) {
      temp = String.fromCharCode(c1);
      i++;
    } else if (c1 >> 5 == 6) {
      // 2 bytes
      c2 = utftext.charCodeAt(i + 1);
      if (!((c2 ^ 0x80) & 0xc0))
        temp = String.fromCharCode(((c1 & 0x1f) << 6) | (c2 & 0x3f));
      i += 2;
    } else if (c1 >> 4 == 0xe) {
      // 3 bytes
      c2 = utftext.charCodeAt(i + 1);
      c3 = utftext.charCodeAt(i + 2);
      if (!(((c2 ^ 0x80) | (c3 ^ 0x80)) & 0xc0))
        temp = String.fromCharCode(
          ((c1 & 0xf) << 12) | ((c2 & 0x3f) << 6) | (c3 & 0x3f)
        );
      i += 3;
    } else {
      i++;
    }
    plaintext += temp;
  }

  return plaintext;
}*/

export function encode_utf8(text) {
  return encodeURIComponent(text);
}

export function decode_utf8(encodedText) {
  try {
    let decodedText = decodeURIComponent(encodedText);
    // Replace %20 with spaces
    decodedText = decodedText.replace(/%20/g, " ");
    return decodedText;
  } catch (error) {
    if (error instanceof URIError) {
      const decodedText = encodedText.replace(/%25/g, "%"); // Replace %25 with %
      return decodedText;
    } else {
      console.error("Error decoding URI:", error);
      return encodedText;
    }
  }
}
//till here for bug ids 137011,137336,136855,137345,136517
