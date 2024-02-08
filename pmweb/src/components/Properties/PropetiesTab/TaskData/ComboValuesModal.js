// #BugID - 121775
// #BugDescription - Added validation for duplicate value in combolist.
// #BugID - 121811
// #BugDescription - Added validation for dynamic query and handled both slection data.
// #BugID - 111440
// #BugDescription - Added validation for combo value and created the validateCombo() function to prevent the data according to type.
import React, { useState, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ModalForm from "./../../../../UI/ModalForm/modalForm";
import Field from "./../../../../UI/InputFields/TextField/Field";
import { useTranslation } from "react-i18next";
import { Grid, Button, Typography } from "@material-ui/core";
import { DeleteIcon } from "../../../../utility/AllImages/AllImages";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { useDispatch } from "react-redux";
import {
  ENDPOINT_VALIDATE_QUERY,
  SERVER_URL,
  SPACE,
} from "../../../../Constants/appConstants";
import axios from "axios";
import {
  MaximumLengthText,
  getGenErrMsg,
  isArabicLocaleSelected,
} from "./../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { convertToArabicDate } from "../../../../UI/DatePicker/DateInternalization";

const useStyles = makeStyles((props) => ({
  container: {
    marginTop: "4rem",
  },
  deleteBtn: {
    marginTop: ".5rem",
    width: "1.3rem",
    height: "1.3rem",
  },
  comboValues: {
    width: "100%",
    overflowY: "auto",
    padding: "0.5rem 1vw",
    height: "11rem",
    border: "1px solid #CECECE",
    "&::-webkit-scrollbar": {
      backgroundColor: "transparent",
      width: "0.375rem",
      height: "1.125rem",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "#8c8c8c 0% 0% no-repeat padding-box",
      borderRadius: "0.313rem",
    },
    scrollbarColor: "#8c8c8c #fafafa",
    scrollbarWidth: "thin",
  },
}));
// const [isWrong, setIsWrong] = useState(false);
/*Making inputs for fields */
const makeFieldInputs = (value) => {
  return {
    value: value,
    error: false,
    helperText: "",
  };
};

const ComboValuesModal = (props) => {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const { editedComboVar, isReadOnly } = props;
  const [open, setOpen] = useState(props.isOpen ? true : false);
  const [valueType, setValueType] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [comboVal, setComboVal] = useState(makeFieldInputs(""));
  const [dynamicVal, setDynamicVal] = useState(makeFieldInputs(""));
  const [comboValList, setComboValList] = useState([]);
  const radioButtonsArrayForValueType = [
    { label: t("static"), value: "static" },
    { label: t("dynamic"), value: "dynamic" },
  ];

  const containsSpecialChars = (str) => {
    //Modified on 04/09/2023, bug_id:135630
    if (isArabicLocaleSelected()) {
      var regex = new RegExp("[&*|:'\"<>?////]+");
      return !regex.test(str);
    } else {
      var regex = new RegExp("[&*|:'\"<>?////]+");
    }
    return !regex.test(str);

    //till here for bug_id:135630

    /*  var regex = new RegExp(/^[A-Za-z][^\\\/\:\*\?\"\<\>\|\'\&]*$/gm);
    return regex.test(str); */
  };

  const validateData = (e, val) => {
    //Modified on 28/08/2023, bug_id:134644
    if (
      !containsSpecialChars(e.target.value) &&
      editedComboVar.m_strVariableType != "8"
    ) {
      //till here for bug_id:134644

      //if (!containsSpecialChars(e.target.value)) {

      //Modified on 04/09/2023, bug_id:135630
      if (isArabicLocaleSelected()) {
        setErrorMsg(
          `${val}${SPACE}${t("cannotContain")}${SPACE}&*|\:'"<>?/${SPACE}${t(
            "charactersInIt"
          )}`
        );
      } else {
        setErrorMsg(
          `${t("AllCharactersAreAllowedExcept")}${SPACE}\ / : * ? " < > | '`
        );
      }
      //till here for bug_id:135630
      /*  setErrorMsg(
        `All characters are allowed except  \ / : * ? " < > | ' & and first character should be alphabet.`
      ); */
    } else {
      setErrorMsg("");
    }
    if (e.target.value == "") {
      setErrorMsg(false);
    }
  };

  useEffect(() => {
    if (editedComboVar) {
      if (editedComboVar.m_strDBLinking === "Y") {
        setValueType("dynamic");
        setDynamicVal({
          ...dynamicVal,
          //value: editedComboVar.m_arrComboPickList[0]?.name,
          value: editedComboVar.m_strTaskDynamicQuery,
          /* value:
            editedComboVar?.m_arrComboPickList?.length > 0
              ? editedComboVar.m_arrComboPickList[0]?.name
              : editedComboVar.m_strTaskDynamicQuery,*/
        });
      } else {
        setValueType("static");
        setComboValList(editedComboVar?.m_arrComboPickList || []);
      }
      // setComboValList(editedComboVar.m_arrComboPickList || []);
    }
  }, [editedComboVar]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "ValueType":
        setValueType(value);
        break;
      case "ComboValue":
        // if (e.target.value.includes("@")) {
        //   setIsWrong(true);
        // } else {
        //   setIsWrong(false);
        // }
        setComboVal({ ...comboVal, value });
        validateData(e, t("comboVal"));
        break;
      case "DynamicValue":
        setDynamicVal({ ...dynamicVal, value });
        break;
      default:
        break;
    }
  };

  const handleClose = () => {
    setOpen(false);
    props.handleClose();
  };

  const onClick1 = () => {
    handleClose();
  };

  const onClick2 = () => {
    const newComboVar = { ...editedComboVar };
    if (valueType === "static") {
      newComboVar["m_strDBLinking"] = "N";

      if (comboValList?.length > 0) {
        newComboVar["m_arrComboPickList"] = [...comboValList].map((item) => ({
          ...item,
          orderId: 0,
        }));
        props?.saveComboVal && props?.saveComboVal(newComboVar);
      } else {
        const msg = getGenErrMsg("comboVal", "couldNotBeBlank", t);
        dispatch(
          setToastDataFunc({
            message: msg,
            severity: "error",
            open: true,
          })
        );
      }

      //
    } else {
      const postData = {
        query: dynamicVal.value,
      };

      axios
        .post(`${SERVER_URL}${ENDPOINT_VALIDATE_QUERY}`, postData)
        .then((res) => {
          console.log(res);
          if (res?.data?.valid === true) {
            newComboVar["m_strDBLinking"] = "Y";
            newComboVar["m_arrComboPickList"] = [];
            newComboVar["m_strTaskDynamicQuery"] = dynamicVal.value;
            props.saveComboVal && props.saveComboVal(newComboVar);
          } else {
            dispatch(
              setToastDataFunc({
                message: t("EnterValidQueryError"),
                severity: "error",
                open: true,
              })
            );
          }
        });
    }
  };

  //code added on 27 JAN 2023 for BugId 122628
  const handleComboValueList = () => {
    const comboList = [...comboValList];
    if (comboVal.value) {
      if (valueType === "static") {
        const errorText = MaximumLengthText(comboVal.value, 255);
        if (errorText) {
          dispatch(
            setToastDataFunc({
              message: `${errorText}`,
              severity: "error",
              open: true,
            })
          );
          return;
        }
      }
      // if (isWrong) {
      //   comboVal.value = "";
      //   return;
      // }
      if (
        comboList.filter((e) => e.name.trim() === comboVal.value.trim())
          .length > 0
      ) {
        //Modified on 06/10/2023, bug_id:137372
        const msg = getGenErrMsg("comboVal", "withTheSameNameAlreadyExists", t);
        dispatch(
          setToastDataFunc({
            message: msg,
            severity: "error",
            open: true,
          })
        );
        //till here for bug_id:137372
        /* dispatch(
          setToastDataFunc({
            message: "This combo value already exist",
            severity: "error",
            open: true,
          })
        ); */
      } else {
        const newCombo = { name: comboVal.value };
        setComboValList([...comboList, newCombo]);
      }

      /*****************************************************************************************
       * @author asloob_ali BUG ID : 111424   Description : Task Workdesk: Delete button for combo Box is deleting every value which are added except the one which should be deleted
       * Reason: state  updatation was not correct, only deleted values were getting updated.
       *  Resolution :updated state correctly.
       *  Date : 30/08/2022             **************/
      setComboVal({ ...comboVal, value: "" });
    }
  };

  const handleDeleteComboValue = (index) => {
    const comboList = [...comboValList];
    comboList.splice(index, 1);
    setComboValList(comboList);
  };

  return (
    <ModalForm
      isOpen={open}
      title={`${t("combo")} ${t("box")} ${t("value")} ${t("definition")}`}
      Content={
        <Content
          valueType={valueType}
          radioButtonsArrayForValueType={radioButtonsArrayForValueType}
          comboVal={comboVal}
          comboValList={comboValList}
          dynamicVal={dynamicVal}
          handleChange={handleChange}
          handleComboValueList={handleComboValueList}
          handleDeleteComboValue={handleDeleteComboValue}
          editedComboVar={editedComboVar}
          isReadOnly={isReadOnly}
          errorMsg={errorMsg}
          validateData={validateData}
        />
      }
      btn1Title={t("cancel")}
      errorMsg={errorMsg}
      btn2Title={t("save")}
      headerCloseBtn={true}
      onClickHeaderCloseBtn={handleClose}
      onClick1={onClick1}
      onClick2={onClick2}
      closeModal={handleClose}
      containerWidth={640}
    />
  );
};
export default ComboValuesModal;

