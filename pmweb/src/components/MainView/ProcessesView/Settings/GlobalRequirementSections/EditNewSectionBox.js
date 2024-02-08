import { Button, TextField, makeStyles } from "@material-ui/core";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../../Templates/template.module.css";
import arabicStyles from "../../..//Templates/templateArabicStyles.module.css";
import { RTL_DIRECTION } from "../../../../../Constants/appConstants";
import { decode_utf8 } from "../../../../../utility/UTF8EncodeDecoder";
import { FieldValidations } from "../../../../../utility/FieldValidations/fieldValidations";
import Field from "../../../../../UI/InputFields/TextField/Field";
import {
  PMWEB_REGEX,
  validateRegex,
} from "../../../../../validators/validator";
// #BugID - 117787
// #BugDescription - validation issue reolved for button eneable disable.
// #Date - 28 October 2022
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

function EditSectionBox(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const classes = useStyles({});
  const [newSection, setnewSection] = useState({});
  const [sectionName, setsectionName] = useState(makeInputFields(""));
  const [desc, setDesc] = useState(makeInputFields(""));
  const sectionNameRef = useRef();
  const sectionDescRef = useRef();

  const cancelButtonClick = () => {
    props.cancelCallBack();
  };

  const editSave = () => {
    if (!sectionName.error && !desc.error) {
      props.editMapToData(newSection);
      cancelButtonClick();
    }
  };

  useEffect(() => {
    setnewSection({
      OrderId: props.sectionToEdit.OrderId,
      SectionName:
        sectionName.value?.trim() !== ""
          ? sectionName.value
          : props.sectionToEdit.SectionName,
      Description:
        desc.value !== null ? desc.value : props.sectionToEdit.Description,
    });
  }, [
    desc.value,
    props.OrderId,
    props.sectionToEdit.Description,
    props.sectionToEdit.OrderId,
    props.sectionToEdit.SectionName,
    sectionName.value,
  ]);

  useEffect(() => {
    setsectionName({ ...sectionName, value: props.sectionToEdit.SectionName });
    setDesc({ ...desc, value: props.sectionToEdit.Description });
  }, [props.sectionToEdit.Description, props.sectionToEdit.SectionName]);

  const handleKeyCancel = (e) => {
    if (e.keyCode === 13) {
      cancelButtonClick();
      e.stopPropagation();
    }
  };

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
        } else if (!validateRegex(value, PMWEB_REGEX.SectionName)) {
          error = t("sectionNameValidation");
        }
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
        } else if (!validateRegex(value, PMWEB_REGEX.SectionDesc)) {
          error = t("sectionDescValidation");
        }
        setDesc({
          ...desc,
          value,
          error: error ? true : false,
          helperText: error,
        });
        break;
      default:
        return;
    }
  };

  // React.useEffect(() => {
  //   document.addEventListener("keydown", handleKeyCancel);
  //   return () => document.removeEventListener("keydown", handleKeyCancel);
  // },[handleKeyCancel]);

  const handleKeySave = (e) => {
    if (e.keyCode === 13) {
      editSave();
      e.stopPropagation();
    }
  };

  // React.useEffect(() => {
  //   document.addEventListener("keydown", handleKeySave);
  //   return () => document.removeEventListener("keydown", handleKeySave);
  // },[handleKeySave]);

  useEffect(() => {
    const close = (e) => {
      if (e.keyCode === 27) {
        cancelButtonClick();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  return (
    <div>
      <p
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.addCategoryHeading
            : styles.addCategoryHeading
        }
      >
        {t("edit")} {t("section")}
      </p>
      <div className={styles.sectionDiv}>
        {/* code edited on 4 August 2023 for BugId 131450 - pmweb>> the section is not having 
        the text limitation and special characters validations */}
        <Field
          id="pmweb_GlobalReqProjectLevel_edit_sectionName"
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
        />
      </div>
      <div>
        <label
          for="pmweb_GlobalReqProjectLevel_edit_sectionDesc"
          className={styles.sectionLabelHeading}
        >
          {t("Discription")}
        </label>
        {/* code edited on 4 August 2023 for BugId 131450 - pmweb>> the section is not having 
        the text limitation and special characters validations */}
        <TextField
          id="pmweb_GlobalReqProjectLevel_edit_sectionDesc"
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
              color: desc.error ? "red" : "#606060",
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
          id="pmweb_GlobalReqProjectLevel_edit_section_Cancel"
        >
          {t("cancel")}
        </Button>
        {/* Changes on 03-10-2023 to resolve the edit issue as description is not mandatory */}
        <Button
          className={
            sectionName.value?.trim() === "" ||
            (sectionName.value === props.sectionToEdit.SectionName &&
              desc.value === props.sectionToEdit.Description) ||
            // desc.value?.trim() === "" ||
            sectionName.error ||
            desc.error
              ? styles.disabledCategoryButton
              : styles.addCategoryButton
          }
          onClick={editSave}
          tabIndex={0}
          onKeyDown={(e) => handleKeySave(e)}
          disabled={
            sectionName.value?.trim() === "" ||
            (sectionName.value === props.sectionToEdit.SectionName &&
              desc.value === props.sectionToEdit.Description) ||
            // desc.value?.trim() === "" ||
            sectionName.error ||
            desc.error
          }
          id="pmweb_GlobalReqProjectLevel_edit_section_Save"
        >
          {t("save")}
        </Button>
      </div>
    </div>
  );
}

export default EditSectionBox;
