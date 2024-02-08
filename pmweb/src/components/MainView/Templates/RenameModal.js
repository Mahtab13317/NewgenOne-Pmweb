// Changes made to solve Bug with ID = 110141 => Project rename button is not working
import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import { useTranslation } from "react-i18next";
import styles from "./template.module.css";
import {
  SERVER_URL,
  ENDPOINT_EDIT_CATEGORY,
  RTL_DIRECTION,
  ENDPOINT_RENAME_PROJECT,
} from "../../../Constants/appConstants";
import axios from "axios";
import arabicStyles from "./templateArabicStyles.module.css";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import { useRef } from "react";
import { FieldValidations } from "../../../utility/FieldValidations/fieldValidations";

function RenameModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [nameInput, setNameInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const dispatch = useDispatch();
  const projectNameRef = useRef();

  const renameFunc = () => {
    let categoryNameArr = [];
    props.categoryList?.forEach((category) => {
      categoryNameArr.push(category.CategoryName.toLowerCase());
    });
    if (categoryNameArr.includes(nameInput.toLowerCase())) {
      setErrorMessage(`${t("CategorySameNameErr")}`);
    } else if (props.category) {
      let editCategoryJSON = {
        categoryName: nameInput,
        categoryId: props.elemToBeRenamed?.CategoryId,
        description: props.elemToBeRenamed?.Description,
      };
      axios
        .post(SERVER_URL + ENDPOINT_EDIT_CATEGORY, editCategoryJSON)
        .then((response) => {
          if (response.data.Status === 0) {
            let tempList = [...props.categoryList];
            tempList?.forEach((category) => {
              if (category.CategoryId === props.elemToBeRenamed?.CategoryId) {
                category.CategoryName = nameInput;
              }
            });
            props.setCategoryList(tempList);
            props.setModalClosed();
            dispatch(
              setToastDataFunc({
                message: t("categoryRenamedSuccessMsg"),
                severity: "success",
                open: true,
              })
            );
          }
        });
    } else {
      let editCategoryJSON = {
        projectname: nameInput,
        projectId: props.projectID,
      };
      axios
        .post(SERVER_URL + `${ENDPOINT_RENAME_PROJECT}`, editCategoryJSON)
        .then((response) => {
          if (response?.status === 200) {
            let tempList = JSON.parse(JSON.stringify(props.projectList));
            tempList?.forEach((project) => {
              if (project.ProjectId === props.projectID) {
                project.ProjectName = nameInput;
              }
            });
            props.setProjectList((prev) => {
              return { ...prev, Projects: tempList };
            });
            props.setModalClosed();
          }
        });
    }
  };

  const elementToRename = () => {
    if (props.category) {
      return t("Category");
    } else if (props.projectList) {
      return t("project");
    } else return t("Template");
  };

  // code added on 05 Dec 2022 for BugId 112900
  useEffect(() => {
    if (props?.processToDelete) {
      setNameInput(props?.processToDelete);
    }
  }, []);

  const handleKeyRename = (e) => {
    if (e.keyCode === 13) {
      renameFunc();
      e.stopPropagation();
    }
  };

  // React.useEffect(() => {
  //   document.addEventListener("keydown", handleKeyRename);
  //   return () => document.removeEventListener("keydown", handleKeyRename);
  // },[handleKeyRename]);

  return (
    <div>
      <p
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.addCategoryHeading
            : styles.addCategoryHeading
        }
      >
        {t("Rename")} {elementToRename()}
      </p>
      <div className="flex">
        <label
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.newNameHeading
              : styles.newNameHeading
          }
          htmlFor="pmweb_RenameProject_InputField"
        >
          {t("New")} {t("Name")}
          <span className={styles.starIcon}>*</span>
        </label>
        <input
          value={nameInput}
          onChange={(e) => {
            if (!isNaN(e.target.value.charAt(0)) && e.target.value != "") {
              e.preventDefault();
            } else {
              setNameInput(e.target.value);
            }

            setErrorMessage("");
          }}
          tabIndex={0}
          id="pmweb_RenameProject_InputField"
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.newNameInput
              : styles.newNameInput
          }
          ref={projectNameRef}
          onPaste={(e) => {
            setTimeout(() => {
              setNameInput(e.target.value?.slice(0, 59));
            }, 10);
          }}
          onKeyPress={(e) => {
            if (!isNaN(e.target.value.charAt(0)) && e.target.value != "") {
              e.preventDefault();
            } else {
              FieldValidations(e, 150, projectNameRef.current, 60);
            }
          }}
          //code added on 18 October 2022 for BugId 116217
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
          id="pmweb_RenameProject_Cancel"
          tabIndex={0}
          // onKeyDown={(e)=>handleKeyCancel(e)}
        >
          {t("cancel")}
        </Button>
        <Button
          className={
            nameInput.trim() === "" || !nameInput || errorMessage
              ? styles.disabledCategoryButton
              : styles.addCategoryButton
          }
          onClick={() => {
            renameFunc();
          }}
          onKeyDown={(e) => handleKeyRename(e)}
          id="pmweb_RenameProject_OK"
          disabled={nameInput.trim() === "" || !nameInput || errorMessage}
        >
          {t("Rename")}
        </Button>
      </div>
    </div>
  );
}

export default RenameModal;
