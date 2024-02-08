import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import secureLocalStorage from "react-secure-storage";
import { SPACE } from "../../Constants/appConstants";
import { isEnglishLocaleSelected } from "../../utility/CommonFunctionCall/CommonFunctionCall";

// Function to add spaces between characters.
export function addSpacesBetweenCharacters(inputString) {
  const characters = inputString.split("");
  const stringWithSpaces = characters.join(" ");
  return stringWithSpaces;
}

function ValidationMessageProvider(props) {
  const { t } = useTranslation();
  const locale = secureLocalStorage.getItem("locale");
  const { fieldName, charactersRestricted, validationType } = props;
  const [validationMsg, setValidationMsg] = useState("");

  // Function that makes the validation message based on the case and fieldName and charactersRestricted provided as props.
  const getValidationMessage = () => {
    let tempMsg = "";
    if (isEnglishLocaleSelected()) {
      switch (validationType) {
        // First letter alphabet and given special characters restricted.
        case 0:
          tempMsg = `All characters are allowed except ${addSpacesBetweenCharacters(
            charactersRestricted
          )} and first character should be an alphabet.`;
          break;
        // case 1:
        //   tempMsg = `All characters are allowed except ${addSpacesBetweenCharacters(
        //     charactersRestricted
        //   )} and first character should be an alphabet.`;
        //   break;
        default:
          break;
      }
    } else {
      tempMsg = `${t(`${fieldName}`)}${SPACE}${t(
        "cannotContain"
      )}${SPACE}${addSpacesBetweenCharacters(charactersRestricted)}${SPACE}${t(
        "charactersInIt"
      )}`;
    }
    return tempMsg;
  };

  console.log("333", "LOCALE", locale, getValidationMessage());

  return (
    <div>
      <p style={{ color: "rgb(181,42,42)" }}>{getValidationMessage()}</p>
    </div>
  );
}

export default ValidationMessageProvider;
