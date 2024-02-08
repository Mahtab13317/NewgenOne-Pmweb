import { Checkbox } from "@material-ui/core";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { store, useGlobalState } from "state-pool";

function soapParams(props) {
  let { t } = useTranslation();
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const [Params, setParams] = useState([
    {
      bParamSelected: false,
      dataStructId: "2",
      mapField: "DBExErrDesc1",
      mapFieldType: "M",
      mapVarFieldId: "0",
      mapVariableId: "10026",
      paramIndex: "1",
      selectedVar: "DBExErrDesc",
    },
    {
      bParamSelected: false,
      dataStructId: "2",
      mapField: "DBExErrDesc2",
      mapFieldType: "M",
      mapVarFieldId: "0",
      mapVariableId: "10026",
      paramIndex: "1",
      selectedVar: "DBExErrDesc",
    },
    {
      bParamSelected: false,
      dataStructId: "2",
      mapField: "DBExErrDesc3",
      mapFieldType: "M",
      mapVarFieldId: "0",
      mapVariableId: "10026",
      paramIndex: "1",
      selectedVar: "DBExErrDesc",
    },
  ]);

  const handleCheckChange = (para, checkValue) => {
    let temp = Params;
    temp.map((t) => {
      if (t.mapField == para.mapField) {
        t.bParamSelected = !checkValue;
      }
    });
    setParams(temp);
  };

  const addParamsToList = () => {
    let tempInfo = localLoadedActivityPropertyData;
    let temp =
      tempInfo?.ActivityProperty?.webserviceInfo?.objWebServiceDataInfo;

    let selectedParams = [];
    Params.map((para) => {
      if (para.bParamSelected) {
        selectedParams.push(para);
      }
    });

    temp.map((t) => {
      if (t.webserviceName == props.serviceNameClicked) {
        t.fwdParamMapList.push(...selectedParams);
      }
    });

    setlocalLoadedActivityPropertyData(tempInfo);
    props.setShowSOAPParamsModal(false);
  };

  return (
    <div>
      {Params.map((para) => {
        return (
          <div style={{ display: "flex" }}>
            <Checkbox
              checked={para.bParamSelected}
              onChange={(e) => handleCheckChange(para, para.bParamSelected)}
            />
            <p>{para.mapField}</p>
          </div>
        );
      })}
      <button onClick={() => addParamsToList()}>{t("addParam")}</button>
    </div>
  );
}

export default soapParams;
