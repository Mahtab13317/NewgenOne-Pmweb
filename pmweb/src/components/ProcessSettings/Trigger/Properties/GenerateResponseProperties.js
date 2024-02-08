import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "./properties.module.css";
import { connect } from "react-redux";
import * as actionCreators from "../../../../redux-store/actions/Trigger";
import SelectWithInput from "../../../../UI/SelectWithInput";
import { PROCESSTYPE_REGISTERED } from "../../../../Constants/appConstants";
import { store, useGlobalState } from "state-pool";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";

function GenerateResponseProperties(props) {
  let { t } = useTranslation();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [file, setFile] = useState("");
  const [document, setDocument] = useState("");
  const [existingTrigger, setExistingTrigger] = useState(false);
  let readOnlyProcess =
    props.isReadOnly ||
    props.openProcessType === PROCESSTYPE_REGISTERED ||
    props.openProcessType === "RC" ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for Bugid 136103;

  useEffect(() => {
    props.setTriggerProperties({});
  }, []);

  useEffect(() => {
    if (props.reload) {
      props.setTriggerProperties({});
      setFile("");
      setDocument("");
      // code added on 16 Dec 2022 for BugId 120240
      setExistingTrigger(false);
      props.setReload(false);
    }
  }, [props.reload]);

  useEffect(() => {
    if (props.initialValues) {
      props.templateList?.forEach((template) => {
        if (template.DocName === props.generateResponse.fileName) {
          setFile(template);
        }
      });
      localLoadedProcessData?.DocumentTypeList?.forEach((doc) => {
        if (doc.DocName === props.generateResponse.docTypeName) {
          setDocument(doc);
        }
      });
      setExistingTrigger(true);
      props.setInitialValues(false);
    }
  }, [props.initialValues]);

  useEffect(() => {
    let fileId = file?.TemplateId;
    let fileName = file?.DocName;
    let docTypeName = document?.DocName;
    let docTypeId = document?.DocTypeId;
    props.setTriggerProperties({
      fileId,
      fileName,
      docTypeName,
      docTypeId,
    });
  }, [file, document]);

  return (
    <React.Fragment>
      <div className={styles.propertiesColumnView}>
        <div className="flex">
          <label
            className={styles.triggerFormLabel}
            //modified on 26-9-2023 for bug_id: 136424
            // htmlFor="trigger_gr_fileName"
          >
            {t("file")}{" "}
            <span className="relative">
              {t("name")}
              <span className={styles.starIcon}>*</span>
            </span>
          </label>
          <div style={{ width: "21vw" }}>
            <SelectWithInput
              dropdownOptions={props.templateList}
              optionKey="DocName"
              value={file}
              setValue={(val) => {
                setFile(val);
                if (existingTrigger) {
                  props.setTriggerEdited(true);
                }
              }}
              disabled={readOnlyProcess}
              showEmptyString={false}
              showConstValue={false}
              id="trigger_gr_fileName"
              ariaLabel={`${t("file")} ${t("name")}`}
            />
          </div>
        </div>
        <div className="flex">
          <label
            className={styles.triggerFormLabel}
            //modified on 26-9-2023 for bug_id: 136424
            // htmlFor="trigger_gr_docName"
          >
            {t("document")}{" "}
            <span className="relative">
              {t("type")}
              <span className={styles.starIcon}>*</span>
            </span>
          </label>
          <div style={{ width: "21vw" }}>
            <SelectWithInput
              dropdownOptions={localLoadedProcessData.DocumentTypeList}
              optionKey="DocName"
              value={document}
              disabled={readOnlyProcess}
              setValue={(val) => {
                setDocument(val);
                if (existingTrigger) {
                  props.setTriggerEdited(true);
                }
              }}
              showEmptyString={false}
              showConstValue={false}
              id="trigger_gr_docName"
              ariaLabel={`${t("document")} ${t("type")} `}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    templateList: state.triggerReducer.templateList,
    initialValues: state.triggerReducer.setDefaultValues,
    reload: state.triggerReducer.trigger_reload,
    generateResponse: state.triggerReducer.generateResponse,
    openProcessType: state.openProcessClick.selectedType,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setTriggerProperties: ({ fileId, fileName, docTypeName, docTypeId }) =>
      dispatch(
        actionCreators.generate_response_properties({
          fileId,
          fileName,
          docTypeName,
          docTypeId,
        })
      ),
    setReload: (reload) =>
      dispatch(actionCreators.reload_trigger_fields(reload)),
    setInitialValues: (value) =>
      dispatch(actionCreators.set_trigger_fields(value)),
    setTriggerEdited: (value) =>
      dispatch(actionCreators.is_trigger_definition_edited(value)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(GenerateResponseProperties);