/*Fields, content of the modal */
const Content = ({
  valueType,
  radioButtonsArrayForValueType,
  handleChange,
  comboVal,
  comboValList,
  dynamicVal,
  handleComboValueList,
  handleDeleteComboValue,
  editedComboVar,
  isReadOnly,
  errorMsg,
  validateData,
}) => {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  const classes = useStyles({ direction });
  const comboValRef = useRef();
  /*****************************************************************************************
     * @author asloob_ali BUG ID : 111440 Description : 111440 -  Task Combo Box IBPS 5 Comparison: the static field does not allow to type, it allows only integer values which is not the case with IBPS 5
     *  Reason: input type was mapped to the wrong m_iVariableType key not correct.
     * Resolution : now input type is mapped with m_strVariableType.
  
     *  Date : 01/07/2022             ****************/

  const validateCombo = (e, comboValRef, type) => {
    if (+type === 8 || +type === +10) {
      FieldValidations(e, 10, comboValRef.current, 50);
      if (e.charCode === 64) {
        e.preventDefault();
      }
    } else {
      if (+type === 3) {
        FieldValidations(e, 3, comboValRef.current, 50);
      }
      if (+type === 4) {
        FieldValidations(e, 4, comboValRef.current, 50);
      }
      if (+type === 6) {
        FieldValidations(e, 6, comboValRef.current, 50);
      }
    }

    /* if (type != "8" && type != "10") {
        const regex = /^\d*[.]?\d*$/;
        if (regex.test(e.target.value)) {
          FieldValidations(e, 10, comboValRef.current, 10);
        } else {
          e.preventDefault();
        }
      } else {
        FieldValidations(e, 10, comboValRef.current, 10);
      } */
  };

  return (
    <div className={classes.root}>
      <Grid container direction="column" spacing={1}>
        <Grid item>
          <Field
            radio={true}
            ButtonsArray={radioButtonsArrayForValueType}
            name="ValueType"
            value={valueType}
            onChange={handleChange}
            disabled={isReadOnly}
          />
        </Grid>
        {valueType === "static" && (
          <>
            <Grid item container spacing={1} xs alignItems={"flex-end"}>
              <Grid item xs={6}>
                <Field
                  required={true}
                  type={
                    editedComboVar.m_strVariableType == "8"
                      ? "date"
                      : editedComboVar.m_strVariableType == "10"
                      ? "text"
                      : "number"
                  }
                  name="ComboValue"
                  label={`${t("combo")} ${t("value")}`}
                  value={comboVal.value}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  inputRef={comboValRef}
                  onPaste={(e) => {
                    setTimeout(() => validateData(e, "Trigger_Name"), 200);
                  }}
                  onKeyPress={(e) => {
                    if (e.charCode == "13") {
                      e.preventDefault();
                    } else {
                      /*Bug 110099 no character limit is available for naming the Group on Exception Screen
                      [09-03-2023] Corrected the parameter from 50 to 51 as it is excluded one */
                      FieldValidations(e, 172, comboValRef.current, 51);
                    }
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                {!isReadOnly && (
                  <Button
                    className="secondary"
                    onClick={() => handleComboValueList()}
                    disabled={errorMsg ? true : false}
                  >
                    {t("add")}
                  </Button>
                )}
              </Grid>
            </Grid>
            {errorMsg ? (
              <p
                style={{
                  color: "red",
                  fontSize: "var(--sub_text_font_size)",
                  marginTop: "-0.75rem",
                  marginBottom: "0.5rem",
                  display: "block",
                }}
              >
                {errorMsg}
              </p>
            ) : (
              ""
            )}
            <Grid item>
              <div className={classes.comboValues}>
                <Grid container direction="column" spacing={1}>
                  {comboValList?.map((item, index) => (
                    <Grid item style={{ padding: "0" }}>
                      <Grid container alignItems="center">
                        <Grid item>
                          <Typography
                            style={{ fontSize: "var(sub_text_font_size)" }}
                          >
                            {/* modified on 27/09/23 for BugId 136677 */}
                            {/* {item.name || ""} */}
                            {convertToArabicDate(item.name) || ""}
                            {/* till here BugId 136677 */}
                          </Typography>
                        </Grid>
                        <Grid item style={{ marginInlineStart: "auto" }}>
                          {!isReadOnly && (
                            <DeleteIcon
                              className={classes.deleteBtn}
                              style={{
                                cursor: "pointer",
                              }}
                              onClick={() => handleDeleteComboValue(index)}
                            />
                          )}
                        </Grid>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
              </div>
            </Grid>
          </>
        )}
        {valueType === "dynamic" && (
          <Grid item container spacing={1} xs alignItems="flex-end">
            <Grid item xs>
              <Field
                multiline={true}
                name="DynamicValue"
                label={`${t("value")}`}
                value={dynamicVal.value}
                onChange={handleChange}
                disabled={isReadOnly}
              />
            </Grid>
          </Grid>
        )}
      </Grid>
    </div>
  );
};
