import React, { useState, useEffect } from "react";
import Checkbox from "@material-ui/core/Checkbox";

import { useTranslation } from "react-i18next";

import MenuItem from "@material-ui/core/MenuItem";
import { store, useGlobalState } from "state-pool";
import axios from "axios";
import {
  BASE_URL,
  propertiesLabel,
  RTL_DIRECTION,
} from "../../../../Constants/appConstants";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { useDispatch } from "react-redux";
import { isActivityModifyDisabled } from "../../../../utility/ActivityModifyDisabled/isActivityModifyDisabled";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";

function FormsAndValidations(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const localActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(localActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setLocalLoadedProcessData] =
    useGlobalState(loadedProcessData);

  const [formList, setformList] = React.useState([]);

  useEffect(() => {
    getAllFormList();
  }, []);

  const getAllFormList = async () => {
    try {
      const res = await axios.get(
        BASE_URL +
          `/process/${
            localLoadedProcessData.ProcessType === "R" ? "registered" : "local"
          }/getFormlist/${localLoadedProcessData?.ProcessDefId}`
      );
      setformList([
        { formId: -1, formName: "HTML", deviceType: "H" },
        ...res.data,
      ]);
    } catch (err) {
      dispatch(
        setToastDataFunc({
          message: err?.response?.data?.errorMsg,
          severity: "error",
          open: true,
        })
      );
    }
  };
  const enableSaveBtn = () => {
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.basicDetails]: {
          isModified: true,
          hasError: false,
        },
      })
    );
  };
  const handleCheckSwitch = (e) => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    temp.ActivityProperty.actGenPropInfo.m_bFormView = e.target.checked;
    if (!e.target.checked) {
      temp.ActivityProperty.actGenPropInfo.selFormId = "";
    }
    setlocalLoadedActivityPropertyData(temp);
    enableSaveBtn();
  };

  const handleFormChange = (e) => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    temp.ActivityProperty.actGenPropInfo.selFormId = e.target.value;
    if (temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap) {
      Object.keys(
        temp?.ActivityProperty?.wdeskInfo?.objPMWdeskTasks?.taskMap
      )?.forEach((el) => {
        let tempTask =
          temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[el];
        if (tempTask?.objFormInfo) {
          temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[
            el
          ].objFormInfo = {
            ...tempTask.objFormInfo,
            formId: e.target.value,
            isReadOnlyForTask: true,
            isModifiedForTask: true,
          };
        } else {
          temp.ActivityProperty.wdeskInfo.objPMWdeskTasks.taskMap[el] = {
            ...tempTask,
            objFormInfo: {
              formId: e.target.value,
              isReadOnlyForTask: true,
              isModifiedForTask: true,
            },
          };
        }
      });
    }
    setlocalLoadedActivityPropertyData(temp);
    enableSaveBtn();
  };

  const changeBulkChecked = (e) => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    temp.ActivityProperty.actGenPropInfo.m_bBulkFormView = e.target.checked;
    if (!e.target.checked) {
      temp.ActivityProperty.actGenPropInfo.selBulkFormId = "";
    } else {
      temp.ActivityProperty.actGenPropInfo.selBulkFormId = "-1";
    }
    setlocalLoadedActivityPropertyData(temp);
    enableSaveBtn();
  };
  const changeBulkFormId = (e) => {
    let temp = global.structuredClone(localLoadedActivityPropertyData);
    temp.ActivityProperty.actGenPropInfo.selBulkFormId = e.target.value;
    setlocalLoadedActivityPropertyData(temp);
    enableSaveBtn();
  };

  return (
    <>
      <p
        style={{
          // Added on : 22-05-2023 for bugID: 127494
          // color: "#727272",
          // fontWeight: "bolder",
          fontSize: "var(--base_text_font_size)",
          fontWeight: "600",
        }}
      >
        {t("formsAndValidations")}
      </p>
      <div
        style={{
          flexDirection: "row",
          marginLeft: "-0.6875rem",
          marginBottom: "0.3rem",
          alignItems: "center",
        }}
        className="flexScreen"
      >
        <Checkbox
          name="formEnabled"
          checked={
            localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo
              ?.m_bFormView
          }
          onChange={handleCheckSwitch}
          disabled={props.disabled}
          size="small"
          id="pmweb_FormandVal_formEnabled"
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              handleCheckSwitch({
                ...e,
                target: {
                  ...e.target,
                  checked:
                    !localLoadedActivityPropertyData?.ActivityProperty
                      ?.actGenPropInfo?.m_bFormView,
                },
              });
            }
          }}
        />
        <label
          style={{
            fontWeight: "600",
            fontSize: "var(--base_text_font_size)",
          }}
          htmlFor="pmweb_FormandVal_formEnabled"
        >
          {t("formEnabled")}
        </label>
      </div>

      <div style={{ marginBlock: "0.3rem" }}>
        <p
          style={{
            fontSize: "var(--base_text_font_size)",
            fontWeight: "600",
          }}
        >
          {t("formName")}
        </p>

        <CustomizedDropdown
          isNotMandatory={true}
          id="pmweb_FormandVal_formName"
          disabled={
            props.disabled ||
            !localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo
              ?.m_bFormView
          }
          style={{ width: props.customStyle, height: "2rem" }}
          variant="outlined"
          onChange={handleFormChange}
          value={
            localLoadedActivityPropertyData?.ActivityProperty?.actGenPropInfo
              ?.selFormId
          }
          ariaLabel={t("formName")}
        >
          {formList.map((form) => (
            <MenuItem
              style={{
                width: "100%",
                marginBlock: "0.2rem",
                justifyContent: direction === RTL_DIRECTION ? "end" : null,
              }}
              key={form.formId}
              value={form.formId}
            >
              <p
                style={{
                  // font: "0.8rem Open Sans",
                  fontSize: "var(--base_text_font_size)",
                }}
              >
                {form.formName}
              </p>
            </MenuItem>
          ))}
        </CustomizedDropdown>
      </div>
      <>
        <div>
          <div
            style={{
              flexDirection: "row",
              marginLeft: "-0.6875rem",
              marginBottom: "0.3rem",
              alignItems: "center",
            }}
            className="flexScreen"
          >
            <Checkbox
              name="bulkEnabled"
              id="pmweb_FormandVal_bulkEnabled"
              checked={
                !!localLoadedActivityPropertyData?.ActivityProperty
                  ?.actGenPropInfo?.m_bBulkFormView
              }
              onChange={changeBulkChecked}
              disabled={
                isActivityModifyDisabled(
                  props.cellActivityType,
                  props.cellActivitySubType
                ) ||
                props.disabled ||
                !localLoadedActivityPropertyData?.ActivityProperty
                  ?.actGenPropInfo?.m_bFormView
              }
              size="small"
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  changeBulkChecked({
                    ...e,
                    target: {
                      ...e.target,
                      checked:
                        !localLoadedActivityPropertyData?.ActivityProperty
                          ?.actGenPropInfo?.m_bBulkFormView,
                    },
                  });
                }
              }}
            />
            <label
              style={{
                fontWeight: "600",
                fontSize: "var(--base_text_font_size)",
              }}
              htmlFor="pmweb_FormandVal_bulkEnabled"
            >
              {t("bulkEnabled")}
            </label>
          </div>

          <div style={{ marginBlock: "0.3rem" }}>
            <p
              style={{
                // color: "black",

                // fontWeight: "500",
                fontSize: "var(--base_text_font_size)",
                fontWeight: "600",
              }}
            >
              {t("bulkFormName")}
            </p>
            {/* <Select
              IconComponent={ExpandMoreIcon}
              style={{ width: props.customStyle, height: "2rem" }}
              variant="outlined"
              //autoWidth
              onChange={changeBulkFormId}
              disabled={
                isActivityModifyDisabled(
                  props.cellActivityType,
                  props.cellActivitySubType
                ) ||
                props.disabled ||
                !localLoadedActivityPropertyData?.ActivityProperty
                  ?.actGenPropInfo?.m_bFormView ||
                !localLoadedActivityPropertyData?.ActivityProperty
                  ?.actGenPropInfo?.m_bBulkFormView
              }
              value={
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.actGenPropInfo?.m_bBulkFormView
                  ? localLoadedActivityPropertyData.ActivityProperty
                      ?.actGenPropInfo?.selBulkFormId || ""
                  : ""
              }
            >
              {formList
                .filter((form) => form.formId !== -1)
                .map((form) => (
                  <MenuItem
                    style={{
                      width: "100%",
                      marginBlock: "0.2rem",
                      height: "2rem",
                      fontSize: "var(--base_text_font_size)",
                    }}
                    value={form.formId}
                  >
                    <p
                      style={{
                        // font: "0.8rem Open Sans",
                        fontSize: "var(--base_text_font_size)",
                      }}
                    >
                      {form.formName}
                    </p>
                  </MenuItem>
                ))}
            </Select> */}
            <CustomizedDropdown
              isNotMandatory={true}
              style={{ width: props.customStyle, height: "2rem" }}
              variant="outlined"
              id="pmweb_FormandVal_bulkFormNAme"
              //autoWidth
              onChange={changeBulkFormId}
              disabled={
                isActivityModifyDisabled(
                  props.cellActivityType,
                  props.cellActivitySubType
                ) ||
                props.disabled ||
                !localLoadedActivityPropertyData?.ActivityProperty
                  ?.actGenPropInfo?.m_bFormView ||
                !localLoadedActivityPropertyData?.ActivityProperty
                  ?.actGenPropInfo?.m_bBulkFormView
              }
              value={
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.actGenPropInfo?.m_bBulkFormView
                  ? localLoadedActivityPropertyData.ActivityProperty
                      ?.actGenPropInfo?.selBulkFormId || ""
                  : ""
              }
              ariaLabel={t("bulkFormName")}
            >
              {formList
                .filter((form) => form.formId !== -1)
                .map((form) => (
                  <MenuItem
                    style={{
                      width: "100%",
                      marginBlock: "0.2rem",
                      height: "2rem",
                      fontSize: "var(--base_text_font_size)",
                      justifyContent:
                        direction === RTL_DIRECTION ? "end" : null,
                    }}
                    value={form.formId}
                    key={form.formId}
                  >
                    <p
                      style={{
                        // font: "0.8rem Open Sans",
                        fontSize: "var(--base_text_font_size)",
                      }}
                    >
                      {form.formName}
                    </p>
                  </MenuItem>
                ))}
            </CustomizedDropdown>
          </div>
        </div>
      </>

      {/* <>
        {" "}
        {!customValidations ? (
          <p
            style={{
              color: "var(--link_color)",
              cursor: "pointer",
              marginTop: "1rem",
            }}
            onClick={() => setcustomValidations(true)}
          >
            {t("mentionCustomValidations")}
          </p>
        ) : null}
        {customValidations ? (
          <div style={{ marginBlock: "0.7rem" }}>
            <p
              style={{
                color: "#606060",
                marginBottom: "0.3rem",
              }}
            >
              {t("customValidations")}
            </p>
            <SunEditor
              width="100%"
              customHeight="6rem"
              placeholder={t("placeholderCustomValidation")}
              value={
                localLoadedActivityPropertyData.ActivityProperty.actGenPropInfo
                  .genPropInfo.customValidation
              }
              getValue={(e) =>
                props.changeBasicDetails(e, "validationBasicDetails")
              }
            />
          </div>
        ) : null}
      </> */}
    </>
  );
}

export default FormsAndValidations;
