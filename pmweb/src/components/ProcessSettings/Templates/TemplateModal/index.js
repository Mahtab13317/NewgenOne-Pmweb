// #BugID - 111751
// #BugDescription - Cleared input and output formats when user changes tools.
// Changes made to solve Bug 118216 - Register Template: while modifying the templates the selected values in the field are getting removed
// #BugID - 117775
// #BugDescription - In argument statement added the angle bracket with ampersand and in edit template added the selection functionality to select the argument.
// #BugID - 121398
// #BugDescription - Populated the complex variable in the list
import React, { useEffect, useState } from "react";
import styles from "../index.module.css";
import clsx from "clsx";
import {
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
} from "@material-ui/core";
import { Close } from "@material-ui/icons/";
import { useTranslation } from "react-i18next";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  SERVER_URL,
  ENDPOINT_GET_REGISTER_TEMPLATE,
  CONFIG,
  COMPLEX_VARTYPE,
  RTL_DIRECTION,
  SPACE,
  PMWEB_CONTEXT,
  ENDPOINT_REGISTER_TEMPLATE_MULTILINGUAL,
} from "../../../../Constants/appConstants";
import { store, useGlobalState } from "state-pool";
import MultiSelect from "../../../../UI/MultiSelect";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { useRef } from "react";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";
import { addConstantsToString } from "../../../../utility/ProcessSettings/Triggers/triggerCommonFunctions";
import {
  decode_utf8,
  encode_utf8,
} from "../../../../utility/UTF8EncodeDecoder";
import arabicStyles from "../ArabicStyles.module.css";
import { validateUploadedFile } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

function TemplateModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [selectedTool, setSelectedTool] = useState("");
  const [toolsList, setToolsList] = useState([]);
  const [configData, setConfigData] = useState([]);
  const [selectedInputFormat, setselectedInputFormat] = useState("");
  const [selectedDoctype, setselectedDoctype] = useState("");
  const [selectedOutput, setselectedOutput] = useState("");
  const [selectedDateFormat, setselectedDateFormat] = useState("");
  const [argumentStatement, setargumentstatement] = useState(null);
  const [docList, setdocList] = useState([]);
  const [argumentList, setargumentList] = useState([]);
  const [selectedVariableList, setselectedVariableList] = useState([]);
  const [selectedInputFormatList, setSelectedInputFormatList] = useState([]);
  const [selectedOutputFormatList, setSelectedOutputFormatList] = useState([]);
  const [selectedFile, setselectedFile] = useState();
  const [enableToSelectFile, setEnableToSelectFile] = useState(null);
  const localeList = [
    { type: "English(United States)", value: "en_US" },
    {
      type: "English",
      value: "en",
    },
    { type: "Arabic(Saudi Arabia)", value: "ar_SA" },
    {
      type: "Arabic",
      value: "ar",
    },
  ];
  const [selectedLocale, setSelectedLocale] = useState(localeList[0]);
  const [isLocaleChecked, setIsLocaleChecked] = useState(false);
  const [disableLocaleCheckBox, setDisableLocaleCheckBox] = useState(false);

  const dateList = [
    "dd/MMM/yyyy",
    "yyyy-MM-dd",
    "M/d/yyyy",
    "M/d/yy",
    "MM/dd/yy",
    "MM/dd/yyyy",
    "yy/MM/dd",
    "yyyy-MM-dd",
    "dd-MMM-yy",
    "dddd,MMMM dd,yyyy",
    "MMMMM dd yy",
    "dddd,dd MMMMM,yyyy",
    "dd MMMMM, yyyy",
    "dd-MM-yyyy",
    "dd/MM/yyyy",
  ];
  const dispatch = useDispatch();
  const [selectedTemplateName, setselectedTemplateName] = useState("");
  const sectionNameRef = useRef();
  const argumentRef = useRef();

  const handleLocale = (e) => {
    let val = localeList.filter((item) => item.type === e.target.value);
    setSelectedLocale(val[0]);
  };

  const getPrevData = (id) => {
    let temp = [...props.templateData];
    let prevData = temp.filter((item) => +item.templateId === id);
    return prevData[0];
  };

  const getComplex = (variable) => {
    let varList = [];
    let varRelationMapArr = variable?.RelationAndMapping
      ? variable.RelationAndMapping
      : variable["Relation&Mapping"];
    varRelationMapArr?.Mappings?.Mapping?.forEach((el) => {
      if (el.VariableType === "11") {
        let tempList = getComplex(el);
        tempList.forEach((ell) => {
          varList.push({
            ...ell,
            SystemDefinedName: `${variable.VariableName}.${ell.VariableName}`,
            VariableName: `${variable.VariableName}.${ell.VariableName}`,
          });
        });
      } else {
        varList.push({
          DefaultValue: "",
          ExtObjectId: el.ExtObjectId ? el.ExtObjectId : variable.ExtObjectId,
          SystemDefinedName: `${variable.VariableName}.${el.VariableName}`,
          Unbounded: el.Unbounded,
          VarFieldId: el.VarFieldId,
          VarPrecision: el.VarPrecision,
          VariableId: el.VariableId,
          VariableLength: el.VariableLength,
          VariableName: `${variable.VariableName}.${el.VariableName}`,
          VariableScope: el.VariableScope
            ? el.VariableScope
            : variable.VariableScope,
          VariableType: el.VariableType,
        });
      }
    });

    return varList;
  };

  // code updated on 2 January 2023 for BugId 121385
  useEffect(() => {
    if (props.selected && props.calledPlace === "editPencil") {
      setselectedDateFormat(props.selected.templateDateFormat);
      setselectedDoctype(props.selected.docName);
      // code edited on 17 April 2023 for BugId 126968 - Register template - encrypted data is displayed
      setargumentstatement(decode_utf8(props.selected.templateArgument));
      setSelectedTool(props.selected.templateTool);
      let InputFormatList = [];
      configData &&
        configData.forEach((element) => {
          if (element.Tool === props.selected.templateTool) {
            element.SupportedSet?.forEach((el) => {
              if (!InputFormatList.includes(el.InputFormat)) {
                InputFormatList.push(el.InputFormat);
              }
            });
          }
        });

      setSelectedInputFormatList(InputFormatList);
      setselectedInputFormat(props.selected.templateInputFormat);
      setEnableToSelectFile(true);

      let outputFormat = [];
      configData?.forEach((el) => {
        if (el?.Tool === selectedTool) {
          el.SupportedSet?.forEach((data) => {
            if (data.InputFormat === props.selected.templateInputFormat) {
              outputFormat.push(data.OutputFormat);
            }
          });
        }
      });
      setSelectedOutputFormatList(outputFormat);
      setselectedOutput(props.selected.templateFormat);
    } else if (props.calledPlace == "createNew") {
      setselectedDateFormat("");
      setselectedDoctype("");
      setselectedOutput("");
      setselectedInputFormat("");
      setargumentstatement("");
      setEnableToSelectFile(null);
    }
  }, [props.selected, configData]);

  useEffect(() => {
    if (selectedFile) {
      const checkType = selectedFile?.name.split(".");
      if (checkType[checkType?.length - 1] == selectedInputFormat) {
        setselectedTemplateName(selectedFile?.name);
      } else {
        setselectedFile(null);
        dispatch(
          setToastDataFunc({
            message: t("docExtenionError"),
            severity: "error",
            open: true,
          })
        );
      }
    }
  }, [selectedFile?.name, selectedInputFormat]);

  const setLocaleDisability = (type, value) => {
    let doDisable = false;
    if (props.calledPlace === "editPencil") {
      switch (type) {
        case "TemplateTool": {
          if (props.selected.templateTool !== value) {
            doDisable = true;
          }
          break;
        }
        case "TemplateType": {
          if (props.selected.templateType !== value) {
            doDisable = true;
          }
          break;
        }
        case "TemplateOutputFormat": {
          if (props.selected.templateFormat !== value) {
            doDisable = true;
          }
          break;
        }
        case "TemplateDateFormat": {
          if (props.selected.templateDateFormat !== value) {
            doDisable = true;
          }
          break;
        }
      }
    }
    setDisableLocaleCheckBox(doDisable);
  };

  // const menuProps = {
  //   anchorOrigin: {
  //     vertical: "bottom",
  //     horizontal: "left",
  //   },
  //   transformOrigin: {
  //     vertical: "top",
  //     horizontal: "left",
  //   },
  //   style: {
  //     maxHeight: 400,
  //   },
  //   getContentAnchorEl: null,
  // };

  const uploadFile = (e) => {
    setselectedFile(e.target.files[0]);
  };

  useEffect(() => {
    let statement = "";
    if (selectedVariableList.length > 0) {
      selectedVariableList.map((el) => {
        // return (statement = statement + "&" + el.VariableName + "&");

        //Modified on 29/08/2023, bug_id:130838
        // statement = addConstantsToString(statement, el?.VariableName);
        if (el != "default") {
          statement = addConstantsToString(statement, el?.VariableName);
        }

        return statement;
      });
      setargumentstatement(statement);
    }
  }, [selectedVariableList]);

  const getVarDetails = (name) => {
    let tempVar = "";
    let temp = {};
    if (name.includes(".")) {
      tempVar = name.substring(0, name.indexOf("."));

      localLoadedProcessData?.Variable?.forEach((item) => {
        if (item.VariableName == tempVar) {
          // getComplex(item).map((data) => {
          getComplex(item)?.forEach((data) => {
            if (data.VariableName == name) {
              temp = data;
            }
          });
        }
      });
    } else {
      localLoadedProcessData?.Variable?.forEach((item) => {
        if (item.VariableName == name) {
          temp = item;
        }
      });
    }

    return temp;
  };

  useEffect(() => {
    let temp = [];
    localLoadedProcessData &&
      localLoadedProcessData.DocumentTypeList.forEach((el) => {
        temp.push(el.DocName);
      });

    setdocList(temp);

    let newArr = [];
    /*  localLoadedProcessData.Variable.map((el) => {
      return newArr.push(el);
    }); */

    let tempVarList = [];
    localLoadedProcessData?.Variable?.forEach((_var) => {
      if (_var.VariableType === COMPLEX_VARTYPE) {
        let tempList = getComplex(_var);
        tempList?.forEach((el) => {
          tempVarList.push(el);
        });
      } else {
        tempVarList.push(_var);
      }
    });
    setargumentList(tempVarList);

    //below code is to convert the string argument into array and bt default selected in dropdown list
    //code edited on 19 April 2023 for BugId 127171
    let tempArg = decode_utf8(props?.selected?.templateArgument);
    if (tempArg && props?.calledPlace == "editPencil") {
      tempArg = tempArg.replaceAll("&", "");
      tempArg = tempArg.replaceAll("<", "");
      tempArg = tempArg.replaceAll(">", ",");
      const result = tempArg.slice(0, -1);

      const myArray = result.split(",");

      const resultSelectedList = myArray.map((item) => {
        return getVarDetails(item);
      });

      setselectedVariableList(resultSelectedList);
    }
  }, []);

  useEffect(() => {
    axios
      .get(SERVER_URL + ENDPOINT_GET_REGISTER_TEMPLATE + CONFIG)
      .then((res) => {
        setConfigData(res.data.ToolDetails.ToolDetail);
        if (res.data.Status === 0) {
          setConfigData(res.data);
        }
      });
  }, []);

  useEffect(() => {
    if (configData) {
      let listOfTools = [];
      configData &&
        configData.forEach((element) => {
          listOfTools.push(element.Tool);
        });
      setToolsList(listOfTools);
    }
  }, [configData]);

  const toolselectorHandler = (event) => {
    setSelectedTool(event.target.value);
    setselectedInputFormat("");
    setselectedOutput("");

    let InputFormatList = [];

    configData &&
      configData.forEach((element) => {
        if (element.Tool === event.target.value) {
          element.SupportedSet?.forEach((el) => {
            if (!InputFormatList.includes(el.InputFormat)) {
              InputFormatList.push(el.InputFormat);
            }
          });
        }
      });

    setSelectedInputFormatList(InputFormatList);
    setLocaleDisability("TemplateTool", event.target.value);
    setLocaleDisability("TemplateType", "");
  };

  const documentSelectHandler = (event) => {
    setselectedDoctype(event.target.value);

    if (selectedTool == "") {
      dispatch(
        setToastDataFunc({
          message: t("toolTemplateError"),
          severity: "error",
          open: true,
        })
      );
    }

    if (selectedInputFormat == "") {
      dispatch(
        setToastDataFunc({
          message: t("docTemplateError"),
          severity: "error",
          open: true,
        })
      );
    }
  };

  const getLocale = (prev, curr) => {
    if (prev === null) return curr;
    if (curr === "") return prev;

    let prevArray = prev.split(",");
    if (prevArray) {
      if (prevArray.includes(curr)) {
        return prev;
      } else {
        prevArray.push(curr);
        prevArray.sort();
        let ans = "";
        prevArray.map((item) => {
          ans = ans === "" ? item : ans + ", " + item;
        });
        return ans;
      }
    }
    return "";
  };

  // code added on 11 October 2022 for BugId 116472
  const registerHandler = async () => {
    let templateIdd = props?.selected?.templateId;

    if (selectedDoctype == "") {
      dispatch(
        setToastDataFunc({
          message: t("docFomatError"),
          severity: "error",
          open: true,
        })
      );
      return false;
    } else if (selectedOutput == "") {
      dispatch(
        setToastDataFunc({
          message: t("outputfomatError"),
          severity: "error",
          open: true,
        })
      );
    } else if (selectedDateFormat == "") {
      dispatch(
        setToastDataFunc({
          message: t("dateFomatError"),
          severity: "error",
          open: true,
        })
      );
    } else if (argumentStatement == "") {
      dispatch(
        setToastDataFunc({
          message: t("argumentError"),
          severity: "error",
          open: true,
        })
      );
    } else {
      //check if the file Input Format got changed and no file is selected
      if (props.calledPlace === "editPencil") {
        let prev = getPrevData(+templateIdd);
        if (prev.templateInputFormat !== selectedInputFormat && !selectedFile) {
          dispatch(
            setToastDataFunc({
              message: t("selectFileError"),
              severity: "error",
              open: true,
            })
          );
          return;
        }
      }
      //if creating new Template, and No File is selected
      else {
        if (!selectedFile) {
          dispatch(
            setToastDataFunc({
              message: t("selectFileError"),
              severity: "error",
              open: true,
            })
          );
          return;
        }
      }

      // Modified on 03-10-23 for Bug 138659
      if (!validateUploadedFile(selectedFile?.size, 30)) {
        // code added on 30 September 2022 for BugId 116474

        let payload = {
          templateType: selectedInputFormat,
          templateArgument: encode_utf8(argumentStatement), // code edited on 17 April 2023 for BugId 126968 - Register template - encrypted data is displayed
          templateFormat: selectedOutput,
          templateInputFormat: selectedInputFormat,
          templateDateFormat: selectedDateFormat,
          templateTool: selectedTool,
          docName: selectedDoctype,
          templateId: props.calledPlace === "editPencil" ? templateIdd : null,
          locale: null,
        };
        const formData = new FormData();
        formData.append("docFile", selectedFile);
        formData.append(
          "registerTemplateInfo",
          new Blob([JSON.stringify(payload)], {
            type: "application/json",
          })
        );

        try {
          const response = await axios({
            method: props.calledPlace == "editPencil" ? "put" : "post",
            url: "/pmweb/registerTemplate",
            data: formData,
            headers: {
              "Content-Type": "multipart/form-data",
              // type: "application/json",
            },
          });
          if (response) {
            if (props.calledPlace === "createNew") {
              props.setTemplateData((prev) => {
                let temp = [...prev];
                temp.push({
                  ...response.data,
                  docName: selectedDoctype,
                });
                return temp;
              });

              dispatch(
                setToastDataFunc({
                  message: t("template") + SPACE + t("registeredSuccessfully"),
                  severity: "success",
                  open: true,
                })
              );
            } else if (props.calledPlace === "editPencil") {
              let temp = [...props.templateData];
              temp = temp?.map((el) => {
                if (+el.templateId === +templateIdd) {
                  el.docName = selectedDoctype;
                  el.isEncrypted = "Y";
                  el.locale = getLocale(el.locale, "");
                  el.status = "I";
                  el.templateArgument = argumentStatement;
                  el.templateBuffer = null;
                  el.templateDateFormat = selectedDateFormat;
                  el.templateFormat = selectedOutput;
                  el.templateId = templateIdd;
                  el.templateInputFormat = selectedInputFormat;
                  el.templateName = null;
                  el.templateTool = selectedTool;
                  el.templateType = selectedInputFormat;
                }
                return el;
              });
              props.setTemplateData(temp);
            }
            props.setIsModalOpen(false);
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        dispatch(
          setToastDataFunc({
            message: t("fileExceedsMaxSizeMessage"),
            severity: "error",
            open: true,
          })
        );
      }
      // Till here for Bug 138659
    }
  };

  const registerMultilingual = async (e) => {
    let templateIdd = props?.selected?.templateId;

    if (selectedDoctype == "") {
      dispatch(
        setToastDataFunc({
          message: t("docFomatError"),
          severity: "error",
          open: true,
        })
      );
      return false;
    } else if (selectedOutput == "") {
      dispatch(
        setToastDataFunc({
          message: t("outputfomatError"),
          severity: "error",
          open: true,
        })
      );
    } else if (selectedDateFormat == "") {
      dispatch(
        setToastDataFunc({
          message: t("dateFomatError"),
          severity: "error",
          open: true,
        })
      );
    } else if (argumentStatement == "") {
      dispatch(
        setToastDataFunc({
          message: t("argumentError"),
          severity: "error",
          open: true,
        })
      );
    } else {
      if (!selectedFile) {
        dispatch(
          setToastDataFunc({
            message: t("selectFileError"),
            severity: "error",
            open: true,
          })
        );
        return;
      }
      // Modified on 03-10-23 for Bug 138659
      if (!validateUploadedFile(selectedFile?.size, 30)) {
        // code added on 30 September 2022 for BugId 116474

        let payload = {
          templateId: templateIdd,
          locale: selectedLocale.value,
        };
        const formData = new FormData();
        formData.append("docFile", selectedFile);
        formData.append(
          "registerTemplateInfo",
          new Blob([JSON.stringify(payload)], {
            type: "application/json",
          })
        );

        try {
          const response = await axios({
            method: "post",
            url: `${PMWEB_CONTEXT}${ENDPOINT_REGISTER_TEMPLATE_MULTILINGUAL}`,
            data: formData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          if (response) {
            let temp = [...props.templateData];
            temp = temp?.map((el) => {
              if (+el.templateId === +templateIdd) {
                el.docName = selectedDoctype;
                el.isEncrypted = "Y";
                el.locale = getLocale(el.locale, selectedLocale?.value);
                el.status = "I";
                el.templateArgument = argumentStatement;
                el.templateBuffer = null;
                el.templateDateFormat = selectedDateFormat;
                el.templateFormat = selectedOutput;
                el.templateId = templateIdd;
                el.templateInputFormat = selectedInputFormat;
                el.templateName = null;
                el.templateTool = selectedTool;
                el.templateType = selectedInputFormat;
              }
              return el;
            });
            props.setTemplateData(temp);

            props.setIsModalOpen(false);
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        dispatch(
          setToastDataFunc({
            message: t("fileExceedsMaxSizeMessage"),
            severity: "error",
            open: true,
          })
        );
      }
      // Till here for Bug 138659
    }
  };

  const handleInputFormatChange = (e) => {
    setEnableToSelectFile(true);
    setselectedInputFormat(e.target.value);
    let outputFormat = [];
    configData?.forEach((el) => {
      if (el?.Tool === selectedTool) {
        el.SupportedSet?.forEach((data) => {
          if (data.InputFormat === e.target.value) {
            outputFormat.push(data.OutputFormat);
          }
        });
      }
    });
    setSelectedOutputFormatList(outputFormat);
    setLocaleDisability("TemplateType", e.target.value);
  };

  // Function that is called when Enter key or Esc key is pressed.
  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      registerHandler();
    } else if (e.keyCode === 27) {
      props.setIsModalOpen(false);
      e.stopPropagation();
    }
  };

  // Function that runs when the handleKeyDown value changes.
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={{ padding: "6px" }}>
      <div className={clsx(styles.flexRow, styles.modalHeadingDiv)}>
        <p className={styles.modalHeading}>{t("registerTemplate")}</p>
        <Close
          tabIndex={0}
          id="pmweb_TemplateModal_CloseModalIcon"
          className={styles.closeIcon}
          onClick={() => props.setIsModalOpen(false)}
          fontSize="small"
          onKeyDown={(e) => {
            if (e.keyCode === 13) {
              props.setIsModalOpen(false);
              e.stopPropagation();
            }
          }}
        />
      </div>
      <Divider className={styles.modalDivider} />
      <div className={styles.templateModalDiv}>
        <div className="row">
          <div>
            <p className={styles.labelTittle}>
              {t("tools")} <span style={{ color: "rgb(181,42,42)" }}>*</span>
            </p>
            <CustomizedDropdown
              id="pmweb_TemplateModal_ToolsDropdown"
              // disabled={isProcessReadOnly || disabled}
              // className={
              //   direction === RTL_DIRECTION
              //     ? arabicStyles.dropdown
              //     : styles.dropdown
              // }
              value={selectedTool}
              onChange={(event) => toolselectorHandler(event)}
              // validationBoolean={checkValidation}
              // validationBooleanSetterFunc={setCheckValidation}
              // showAllErrorsSetterFunc={setDoesSelectedRuleHaveErrors}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.dropdown
                  : styles.dropdown
              }
              isNotMandatory={true}
              disabled={isLocaleChecked}
            >
              {toolsList?.map((element) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    key={element}
                    value={element}
                  >
                    {element}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </div>

          <div>
            <p className={styles.labelTittle}>
              {t("inputFormat")}{" "}
              <span style={{ color: "rgb(181,42,42)" }}>*</span>
            </p>
            <CustomizedDropdown
              id="pmweb_TemplateModal_InputDropdown"
              value={selectedInputFormat}
              onChange={(event) => handleInputFormatChange(event)}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.dropdown
                  : styles.dropdown
              }
              isNotMandatory={true}
              disabled={isLocaleChecked}
            >
              {selectedInputFormatList?.map((element) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    key={element}
                    value={element}
                  >
                    {element}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </div>
        </div>

        <div className="" style={{ marginTop: "3%" }}>
          <div>
            <p className={styles.labelTittle}>
              {isLocaleChecked && props.calledPlace !== "createNew"
                ? t("Multilingual") + " " + t("fileName")
                : t("fileName")}
              <span style={{ color: "rgb(181,42,42)" }}>*</span>
            </p>
          </div>

          <div className="row">
            <div
              style={{
                width: "65%",
                height: "var(--line_height)",
                marginBottom: "10px",
                border: "1px solid #CECECE",
                borderRadius: "2px",
                paddingLeft: "0",
                marginLeft: direction === RTL_DIRECTION ? "5px" : "0px",
                marginRight: direction === RTL_DIRECTION ? "0px" : "5px",
                background: "#F8F8F8 0% 0% no-repeat padding-box",
              }}
            >
              <input
                id="pmweb_TemplateModal_SelectedTemplateName"
                onChange={(e) => setselectedTemplateName(e.target.value)}
                aria-label="Upload file"
                style={{
                  textAlign: direction === RTL_DIRECTION ? "right" : "left",
                  opacity: "1",
                  fontSize: "0.8rem",
                  fontWeight: "400",
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                value={selectedTemplateName}
                ref={sectionNameRef}
                disabled={enableToSelectFile ? false : true}
                // disabled={props.calledPlace == "editPencil" ? true : false}
                onKeyPress={(e) =>
                  FieldValidations(e, 163, sectionNameRef.current, 100)
                }
                placeholder={t("noFileChosen")}
              />
              {/*code updated on 13 Dec 2022 for BugId 119883*/}
            </div>
            <form>
              <label
                style={{
                  fontSize: "var(--base_text_font_size)",
                  border: "1px solid var(--button_color)",
                  height: "var(--line_height)",
                  whiteSpace: "nowrap",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "var(--button_color)",
                  fontWeight: "500",
                  cursor: "pointer",
                  marginTop: "-10px",
                  padding: "5px",
                }}
              >
                <input
                  id="pmweb_TemplateModal_UploadFileInput"
                  type="file"
                  style={{ display: "none" }}
                  disabled={enableToSelectFile ? false : true}
                  onChange={(e) => uploadFile(e)}
                />
                {t("chooseFile")}
              </label>
            </form>
          </div>
        </div>

        <div className="row">
          <div>
            <p className={styles.labelTittle}>
              {t("DocType")} <span style={{ color: "rgb(181,42,42)" }}>*</span>
            </p>
            <CustomizedDropdown
              id="pmweb_TemplateModal_DocTypeDropdown"
              value={selectedDoctype}
              onChange={(event) => documentSelectHandler(event)}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.dropdown
                  : styles.dropdown
              }
              // MenuProps={menuProps}
              isNotMandatory={true}
              disabled={
                props.calledPlace == "editPencil" || isLocaleChecked
                  ? true
                  : false
              }
            >
              {docList?.map((element) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    key={element}
                    value={element}
                  >
                    {element}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </div>

          <div>
            <p className={styles.labelTittle}>
              {t("outputFormat")}{" "}
              <span style={{ color: "rgb(181,42,42)" }}>*</span>
            </p>
            <CustomizedDropdown
              id="pmweb_TemplateModal_OutputDropdown"
              value={selectedOutput}
              onChange={(event) => {
                setselectedOutput(event.target.value);
                setLocaleDisability("TemplateOutputFormat", event.target.value);
              }}
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.dropdown
                  : styles.dropdown
              }
              isNotMandatory={true}
              disabled={isLocaleChecked}
            >
              {selectedOutputFormatList?.map((element) => {
                return (
                  <MenuItem
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.menuItemStyles
                        : styles.menuItemStyles
                    }
                    key={element}
                    value={element}
                  >
                    {element}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </div>
        </div>

        <div>
          <p className={styles.labelTittle}>
            {t("dateFormat")} <span style={{ color: "rgb(181,42,42)" }}>*</span>
          </p>
          <CustomizedDropdown
            id="pmweb_TemplateModal_ToolsDropdown"
            value={selectedDateFormat}
            onChange={(event) => {
              setselectedDateFormat(event.target.value);
              setLocaleDisability("TemplateDateFormat", event.target.value);
            }}
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.dropdown
                : styles.dropdown
            }
            // MenuProps={menuProps}
            isNotMandatory={true}
            disabled={isLocaleChecked}
          >
            {dateList?.map((element) => {
              return (
                <MenuItem
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.menuItemStyles
                      : styles.menuItemStyles
                  }
                  key={element}
                  value={element}
                >
                  {element}
                </MenuItem>
              );
            })}
          </CustomizedDropdown>
        </div>
        <Grid
          className={styles.divMargins}
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <FormGroup style={{ width: "45%" }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isLocaleChecked}
                  disabled={
                    props.calledPlace === "createNew" || disableLocaleCheckBox
                  }
                  onChange={() => setIsLocaleChecked(!isLocaleChecked)}
                />
              }
              label={t("Locale")}
            />
          </FormGroup>
          <CustomizedDropdown
            id="pmweb_TemplateModal_Locale"
            value={selectedLocale.type}
            inputId="LocaleDropdown"
            onChange={handleLocale}
            disabled={props.calledPlace === "createNew" || !isLocaleChecked}
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.dropdown
                : styles.dropdown
            }
            hideDefaultSelect={true}
            isNotMandatory={true}
            ariaLabel="Locale"
          >
            {localeList?.map((element) => {
              return (
                <MenuItem
                  className={
                    direction === RTL_DIRECTION
                      ? arabicStyles.menuItemStyles
                      : styles.menuItemStyles
                  }
                  key={element?.value}
                  value={element?.type}
                >
                  {element?.type}
                </MenuItem>
              );
            })}
          </CustomizedDropdown>
        </Grid>
        <div>
          <p className={styles.labelTittle}>
            {t("arguments")} <span style={{ color: "rgb(181,42,42)" }}>*</span>
          </p>

          <MultiSelect
            id="pmweb_TemplateModal_VariableName"
            inputId="pmweb_TemplateModal_VariableName_input"
            ariaLabel={"Arguments"}
            completeList={argumentList}
            labelKey="VariableName"
            // indexKey="VariableId"
            indexKey="VariableName"
            associatedList={selectedVariableList}
            handleAssociatedList={(val) => {
              setselectedVariableList(val);
            }}
            // disabled={props.calledPlace == "editPencil" ? true : false}
            showSelectedCount={true}
            // noDataLabel={t("noWorksteps")}
            // disabled={readOnlyProcess}
            // id="trigger_ccwi_workstepMultiSelect"

            disabled={isLocaleChecked}
          />
        </div>
        <div>
          <textarea
            style={{
              width: "100%",
              height: "7rem",
              marginTop: "5px",
              border: "1px solid #c4c4c4",
            }}
            //disabled={props.calledPlace == "editPencil" ? true : false}
            id="pmweb_TemplateModal_ArgumentStatement"
            value={argumentStatement}
            ref={argumentRef}
            onKeyPress={(e) =>
              FieldValidations(e, 142, argumentRef.current, 10)
            }
            aria-label="Argument Statement"
            disabled={isLocaleChecked}
          />
        </div>
      </div>
      <Divider className={styles.modalDivider} />
      <div className={styles.footer}>
        <button
          tabIndex={0}
          id="pmweb_TemplateModal_CancelBtn"
          className="cancel"
          onClick={() => props.setIsModalOpen(false)}
        >
          {t("cancel")}
        </button>
        {!isLocaleChecked ? (
          <button
            tabIndex={0}
            id="pmweb_TemplateModal_RegisterBtn"
            className="create"
            style={{ marginRight: "10px" }}
            onClick={registerHandler}
          >
            {props.calledPlace === "createNew" ? t("register") : t("modify")}
          </button>
        ) : (
          <button
            tabIndex={0}
            id="pmweb_TemplateModal_RegisterBtn"
            className="create"
            style={{ marginRight: "10px" }}
            onClick={registerMultilingual}
          >
            {t("Multilingual")}
          </button>
        )}
      </div>
    </div>
  );
}

export default TemplateModal;
