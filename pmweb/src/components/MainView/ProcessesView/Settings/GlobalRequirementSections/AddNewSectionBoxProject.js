// #BugID - 115179
// #BugDescription - add another button issues fixed.
import { Button, TextField, makeStyles } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../../Templates/template.module.css";
import arabicStyles from "../../..//Templates/templateArabicStyles.module.css";
import { RTL_DIRECTION } from "../../../../../Constants/appConstants";
import { FieldValidations } from "../../../../../utility/FieldValidations/fieldValidations";
import { useRef } from "react";
import {
  decode_utf8,
  encode_utf8,
} from "../../../../../utility/UTF8EncodeDecoder";
import Field from "../../../../../UI/InputFields/TextField/Field";
import {
  PMWEB_ARB_REGEX,
  PMWEB_REGEX,
} from "../../../../../validators/validator";
import { checkRegex } from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";

const makeInputFields = (value) => {
  return { value, error: false, helperText: "" };
};

const useStyles = makeStyles((theme) => ({
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
  errorMultilineInput: {
    backgroundColor: "white",
    fontSize: "var(--base_text_font_size)",
    border: "1px solid red !important",
    "& focus": {
      border: "0px solid #CECECE !important",
    },
    "& .Mui-focused": {
      borderColor: "transparent",
      borderWidth: "0px !important",
    },
  },
}));

