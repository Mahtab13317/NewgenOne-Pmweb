import React, { useState, useEffect } from "react";
import { Tab, Tabs } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import clsx from "clsx";
import styles from "./index.module.css";
import { TabPanel } from "../../../ProcessSettings";
import { useTranslation } from "react-i18next";
import InformationComponent from "./InformationComponent";
import ClipboardIcon from "../../../../assets/CopyIcon.svg";
import { SPACE } from "../../../../Constants/appConstants";
import ErrorComponent from "./ErrorComponent";
import { useDispatch } from "react-redux";

function ErrorAndInformationModal(props) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    closeModal,
    errorMessageObj,
    setopenConfirmationModal,
    setAction,
    openProcessFlag,
    openProcessAfterImport,
    responseObj,
    showModalOnImport,
    title,
    typeImportorExport,
  } = props;

  const [tabValue, setTabValue] = useState(0); // State that maintains the currently selected tab.
  const [errorMessages, setErrorMessages] = useState([]); // State that stores all the error messages for the user when he/she imports a process with DMS activity in it.

  // Function to handle tab change.
  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Function that returns a comma separated string based on the array provided.
  const getCommaSeparatedValues = (values, key) => {
    let tempString = "";
    values?.forEach((element, index) => {
      if (index !== values?.length - 1) {
        tempString = tempString.concat(
          `"`,
          key ? element[key] : element,
          `"`,
          ",",
          SPACE
        );
      } else if (values?.length === 1) {
        tempString = tempString.concat(`"`, key ? element[key] : element, `"`);
      } else {
        tempString = tempString.concat(
          "and",
          SPACE,
          `"`,
          key ? element[key] : element,
          `"`
        );
      }
    });
    return tempString;
  };

  // Function that removes commas after dot in the message passed as props.
  function removeCommasAfterDot(text) {
    const modifiedText = text.replace(/\.(,+)/g, ".");
    return modifiedText;
  }

  // Function that concatenates the array elements with new line and numbering.
  const concatenateWithNewLine = (array, key) => {
    if (array && array !== null && array !== undefined && array.length > 0) {
      const result = array
        ?.map((element, index) => {
          return (
            `${index !== 0 ? "\n" : ""}` +
            `${index + 1}.` +
            SPACE +
            `${key !== null ? element[key] : element}`
          );
        })
        .join("");
      return result;
    }
  };

  // Function that concatenates the array elements with new line and numbering.
  const concatenateWithNewLineFor2Keys = (array, key1, key2) => {
    if (array && array !== null && array !== undefined && array.length > 0) {
      const result = array
        ?.map((element, index) => {
          return (
            `${index !== 0 ? "\n" : ""}` +
            SPACE +
            `${index + 1}.` +
            `Data Object` +
            SPACE +
            `"${element[key2]}"` +
            SPACE +
            `has been renamed to` +
            SPACE +
            `"${element[key1]}".`
          );
        })
        .join("");
      return result;
    }
  };
  // Changes on 27-10-2023 to change the functionality copy to download
  // Function to handle the case when navigator.clipboard is not present.
  // const fallbackCopyToClipboard = (text) => {
  //   const textArea = document.createElement("textarea");
  //   textArea.value = text;
  //   document.body.appendChild(textArea);
  //   textArea.select();
  //   document.execCommand("copy");
  //   document.body.removeChild(textArea);
  // };

  // Changes on 27-10-2023 to change the functionality copy to download
  function createAndDownloadTextFile(textToCopy) {
    const textContent = textToCopy;
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Import_Alert.txt"; // File name
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  // Function that checks if navigator.clipboard is present or not and handles copy to clipboard function accordingly.
  const handleCreateAndDownloadFile = async (textToCopy) => {
    try {
      // Changes on 27-10-2023 to change the functionality copy to download
      createAndDownloadTextFile(textToCopy);

      // if (navigator.clipboard ) {
      //   // If Clipboard API is supported, use it to write the text to the clipboard
      //   await navigator.clipboard.writeText(textToCopy);
      // } else {
      //   // Fallback for browsers that do not support the Clipboard API
      //  fallbackCopyToClipboard(textToCopy);

      // }
    } catch (error) {
      // console.error("Failed to copy text:", error);
      console.error("Failed to download text:", error);
    }
  };

  // Function that copies the data shown to clipboard based on the selected tab.
  const copyToClipboard = (btnType) => {
    let text = "";
    if (btnType === "Error") {
      const concatenatedArr = removeCommasAfterDot(
        concatenateWithNewLine(errorMessages, null)
      );
      text = concatenatedArr;
    } else {
      text = text.concat(errorMessageObj[0]?.header, "\n");
      text = text.concat(errorMessageObj[0]?.subHeaders[0], ":", "\n", "\n");
      if (errorMessageObj[0]["key"] === "renamedDataObjects") {
        text = text.concat(
          concatenateWithNewLineFor2Keys(
            errorMessageObj[0]?.errorData,
            "name",
            "oldName"
          )
        );
      } else {
        text = text.concat(
          concatenateWithNewLine(errorMessageObj[0]?.errorData, "name")
        );
      }
    }
    // now this function is use for create and download the file
    // handleCopyToClipboard(text);
    handleCreateAndDownloadFile(text);

    // navigator.clipboard.writeText(text);
    // dispatch(
    //   setToastDataFunc({
    //     message: "Copied!",
    //     severity: "info",
    //     open: true,
    //   })
    // );
  };

  // Function that returns the values in an array from another array based on a key in the passed array.
  const getValuesInArray = (arr, key) => {
    let tempArr = [];
    arr?.forEach((element) => {
      tempArr?.push(element[key]);
    });
    return tempArr;
  };

  // Function that generates the error messages based on the values it gets from the resonse of import process API call.
  const generateErrorMessages = () => {
    let tempArr = [];
    let dataArr = responseObj?.data?.dmsImportStatus;
    let infoDataArr = errorMessageObj;
    infoDataArr?.forEach((element) => {
      if (element["key"] === "missingDataObjects") {
        tempArr?.push(
          `The Data objects ${getCommaSeparatedValues(
            element?.errorData,
            "name"
          )} are not ${
            typeImportorExport === "import" ? "imported" : "exported"
          } in the process due to some error.`
        );
      }
      if (element["key"] === "failedDataObjects") {
        tempArr?.push(
          `Process definition ${
            typeImportorExport === "import" ? "imported" : "exported"
          } without the data objects ${getCommaSeparatedValues(
            element?.errorData,
            "name"
          )} due to some error.`
        );
      }
    });
    dataArr?.forEach((element) => {
      switch (element?.loginErrorCode) {
        case "ServerUnreachable":
          tempArr?.push(
            `The server is currently unreachable. Kindly contact your administrator.`
          );
          break;
        case "UserLocked":
          tempArr?.push(
            `The user configured for the "${element.activityName}" is locked. Please unlock it to make the connection successful.`
          );
          break;
        case "InvalidCredientials":
          tempArr?.push(
            `Invalid credentials configured in the "${element.activityName}".`
          );
          break;
        default:
          break;
      }
      if (!element.cabinetAssociated) {
        tempArr?.push(
          `Ensure that the cabinet name associated with the "${element.activityName}" is accessible. If not, associate the correct cabinet for the workstep.`
        );
      }
      if (element?.missingDataClasses?.length > 0) {
        tempArr?.push(
          `The data classes ${getCommaSeparatedValues(
            element?.missingDataClasses,
            "name"
          )} associated with the "${element.activityName}" ${
            element?.missingDataClasses?.length > 1 ? "are" : "is"
          } not available.`
        );
      }
      if (element.missingDataFields?.length > 0) {
        element.missingDataFields?.forEach((d) => {
          tempArr?.push(
            `The data field${
              d?.dataFields?.length > 1 ? "s" : ""
            } ${getCommaSeparatedValues(
              getValuesInArray(d.dataFields, "name")
            )} of the data class "${d.name}" associated with the "${
              element.activityName
            }" ${d?.dataFields?.length > 1 ? "are" : "is"} not available.`
          );
        });
      }
    });
    return tempArr;
  };

  // Function that runs when the value "showModalOnImport" changes.
  useEffect(() => {
    if (showModalOnImport?.showErrors) {
      let tempArr = generateErrorMessages();
      setErrorMessages(tempArr);
    }
  }, [showModalOnImport]);

  // Function that gets called when the user clicks on the "Ok" button on the modal.
  const okHandler = () => {
    setopenConfirmationModal(false);
    setAction(null);
    if (openProcessFlag) {
      openProcessAfterImport(responseObj);
    }
  };

  // Function that returns an object of booleans which tell whether error tab should be visible or information tab or both.
  const showErrorAndInfo = () => {
    let isErrorVisible,
      isInfoVisible,
      isBothVisible = false;
    let labelVisible = "";

    if (showModalOnImport?.showErrors || showModalOnImport?.showInformation) {
      isErrorVisible = showModalOnImport?.showErrors;
      isInfoVisible =
        showModalOnImport?.showInformation &&
        errorMessageObj[0]["key"] === "renamedDataObjects" &&
        errorMessageObj[0]?.renamedDataObjects?.length !== 0;
      isBothVisible = showModalOnImport?.showErrors && isInfoVisible;
    }

    if (!isBothVisible) {
      if (isErrorVisible) {
        labelVisible = "Error";
      } else if (isInfoVisible) {
        labelVisible = t("Information");
      }
    }

    return {
      isErrorVisible: isErrorVisible,
      isInfoVisible: isInfoVisible,
      isBothVisible: isBothVisible,
      labelVisible: labelVisible,
    };
  };

  // Function that gets the count of the information shown in the respective tab.
  const getHeadingCount = (label) => {
    let count = 0;
    if (label === "Error") {
      count = errorMessages?.length;
    } else {
      if (errorMessageObj[0]["key"] === "renamedDataObjects") {
        count = errorMessageObj[0]?.errorData?.length;
      }
    }
    return count;
  };

  return (
    <div>
      <div
        className={clsx(
          styles.flexRow,
          styles.justifyContentSpaceBetween,
          styles.padding
        )}
      >
        <div className={styles.flexRow}>
          <p className={styles.headingTag}>{title}</p>
          {!showErrorAndInfo()?.isBothVisible && (
            <p className={styles.headingTag}>
              {SPACE}-{SPACE}
              {showErrorAndInfo()?.labelVisible}
              {SPACE}
              {`(${getHeadingCount(showErrorAndInfo()?.labelVisible)})`}
            </p>
          )}
        </div>
        <CloseIcon
          fontSize="medium"
          style={{
            cursor: "pointer",
            width: "1.5rem",
            height: "1.5rem",
            color: "rgb(0,0,0,0.5)",
          }}
          onClick={closeModal}
          tabIndex={0}
          onkeyDown={(e) => {
            if (e.keyCode === "Enter") {
              closeModal();
              e.stopPropagation(e);
            }
          }}
        />
      </div>
      <p className={styles.noteText}>
        {t("noteText")}
        {SPACE}
        {t("processSuccessfullyImported")}
        {SPACE}
        {showErrorAndInfo()?.isErrorVisible &&
          t("however") + "," + SPACE + t("errorsMentionedMustBeResolved")}
        {SPACE}
        {showErrorAndInfo()?.isInfoVisible &&
          t("informationProvidedDoesNotRequireAction")}
      </p>
      {showErrorAndInfo()?.isBothVisible && (
        <div className={styles.tabStyles}>
          <Tabs
            value={tabValue}
            onChange={handleChange}
            TabIndicatorProps={{ style: { background: "#0072C5" } }}
          >
            <Tab
              id="pmweb_Error_Tab"
              className={tabValue === 0 && styles.tabLabel}
              label={`Errors (${getHeadingCount("Error")})`}
            />
            <Tab
              id="pmweb_Information_Tab"
              className={tabValue === 1 && styles.tabLabel}
              label={`Information (${getHeadingCount("Information")})`}
            />
          </Tabs>
        </div>
      )}
      <div>
        {showErrorAndInfo()?.isBothVisible ? (
          <>
            <TabPanel value={tabValue} index={0}>
              <ErrorComponent errorMessages={errorMessages} />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <InformationComponent errorMessageObj={errorMessageObj} />
            </TabPanel>
          </>
        ) : showErrorAndInfo()?.isErrorVisible ? (
          <>
            <ErrorComponent errorMessages={errorMessages} />
          </>
        ) : (
          <>
            <InformationComponent errorMessageObj={errorMessageObj} />
          </>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "0",
          display: "flex",
          justifyContent: "space-between",
          width: "98%",
          padding: "10px",
        }}
      >
        <button
          id="pmweb_EIM_CopyToClipboardBtn"
          style={{
            marginBottom: "0px !important",
            background: "#FFFFFF 0% 0% no-repeat padding-box",
            border: "1px solid #C4C4C4",
            borderRadius: "2px",
            opacity: "1",
            display: "flex",
            alignItems: "center",
            marginInline: "3px",
            cursor: "pointer",
          }}
          onClick={() =>
            copyToClipboard(
              !showErrorAndInfo()?.isBothVisible
                ? showErrorAndInfo()?.labelVisible
                : tabValue === 0
                ? "Error"
                : "Information"
            )
          }
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.keyCode === "Enter") {
              copyToClipboard(
                !showErrorAndInfo()?.isBothVisible
                  ? showErrorAndInfo()?.labelVisible
                  : tabValue === 0
                  ? "Error"
                  : "Information"
              );
              e.stopPropagation();
            }
          }}
        >
          <img src={ClipboardIcon} alt={"Copy"} />
          {SPACE}
          {t("download")}
          {SPACE}
          {!showErrorAndInfo()?.isBothVisible
            ? showErrorAndInfo()?.labelVisible
            : tabValue === 0
            ? "Error"
            : "Information"}
        </button>
        <button
          style={{
            height: "1.75rem",
            width: "3.5rem",
            border: "none",
            color: "white",
            background: "var(--button_color)",
            borderRadius: "0.125rem",
            fontSize: "var(--base_text_font_size)",
            cursor: "pointer",
            marginBottom: "0px !important",
            cursor: "pointer",
          }}
          onClick={okHandler}
          id="pmweb_EIM_OkBtn"
          tabIndex={0}
          onkeyDown={(e) => {
            if (e.keyCode === "Enter") {
              okHandler();
              e.stopPropagation();
            }
          }}
        >
          {t("ok")}
        </button>
      </div>
    </div>
  );
}

export default ErrorAndInformationModal;
