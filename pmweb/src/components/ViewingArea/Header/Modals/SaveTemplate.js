// #BugID - 115569
// #BugDescription - template save error while creating new category issue resolved.
// #BugID - 115571
// #BugDescription - success and error message after save has been addded..
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import styles from "../modal.module.css";
import arabicStyles from "../ArabicModal.module.css";
import Button from "@material-ui/core/Button";
import axios from "axios";
import {
  ENDPOINT_ADD_TEMPLATE,
  ENDPOINT_FETCH_CATEGORIES,
  RTL_DIRECTION,
  SERVER_URL,
  SPACE,
  ARABIC_LOCALE,
  ARABIC_SA_LOCALE,
} from "../../../../Constants/appConstants";
import { connect, useDispatch } from "react-redux";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { MenuItem } from "@material-ui/core";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import {
  encode_utf8,
  decode_utf8,
} from "../../../../utility/UTF8EncodeDecoder";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import secureLocalStorage from "react-secure-storage";
import {
  insertNewlineAtCursor,
  isArabicLocaleSelected,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function SaveTemplate(props) {
  let { t } = useTranslation();
  const { setModalClosed } = props;
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const [category, setCategory] = useState();
  // const [isCategoryConstant, setCategoryConstant] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [categories, setCategories] = useState([]);
  const [templateList, setTemplateList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCatConst, setIsCatConst] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);
  const [errorMsgCategory, setErrorMsgCategory] = useState(false);
  const templateRef = useRef();
  const categoryRef = useRef();
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    axios.get(SERVER_URL + ENDPOINT_FETCH_CATEGORIES).then((res) => {
      if (res?.data?.Status === 0) {
        setCategories(res?.data?.Category);
        let templateArr = [];
        res?.data?.Category?.forEach((category) => {
          category?.Templates?.forEach((template) => {
            templateArr.push(template?.Name?.toLowerCase());
          });
        });
        setTemplateList(templateArr);
      }
    });
  }, []);

  // Added on 05-10-23 for Bug 135529
  useEffect(() => {
    const textareaElement = textareaRef.current;

    // Added event listener for focusing on the textarea
    const handleFocus = () => {
      setIsFocused(true);
    };

    // Added event listener for blurring from the textarea
    const handleBlur = () => {
      setIsFocused(false);
    };

    // Add event listener for keydown in the textarea
    const handleKeyDown = (event) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.altKey &&
        isFocused
      ) {
        // If Enter is pressed without Shift and the textarea is focused, do nothing
        event.preventDefault();
      } else if (
        ((event.key === "Enter" && event.shiftKey) ||
          (event.key === "Enter" && event.altKey)) &&
        isFocused
      ) {
        // If Shift+Enter or Alt+Enter is pressed, add a new line to the textarea
        event.preventDefault();
        const val = insertNewlineAtCursor(textareaRef);
        setTemplateDesc(val);
      }
    };

    textareaElement.addEventListener("focus", handleFocus);
    textareaElement.addEventListener("blur", handleBlur);
    textareaElement.addEventListener("keydown", handleKeyDown);

    return () => {
      // Removed event listeners when the component unmounts
      textareaElement.removeEventListener("focus", handleFocus);
      textareaElement.removeEventListener("blur", handleBlur);
      textareaElement.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFocused]);
  // Till here for Bug 135529

  const containsSpecialChars = (str) => {
    if (isArabicLocaleSelected()) {
      const regex = new RegExp("[~`!@#$%^&*()+\\-={}\\[\\]|\\\\:\";'<>?,.//]+");
      return !regex.test(str);
    } else {
      const regex = new RegExp(
        /^[A-Za-z][^\\\/\:\*\?\"\<\>\|\'\&\@\#\!\$\%\(\)\<\>\;\-]*$/gm
      );

      return regex.test(str);
    }
  };

  const containsSpecialCharsCategory = (str) => {
    if (isArabicLocaleSelected()) {
      var regex = new RegExp("[&*|:'\"<>?////]+");
      return !regex.test(str);
    } else {
      var regex = new RegExp(/^[A-Za-z][^\\\/\:\*\?\"\<\>\|\'\&]*$/gm);
      return regex.test(str);
    }
  };

  // Changes made to solve Bug 130826
  const validateData = (e, val) => {
    if (!containsSpecialChars(e.target.value)) {
      setErrorMsg(t("ProcessErrorMsg"));
    }
    //Added on 06/09/2023, bug_id:135981
    else if (e.target.value.length > 30) {
      setErrorMsg(`${val}${SPACE}${t("max30Length")}`);
    }
    //till here for bug_id:135981
    else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg(false);
    }
  };
  //  till here
  const validateDataCategory = (e, val) => {
    // added on 30-10-2023 for bug_id: 140273
    if (e.target.value.length > 61 && e.target.value != "<constant>") {
      setErrorMsgCategory(t("categoryLengthError"));
    } else if (
      !containsSpecialCharsCategory(e.target.value) &&
      e.target.value != "<constant>"
    ) {
      // added on 25-9-2023 for bug_id: 137242
      if (isArabicLocaleSelected()) {
        setErrorMsgCategory(
          `${val}${SPACE}${t(
            "cannotContain"
          )}${SPACE}\ / : * ? " < > | ' &${SPACE}${t("charactersInIt")}`
        );
      } else {
        setErrorMsgCategory(
          `${t(
            "AllCharactersAreAllowedExcept"
          )}${SPACE}\ / : * ? " < > | ' & ${SPACE}${t(
            "AndFirstCharacterShouldBeAlphabet"
          )}.`
        );
      }
      //till here for bug_id: 137242
    } else {
      setErrorMsgCategory("");
    }
    if (e.target.value == "") {
      setErrorMsgCategory(false);
    }
  };

  const createTemplateFunc = (event) => {
    // Added on 05-10-23 for Bug 135529
    if (
      (event.key === "Enter" && event.shiftKey) ||
      (event.key === "Enter" && event.altKey)
    ) {
      event.preventDefault();
    }
    // Till here for Bug 135529
    else {
      setBtnDisabled(true);
      if (templateList.includes(templateName.toLowerCase())) {
        setErrorMessage(t("templateNameAlreadyTaken"));
        setBtnDisabled(false);
      } else {
        let json = {
         // processDefId: props.openProcessID,
          processDefId: props.processDefId, //Modified on 22/01/2024 for bug_id:142453
          processType: props.openProcessType,
          templateName: templateName,
          categoryName: isCatConst ? category.name : "",
          //categoryName: category.name,
          categoryId: category.id,
          description: encode_utf8(templateDesc),
        };
        axios
          .post(SERVER_URL + ENDPOINT_ADD_TEMPLATE, json)
          .then((response) => {
            setBtnDisabled(false);
            if (response.data.Status === 0) {
              dispatch(
                setToastDataFunc({
                  message: t("saveTemplateMsg"),
                  severity: "success",
                  open: true,
                })
              );
              setModalClosed();
            } else {
              dispatch(
                setToastDataFunc({
                  message: response?.data?.message || response?.data?.Message,
                  severity: "error",
                  open: true,
                })
              );
            }
          });
      }
    }
  };

  // Function that returns the max category id.
  const getMaxCategoryId = () => {
    let maxCategoryId = 0;
    categories?.forEach((element) => {
      if (+element.CategoryId > maxCategoryId) {
        maxCategoryId = +element.CategoryId;
      }
    });
    return maxCategoryId;
  };

  // Function that is called when Enter key or Esc key is pressed.
  const handleModalKeyDown = (e) => {
    if (e.keyCode === 13) {
      if (
        !(
          templateName.trim() === "" ||
          !templateName ||
          !category ||
          btnDisabled
        )
      ) {
        createTemplateFunc(e);
      }
    } else if (e.keyCode === 27) {
      setModalClosed();
      e.stopPropagation();
    }
  };

  // Function that runs when the handleModalKeyDown value changes.
  useEffect(() => {
    document.addEventListener("keydown", handleModalKeyDown);
    return () => document.removeEventListener("keydown", handleModalKeyDown);
  }, [handleModalKeyDown]);

  return (
    <div>
      <div className={styles.header}>{t("saveAsTemplate")}</div>
      <div className={styles.form}>
        <div>
          <p className={styles.labelHeading}>
            {t("Category")}
            <span className={styles.starIcon}>*</span>
          </p>
          {/* <SelectWithInput
            dropdownOptions={categories}
            setValue={(val) => {
              if (val) {
                if (isCategoryConstant) {
                  setCategory({ id: `${getMaxCategoryId() + 1}`, name: val });
                } else {
                  setCategory({ id: val.CategoryId, name: val.CategoryName });
                }
              }
            }}
            value={category?.name}
            showEmptyString={false}
            showConstValue={true}
            inputClass={styles.selectWithInputTextField}
            constantInputClass={styles.multiSelectConstInput}
            setIsConstant={setCategoryConstant}
            isConstant={isCategoryConstant}
            constantStatement="category"
            constantOptionStatement="+addCategory"
            optionStyles={{ color: "darkBlue" }}
            isConstantIcon={true}
            optionKey="CategoryName"
          /> */}
          <CustomizedDropdown
            id="pwmeb_SaveTemplate_CategoryName"
            className={styles.escalateToEmailDropdown}
            isNotMandatory={true}
            hideDefaultSelect={true}
            name="CategoryName"
            role="select"
            ariaDescription="Category Name select dropdown"
            onChange={(e) => {
              validateDataCategory(e, t("Category"));
              setTimeout(() => {
                if (
                  JSON.parse(localStorage.getItem("catConst")) == false &&
                  e.target.value != "<constant>"
                ) {
                  setCategory({
                    id: categories.filter(
                      (d) => d.CategoryName == e.target.value
                    )[0].CategoryId,
                    name: e.target.value,
                  });
                }
                if (JSON.parse(localStorage.getItem("catConst")) == true) {
                  setCategory({
                    id: `${getMaxCategoryId() + 1}`,
                    name: e.target.value,
                  });
                }
                if (
                  JSON.parse(localStorage.getItem("catConst")) == false &&
                  e.target.value == "<constant>"
                ) {
                  setCategory({ id: e.target.value, name: e.target.value });
                }
              }, 200);
            }}
            reference={categoryRef}
            // added on 30-10-2023 for bug_id: 140273
            // onKeyPress={(e) => {
            //   if (!isNaN(e.target.value.charAt(0)) && e.target.value != "") {
            //     e.preventDefault();
            //   } else {
            //     FieldValidations(e, 150, categoryRef.current, 61);
            //   }
            // }}
            maxLengthAllowedinTemplate="61"
            inputType="template"
            // till here for bug_id: 140273
            value={category?.name}
            isConstant={isCatConst}
            setIsConstant={(val) => {
              localStorage.setItem("catConst", val);
              setIsCatConst(val);
            }}
            showConstValue={true}
            dropdownType="template"
          >
            {categories?.map((data, i) => (
              <MenuItem
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.menuItemStyles
                    : styles.menuItemStyles
                }
                value={data.CategoryName}
              >
                {data.CategoryName}
              </MenuItem>
            ))}
          </CustomizedDropdown>
          {errorMsgCategory ? (
            <p
              style={{
                color: "red",
                fontSize: "var(--sub_text_font_size)",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              {errorMsgCategory}
            </p>
          ) : (
            ""
          )}
        </div>
        <div>
          <p className={styles.labelHeading}>
            {t("Template")}
            {SPACE}
            {t("Name")}
            <span className={styles.starIcon}>*</span>
          </p>
          <input
            id="pwmeb_SaveTemplate_TemplateName"
            value={templateName}
            onChange={(e) => {
              setTemplateName(e.target.value);
              validateData(e, t("templateName"));
            }}
            className={styles.nameInput}
            aria-label="TemplateName"
            ref={templateRef}
            // onPaste={(e) => {
            //   setTimeout(() => validateData(e, "Template_Name"), 200);
            // }}
            onKeyPress={(e) => {
              if (!isNaN(e.target.value.charAt(0)) && e.target.value != "") {
                e.preventDefault();
              } else {
                FieldValidations(e, 169, templateRef.current, 31);
              }
            }}
          />
          {errorMsg ? (
            <p
              style={{
                color: "red",
                fontSize: "var(--sub_text_font_size)",
                marginBottom: "0.5rem",
                display: "block",
              }}
            >
              {errorMsg}
            </p>
          ) : (
            ""
          )}
        </div>
        <div>
          <p className={styles.labelHeading}>
            {t("Template")}
            {SPACE}
            {t("Discription")}
          </p>
          <textarea
            id="pwmeb_SaveTemplate_TemplateDescription"
            rows="10"
            cols="50"
            value={decode_utf8(templateDesc)}
            ref={textareaRef}
            onChange={(e) => setTemplateDesc(e.target.value)}
            className={styles.descInput}
            aria-label="Template Description"
          />
        </div>
      </div>

      <div className={styles.errorMessage}>{errorMessage}</div>
      <div className={styles.footer}>
        <Button
          id="pwmeb_SaveTemplate_CloseModalBtn"
          className={styles.cancelCategoryButton}
          onClick={setModalClosed}
        >
          {t("cancel")}
        </Button>
        <Button
          id="pwmeb_SaveTemplate_CreateTemplateBtn"
          className={
            templateName.trim() === "" ||
            !templateName ||
            !category ||
            btnDisabled ||
            errorMsg ||
            errorMsgCategory ||
            // added on 30-10-2023 for bug_id: 140273
            category.name === "<constant>" ||
            category.name === ""
              ? //till here for bug_id: 140273
                styles.disabledCategoryButton
              : styles.addCategoryButton
          }
          onClick={createTemplateFunc}
          disabled={
            templateName.trim() === "" ||
            !templateName ||
            !category ||
            btnDisabled ||
            errorMsg ||
            errorMsgCategory ||
            // added on 30-10-2023 for bug_id: 140273
            category.name === "<constant>" ||
            category.name === ""
            // till here for bug_id: 140273
          }
        >
          {t("createTemplate")}
        </Button>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps, null)(SaveTemplate);