function AddNewSectionBox(props) {
  /* code edited on 12 July 2023 for BugId 131451 - oracle>> User is getting the 
  error in modifying the requirement and getting incorrect error */
  let { t } = useTranslation();
  const classes = useStyles({});
  const direction = `${t("HTML_DIR")}`;
  const cancelButtonClick = () => {
    props.cancelCallBack();
  };
  const [previousOrderId, setpreviousOrderId] = useState(0);
  const [sectionName, setsectionName] = useState(makeInputFields(""));
  const [desc, setdesc] = useState(makeInputFields(""));
  const sectionNameRef = useRef();
  const sectionDescRef = useRef();

  /* code edited on 12 July 2023 for BugId 131451 - oracle>> User is getting the 
  error in modifying the requirement and getting incorrect error */
  useEffect(() => {
    setpreviousOrderId(props.previousOrderId);
  }, [props.previousOrderId]);

  /* code edited on 12 July 2023 for BugId 131451 - oracle>> User is getting the 
  error in modifying the requirement and getting incorrect error */
  const addHandler = (type) => {
    if (sectionName.value?.trim() !== "" && !sectionName.error && !desc.error) {
      let tempPrevId = previousOrderId + 1;
      let newSectionData = {
        OrderId: tempPrevId.toString(),
        SectionName: sectionName.value,
        Description: desc.value,
        Exclude: false,
      };
      props.mapNewSection(newSectionData);
      setpreviousOrderId(tempPrevId);
      setdesc(makeInputFields(""));
      setsectionName(makeInputFields(""));
      if (type !== "addAnother") {
        cancelButtonClick();
      }
    }
  };
  const handleKeyCancel = (e) => {
    if (e.keyCode === 13) {
      cancelButtonClick(e);
      e.stopPropagation();
    }
  };

  const handleKeyAddHandler = (e, type) => {
    if (e.keyCode === 13) {
      addHandler(type);
      e.stopPropagation();
    }
  };

  useEffect(() => {
    const close = (e) => {
      if (e.keyCode === 27) {
        cancelButtonClick();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  /* code added on 4 August 2023 for BugId 131450 - pmweb>> the section is not having the text 
  limitation and special characters validations */
  const handleChangeValues = (e) => {
    const { name, value } = e.target;
    let error = "";
    switch (name) {
      case "SectionName":
        if (!value) {
          error = t("sectionEmptyError");
        } else if (value.length > 100) {
          error = t("max100CharAllowed");
        }
        // modified on 25-09-2023 for bug_id: 136970
        // } else if (!validateRegex(value, PMWEB_REGEX.SectionName)) {
        //   error = t("sectionNameValidation");
        // }
        else if (
          !checkRegex(
            value,
            PMWEB_REGEX.SectionName,
            PMWEB_ARB_REGEX.SectionName
          )
        ) {
          error = t("sectionNameValidation");
        }
        //till here for bug_id: 136970
        setsectionName({
          ...sectionName,
          value,
          error: error ? true : false,
          helperText: error,
        });
        break;
      case "Description":
        if (value.length > 150) {
          error = t("max150CharAllowed");
        }
        // else if (!validateRegex(value, PMWEB_REGEX.SectionDesc)) {
        //   error = t("sectionDescValidation");
        // }
        else if (
          !checkRegex(
            value,
            PMWEB_REGEX.SectionDesc,
            PMWEB_ARB_REGEX.SectionDesc
          )
        ) {
          error = t("sectionDescValidation");
        }
        setdesc({
          ...desc,
          value: encode_utf8(value),
          error: error ? true : false,
          helperText: error,
        });
        break;
      default:
        return;
    }
  };

  return (
    <div>
      <p
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.addCategoryHeading
            : styles.addCategoryHeading
        }
      >
        {props.sectionNo === "" || props.sectionNo === undefined
          ? t("addNewSection")
          : `${t("addSectionWithin")} ${props.sectionNo}`}
      </p>
      <div className={styles.sectionDiv}>
        {/* code edited on 4 August 2023 for BugId 131450 - pmweb>> the section is not having 
        the text limitation and special characters validations */}
        <Field
          id="pmweb_GlobalReqProjectLevel_add_sectionName"
          name="SectionName"
          required={true}
          label={`${t("section")} ${t("name")}`}
          value={sectionName.value}
          onChange={handleChangeValues}
          error={sectionName.error}
          helperText={sectionName.helperText}
          inputRef={sectionNameRef}
          onKeyPress={(e) =>
            FieldValidations(e, 163, sectionNameRef.current, 100)
          }
          // onPaste= {(e)=>{
          //   validateData(e, "SectionName")
          // }}
        />
      </div>

      <div>
        <label
          for="pmweb_GlobalReqProjectLevel_add_sectionDesc"
          className={styles.sectionLabelHeading}
        >
          {t("Discription")}
        </label>
        {/* code edited on 4 August 2023 for BugId 131450 - pmweb>> the section is not having 
        the text limitation and special characters validations */}
        <TextField
          id="pmweb_GlobalReqProjectLevel_add_sectionDesc"
          type="text"
          tabIndex={0}
          className={styles.sectionDescInput}
          name="Description"
          onChange={handleChangeValues}
          error={desc.error}
          helperText={desc.helperText}
          FormHelperTextProps={{
            style: {
              marginLeft: 0,
              marginTop: 0,
              fontSize: "10px",
              fontWeight: 600,
              color: desc.error ? "rgb(181, 42, 42)" : "#606060",
              textAlign: "start",
            },
          }}
          InputProps={{
            className: desc.error
              ? classes.errorMultilineInput
              : classes.multilineInput,
          }}
          multiline={true}
          rows={4}
          value={decode_utf8(desc.value)}
          inputRef={sectionDescRef}
          onKeyPress={(e) =>
            FieldValidations(e, 163, sectionDescRef.current, 150)
          }
        />
      </div>
      <div className={styles.buttonDiv}>
        <Button
          className={styles.cancelCategoryButton}
          onClick={cancelButtonClick}
          tabIndex={0}
          onKeyDown={(e) => handleKeyCancel(e)}
          id="pmweb_GlobalReqProjectLevel_add_section_Cancel"
        >
          {t("cancel")}
        </Button>
        <Button
          className={
            sectionName.value?.trim() === "" ||
            !sectionName.value ||
            sectionName.error ||
            desc.error
              ? styles.disabledCategoryButton
              : styles.addCategoryButton
          }
          onClick={() => addHandler("addAnother")}
          tabIndex={0}
          onKeyDown={(e) => handleKeyAddHandler(e, "addAnother")}
          id="pmweb_GlobalReqProjectLevel_add_section_addAnother"
          disabled={
            sectionName.value?.trim() === "" ||
            !sectionName.value ||
            sectionName.error ||
            desc.error
          }
        >
          {t("addAnother")}
        </Button>
        <Button
          className={
            sectionName.value?.trim() === "" ||
            !sectionName.value ||
            sectionName.error ||
            desc.error
              ? styles.disabledCategoryButton
              : styles.addCategoryButton
          }
          onClick={() => addHandler("close")}
          tabIndex={0}
          onKeyDown={(e) => handleKeyAddHandler(e, "close")}
          id="pmweb_GlobalReqProjectLevel_add_section_addClose"
          disabled={
            sectionName.value?.trim() === "" ||
            !sectionName.value ||
            sectionName.error ||
            desc.error
          }
        >
          {t("add&Close")}
        </Button>
      </div>
    </div>
  );
}

export default AddNewSectionBox;
