import React, { useState, useEffect, useRef } from "react";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import styles from "./template.module.css";
import {
  BTN_TYPE_ADD_ANOTHER,
  BTN_TYPE_ADD_CLOSE,
  BTN_TYPE_EDIT_CLOSE,
  SPACE,
} from "../../../Constants/appConstants";
import {
  SERVER_URL,
  ENDPOINT_ADD_CATEGORY,
  ENDPOINT_EDIT_CATEGORY,
  RTL_DIRECTION,
} from "../../../Constants/appConstants";
import axios from "axios";
import arabicStyles from "./templateArabicStyles.module.css";
import { decode_utf8, encode_utf8 } from "../../../utility/UTF8EncodeDecoder";
import { FieldValidations } from "../../../utility/FieldValidations/fieldValidations";
import { useDispatch } from "react-redux";
import secureLocalStorage from "react-secure-storage";
import { isArabicLocaleSelected } from "../../../utility/CommonFunctionCall/CommonFunctionCall";

function AddCategoryModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [catList, setCatList] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const nameRef = useRef();
  const dispatch = useDispatch();
  const locale = secureLocalStorage.getItem("locale");

  // code added on 7 Sep 2022 for BugId 110830 and BugId 115256
  useEffect(() => {
    setCatList(props.categoryList);
  }, []);

  // code added on 7 Sep 2022 for BugId 110830 and BugId 115256
  useEffect(() => {
    props.setCategoryList(catList);
  }, [catList]);

  const addCategoryFunc = (type) => {
    let maxId = 0;
    let categoryNameArr = [];
    catList?.forEach((category) => {
      if (+category.CategoryId > +maxId) {
        maxId = category.CategoryId;
      }
      /*****************************************************************************************
       * @author asloob_ali Bug id: 112894 - Templates -: Categories -: on modifying the description only getting error message
       *  Resolution : excluding the name of the category currently being edited.
       *  Date : 29/08/2022             *******************/
      if (props.categoryToBeEdited?.CategoryId !== category.CategoryId) {
        categoryNameArr.push(category.CategoryName.toLowerCase());
      }
    });
    //code edited on 3 Nov 2022 for BugId 110831
    if (categoryNameArr.includes(nameInput.trim().toLowerCase())) {
      setErrorMessage(
        `This category name is already taken. Please choose another name.`
      );
    } else {
      if (type === BTN_TYPE_EDIT_CLOSE) {
        let editCategoryJSON = {
          categoryName: nameInput, //code edited on 3 Nov 2022 for BugId 110831
          categoryId: props.categoryToBeEdited?.CategoryId,
          description: encode_utf8(descriptionInput),
        };
        axios
          .post(SERVER_URL + ENDPOINT_EDIT_CATEGORY, editCategoryJSON)
          .then((response) => {
            if (response.data.Status === 0) {
              let tempList = [...catList];
              tempList?.forEach((category) => {
                if (
                  category.CategoryId === props.categoryToBeEdited?.CategoryId
                ) {
                  category.CategoryName = nameInput; //code edited on 3 Nov 2022 for BugId 110831
                  category.Description = descriptionInput;
                }
              });
              props.setCategoryList(tempList);
              props.setModalClosed();
            }
          });
      } else {
        let addCategoryJSON = {
          categoryName: nameInput, //code edited on 3 Nov 2022 for BugId 110831
          categoryId: +maxId + 1,
          description: encode_utf8(descriptionInput),
        };
        axios
          .post(SERVER_URL + ENDPOINT_ADD_CATEGORY, addCategoryJSON)
          .then((response) => {
            if (response.data.Status === 0) {
              let tempList = JSON.parse(JSON.stringify(catList));
              tempList?.push({
                CategoryId: +maxId + 1,
                CategoryName: nameInput, //code edited on 3 Nov 2022 for BugId 110831
                // code edited on 20 June 2022 for BugId 110848
                Description: descriptionInput,
                Templates: [],
              });
              if (type === BTN_TYPE_ADD_ANOTHER) {
                setNameInput("");
                setDescriptionInput("");
                // code added on 7 Sep 2022 for BugId 110830 and BugId 115256
                setCatList(tempList);
              } else if (type === BTN_TYPE_ADD_CLOSE) {
                props.setModalClosed();
                props.setCategoryList(tempList);
              }
            }
          });
      }
    }
  };

  useEffect(() => {
    if (props.categoryToBeEdited) {
      setNameInput(props.categoryToBeEdited.CategoryName);
      setDescriptionInput(decode_utf8(props.categoryToBeEdited.Description));
    }
  }, [props.categoryToBeEdited]);

  // added on 27-06-2023 for BUGID: 130819
  const containsSpecialChars = (str) => {
    if (isArabicLocaleSelected()) {
      var regex = new RegExp("[&*|:'\"<>?////]+");
      console.log("Arabic", locale);
      return !regex.test(str);
    } else {
      //Modified  on 10/08/2023, bug_id:132149
      var regex = new RegExp(/^[A-Za-z][^\\\/\:\*\?\"\<\>\|\'\&]*$/gm);
    }
    /*  var regex = new RegExp(
      /^[A-Za-z][A-Za-z0-9_\-\.\!\@\$\{\}\(\)\^\%\`\=\;\,\~]*$/gm
    ); */
    return regex.test(str);
  };

  const validateData = (e, val) => {
    if (e.target.value === "") {
      setErrorMsg(`${t("pleaseDefine")}${SPACE} ${val}`);
    } else if (e.target.value.length > 20) {
      setErrorMsg(`${val}${SPACE}${t("lengthShouldNotExceed20Characters")}`);
    } else if (!containsSpecialChars(e.target.value)) {
      if (isArabicLocaleSelected()) {
        setErrorMsg(
          `${val}${SPACE}${t("cannotContain")}${SPACE}&*|\:'"<>?/${SPACE}${t(
            "charactersInIt"
          )}`
        );
      } else {
        setErrorMsg(
          `${t("AllCharactersAreAllowedExcept")}${SPACE}&*|\:'"<>?/${SPACE}${t(
            "AndFirstCharacterShouldBeAlphabet"
          )}
        `
        );
      }
    } else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg(false);
    }
    // if (isValid == false) {
    //   if (val == "Category Name") {
    //     setNameInput(e.target.value);
    //   }
    // }
  };

  //Added  on 16/08/2023, bug_id:132149
  // const changeCategory = (e, val) => {
  //   setErrorMessage("");

  //   if (e.target.value.length > 0) {
  //     if (containsSpecialChars(e.target.value)) {
  //       setErrorMsg("");
  //       setNameInput(e.target.value);
  //     } else {
  //       setErrorMsg(
  //         `${val} can only start with alphanumeric characters and /\:*?"<>|&'#+ are not allowed at any place.`
  //       );
  //     }
  //   } else {
  //     setNameInput(e.target.value);
  //     setErrorMsg("");
  //     /* if (e.target.value.length != 0 && !containsSpecialChars(e.target.value)) {
  //       setNameInput("");
  //       setErrorMsg(
  //         `${val} can only start with alphanumeric characters and /\:*?"<>|&'#+ are not allowed at any place.`
  //       );
  //     } else {
  //       setNameInput(e.target.value);
  //       setErrorMsg("");
  //     } */
  //   }
  // };

  return (
    <div>
      <p
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.addCategoryHeading
            : styles.addCategoryHeading
        }
      >
        {props.categoryToBeEdited ? t("edit") : t("add")} {t("Category")}
      </p>
      <div style={{ marginBottom: "1rem" }}>
        <label
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.labelHeading
              : styles.labelHeading
          }
          htmlFor={`pmweb_template_AddCategory_CategoryName`}
        >
          {t("Category")} {t("Name")}
          <span className={styles.starIcon}>*</span>
        </label>
        <input
          value={nameInput}
          id={`pmweb_template_AddCategory_CategoryName`}
          ref={nameRef}
          onChange={(e) => {
            validateData(e, t("CategoryName"));
            setNameInput(e.target.value);
          }}
          style={{ marginBottom: "0rem" }}
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.nameInput
              : styles.nameInput
          }
          // added on 27-06-2023 for BUGID: 130819
          onKeyPress={(e) => FieldValidations(e, 150, nameRef.current, 20)}
          // added on 27-06-2023 for BUGID: 130819
          // onPaste={(e) => {
          //   validateData(e, "Category Name");
          // }}
        />
        {errorMsg != "" ? (
          <p
            style={{
              color: "red",
              fontSize: "12px",
              fontWeight: "500",
              marginInline: "10px",
            }}
          >
            {errorMsg}
          </p>
        ) : null}
      </div>
      <div>
        <label
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.labelHeading
              : styles.labelHeading
          }
          htmlFor="pmweb_template_AddCategory_description"
        >
          {t("Discription")}
        </label>
        <textarea
          value={descriptionInput}
          id="pmweb_template_AddCategory_description"
          onChange={(e) => setDescriptionInput(e.target.value)}
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.descInput
              : styles.descInput
          }
        />
      </div>
      <div
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.errorMessage
            : styles.errorMessage
        }
      >
        {errorMessage}
      </div>
      <div className={styles.buttonDiv}>
        <Button
          className={styles.cancelCategoryButton}
          onClick={props.setModalClosed}
          id="pmweb_template_AddCategory_Close"
        >
          {t("cancel")}
        </Button>
        {props.categoryToBeEdited ? (
          <Button
            className={
              nameInput === "" ||
              !nameInput ||
              errorMessage ||
              (nameInput === props.categoryToBeEdited?.CategoryName &&
                descriptionInput === props.categoryToBeEdited?.Description)
                ? styles.disabledCategoryButton
                : styles.addCategoryButton
            }
            onClick={() => {
              addCategoryFunc(BTN_TYPE_EDIT_CLOSE);
            }}
            disabled={
              nameInput === "" ||
              !nameInput ||
              errorMessage ||
              (nameInput === props.categoryToBeEdited?.CategoryName &&
                descriptionInput === props.categoryToBeEdited?.Description) ||
              errorMsg
            }
            id="pmweb_template_AddCategory_save"
          >
            {t("save")} {t("changes")}
          </Button>
        ) : (
          <React.Fragment>
            <Button
              className={
                nameInput === "" || !nameInput || errorMessage
                  ? styles.disabledCategoryButton
                  : styles.addCategoryButton
              }
              onClick={() => {
                addCategoryFunc(BTN_TYPE_ADD_ANOTHER);
              }}
              disabled={
                nameInput === "" || !nameInput || errorMessage || errorMsg
              }
              id="pmweb_template_AddCategory_addAnother"
            >
              {t("addAnother")}
            </Button>
            <Button
              className={
                nameInput === "" || !nameInput || errorMessage
                  ? styles.disabledCategoryButton
                  : styles.addCategoryButton
              }
              onClick={() => {
                addCategoryFunc(BTN_TYPE_ADD_CLOSE);
              }}
              disabled={
                nameInput === "" || !nameInput || errorMessage || errorMsg
              }
              id="pmweb_template_AddCategory_addClose"
            >
              {t("add&Close")}
            </Button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

export default AddCategoryModal;
