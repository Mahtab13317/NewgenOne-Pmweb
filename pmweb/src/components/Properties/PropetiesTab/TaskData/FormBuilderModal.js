import React, { useState, useContext, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ModalForm from "./../../../../UI/ModalForm/modalForm";

import { getSelectedCellType } from "../../../../utility/abstarctView/getSelectedCellType";
import { getLaunchpadKey } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";

const FormBuilderModal = (props) => {
  const {
    localLoadedProcessData,
    cellID,
    cellType,
    localLoadedActivityPropertyData,
    setlocalLoadedActivityPropertyData,
    isReadOnly,
  } = props;
  const [open, setOpen] = useState(props.isOpen ? true : false);

  const handleClose = () => {
    var elem = document.getElementById("appformBuilder_assetManifest");

    elem.parentNode.removeChild(elem);
    setOpen(false);
    props.handleClose();
  };

  return (
    <ModalForm
      isOpen={open}
      title={"Form Builder"}
      Content={
        <Content
          localLoadedActivityPropertyData={localLoadedActivityPropertyData}
          setlocalLoadedActivityPropertyData={
            setlocalLoadedActivityPropertyData
          }
          cellID={cellID}
          cellType={cellType}
          localLoadedProcessData={localLoadedProcessData}
          isReadOnly={isReadOnly}
        />
      }
      contentNotScrollable={true}
      headerCloseBtn={true}
      onClickHeaderCloseBtn={handleClose}
      closeModal={handleClose}
      containerHeight={"98%"}
      containerWidth={"98%"}
    />
  );
};

export default FormBuilderModal;

const Content = (props) => {
  const launchForm = () => {
    if (props.cellType === getSelectedCellType("TASK")) {
      let newPassedDataTF = {
        taskId: props.cellID,

        component: "app",
        processDefId: props.localLoadedProcessData.ProcessDefId,

        formName: "Taskform Test",

        componentType: "TF",
        token: getLaunchpadKey(),
      };

      window.loadFormBuilderPMWEB(
        "mf_forms_int_des",
        newPassedDataTF,
        getTaskFormId
      );
    } else if (props.cellType === getSelectedCellType("TASKTEMPLATE")) {
      let newPassedDataTF = {
        templateId: props.cellID,

        component: "app",
        //processDefId: props.localLoadedProcessData.ProcessDefId,

        formName: "Taskform Test",

        componentType: "GT",
        token: getLaunchpadKey(),
      };

      window.loadFormBuilderPMWEB("mf_forms_int_des", newPassedDataTF);
    }
  };

  const getTaskFormId = (obj) => {
    if (
      !!obj &&
      !!props.localLoadedActivityPropertyData.taskGenPropInfo.bTaskFormView
    ) {
      let temp = global.structuredClone(props.localLoadedActivityPropertyData);
      temp.taskGenPropInfo.taskFormId = obj.processDefId;
      props.setlocalLoadedActivityPropertyData(temp);
    }
  };

  useEffect(() => {
    launchForm();
  }, []);
  return <div id="mf_forms_int_des"></div>;
};
