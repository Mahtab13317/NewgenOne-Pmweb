import { FieldValidations } from "./fieldValidations";

export function restrictNoOfChars(e, option, textBoxElem) {
  try {
    var evtObj = window.event || e;
    var restrictedChars = 0;
    if (option !== undefined) restrictedChars = parseInt(option);
    var KeyID = evtObj.keyCode || evtObj.which;
    var retval = false;
    switch (restrictedChars) {
      case 3: //int
        if (
          ((KeyID == 45 || (KeyID >= 48 && KeyID < 58)) &&
            textBoxElem.value.length < 5) ||
          KeyID == 8 ||
          KeyID == 16 || //Bug 32271 -12Dec2012
          (evtObj.ctrlKey == true &&
            (KeyID == 118 || KeyID == 86 || KeyID == 120 || KeyID == 88))
        ) {
          //BUG 32159:: 23/05/2012
          evtObj.returnValue = true;
          if (textBoxElem != undefined) {
            if (textBoxElem.value.length != 0 && KeyID == 45)
              //minus allowed at beginning only
              retval = false;
            //added by kanika bug id:88605
            else retval = true; //till here bug 88605
          }
        }
        break;
      case 4: //long
        if (
          (KeyID == 45 || (KeyID >= 48 && KeyID < 58)) &&
          textBoxElem.value.length < 19
        ) {
          //BUG 32159:: 23/05/2012
          evtObj.returnValue = true;
          if (textBoxElem != undefined) {
            if (textBoxElem.value.length != 0 && KeyID == 45)
              //minus allowed at beginning only
              retval = false;
            //added by kanika bug id:88605
            else retval = true; //till here bug 88605
          }
        }
        break;
      case 6: //float
        if (
          (KeyID == 45 || KeyID == 46 || (KeyID >= 48 && KeyID < 58)) &&
          textBoxElem.value.length < 50
        ) {
          //BUG 32159:: 23/05/2012
          evtObj.returnValue = true;
          if (textBoxElem != undefined) {
            if (textBoxElem.value.length != 0 && KeyID == 45)
              //minus allowed at beginning only
              retval = false;
            //added by kanika bug id:88605
            else retval = true; //till here bug 88605
          }
        }
        break;
      case 10: //string
        if (
          KeyID == 58 ||
          KeyID == 42 ||
          KeyID == 63 ||
          KeyID == 34 ||
          KeyID == 60 ||
          KeyID == 62 ||
          KeyID == 124 ||
          KeyID == 38 ||
          KeyID == 39 ||
          textBoxElem.value.length >= 255
        )
          // characters of text field restricted to 255

          retval = false;
        else {
          retval = true;
        } //till here bug_id:56231
        break;
      case 12: //boolean
        retval = true;
        break;
      case 18:
        retval = FieldValidations(e, 158, textBoxElem);
        break;
      case 16:
        retval = FieldValidations(e, 105, textBoxElem, 50);
        break;
      default:
        break;
    }
  } catch (excp) {
    retval = false;
  }
  return retval;
}
