import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SearchComponent from "../../../../UI/Search Component/index.js";

import axios from "axios";
import { connect } from "react-redux";
import { SERVER_URL, VARDOC_LIST } from "../../../../Constants/appConstants.js";
import { Checkbox, Button } from "@material-ui/core";
import { store, useGlobalState } from "state-pool";

function VarAndDocList(props) {
  let { t } = useTranslation();
  let [queueVariablesList, setQueueVariablesList] = useState([]);
  let [searchTerm, setSearchTerm] = useState("");
  let [externalVariablesList, setExternalVariablesList] = useState([]);
  const [varDefinition, setVarDefinition] = useState([]);
  const [selectedVariables, setSelectedVariables] = useState([]);
  const [selectedVariableType, setSelectedVariableType] = useState(0);
  const [registeredProcessID, setRegisteredProcessID] = useState(null);
  useEffect(() => {
    setSelectedVariables(props.selectedVariableList);
  }, [props.selectedVariableList]);

  const handleCheckChange = (selectedVariable) => {
    let temp = [...varDefinition];
    temp &&
      temp?.forEach((v) => {
        if (v.VarName === selectedVariable.VarName) {
          v.isChecked = !v.isChecked;
        }
      });
    setVarDefinition(temp);
    if (selectedVariable.isChecked) {
      setSelectedVariables((prev) => {
        return [...prev, selectedVariable];
      });
    }
  };

  const addVariablesToList = () => {
    props.selectedVariables(selectedVariables);
    let tempArr = [];
    selectedVariables.map((v) => {
      tempArr.push(v.VarName);
    });
    let newJson =
      selectedVariableType == 0
        ? queueVariablesList.filter((d) => !tempArr.includes(d.VarName))
        : externalVariablesList.filter((d) => !tempArr.includes(d.VarName));
    selectedVariableType == 0
      ? setQueueVariablesList(newJson)
      : setExternalVariablesList(newJson);
  };

  useEffect(() => {
    let jsonBody = {
      processDefId: registeredProcessID,
      extTableDataFlag: "Y",
      docReq: "Y",
      omniService: "Y",
    };
    axios.post(SERVER_URL + VARDOC_LIST, jsonBody).then((res) => {
      if (res.data.Status === 0) {
        let tempQueueVars = [];
        let tempExternalVars = [];
        res.data.VarDefinition.forEach((variable) => {
          tempQueueVars.push(variable);
        });
        res.data.DocDefinition.forEach((val) => {
          tempExternalVars.push(val);
        });
        setQueueVariablesList(tempQueueVars);
        filterData(tempQueueVars, tempExternalVars);
        setExternalVariablesList(tempExternalVars);
      }
    });
  }, []);

  useEffect(() => {
    filterData(queueVariablesList, externalVariablesList);
  }, [props.selectedVariableList]);

  const filterData = (queueList, extList) => {
    let newQueueList = [];
    let newExtList = [];
    queueList.forEach((list) => {
      let tempVariable = false;
      props.selectedVariableList &&
        props.selectedVariableList.forEach((variable) => {
          if (variable.VarName == list.VarName) {
            tempVariable = true;
          }
        });
      if (!tempVariable) {
        newQueueList.push(list);
      }
    });
    setQueueVariablesList(newQueueList);

    newExtList.forEach((list) => {
      let tempVariable = false;
      props.selectedVariableList &&
        props.selectedVariableList.forEach((variable) => {
          if (variable.VarName == list.VarName) {
            tempVariable = true;
          }
        });
      if (!tempVariable) {
        newExtList.push(list);
      }
    });
    setExternalVariablesList(newExtList);
  };

  useEffect(() => {
    setVarDefinition(
      selectedVariableType == 0
        ? queueVariablesList &&
            queueVariablesList.map((x) => {
              return { ...x, isChecked: false };
            })
        : externalVariablesList &&
            externalVariablesList.map((x) => {
              return { ...x, isChecked: false };
            })
    );
  }, [queueVariablesList, externalVariablesList, selectedVariableType]);

  //   let filteredRows = varDefinition.filter((row) => {
  //     if (searchTerm == "") {
  //       return row;
  //     } else if (row.VarName.toLowerCase().includes(searchTerm.toLowerCase())) {
  //       return row;
  //     }
  //   });

  let filteredRows =
    selectedVariableType == "0"
      ? queueVariablesList.filter((row) => {
          if (searchTerm == "") {
            return row;
          } else if (
            row.VarName.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            return row;
          }
        })
      : externalVariablesList.filter((row) => {
          if (searchTerm == "") {
            return row;
          } else if (
            row.DocName.toLowerCase().includes(searchTerm.toLowerCase())
          ) {
            return row;
          }
        });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: props.isDrawerExpanded ? "100%" : "auto",
        backgroundColor: props.isDrawerExpanded ? "white" : "",
      }}
    >
      <SearchComponent
        style={{ width: "auto", height: "20px", margin: "10px 10px 5px 10px" }}
        setSearchTerm={setSearchTerm}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #D6D6D6",
          padding: "10px 10px 0px 10px",
        }}
      >
        <p
          onClick={() => setSelectedVariableType(0)}
          style={{
            fontSize: "12px",
            paddingBottom: "5px",
            borderBottom: selectedVariableType == 0 ? "3px solid blue" : null,
          }}
        >
          {t("varMapping")}
        </p>
        <p
          onClick={() => setSelectedVariableType(1)}
          style={{
            fontSize: "12px",
            marginLeft: "25px",
            paddingBottom: "5px",
            borderBottom: selectedVariableType == 1 ? "3px solid blue" : null,
          }}
        >
          {t("DocMapping")}
        </p>
      </div>
      {/* -------------------------- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #D6D6D6",
          padding: "10px",
        }}
      >
        <Checkbox
          style={{
            borderRadius: "1px",
            height: "11px",
            width: "11px",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <p style={{ fontSize: "11px", color: "black", marginLeft: "15px" }}>
            {t("selectAll")}
          </p>
        </div>
      </div>
      {/* ------------------------- */}
      <div
        style={{
          overflowY: "scroll",
          height: "57.5vh",
          scrollbarColor: "#dadada #fafafa",
          scrollbarWidth: "thin",
        }}
      >
        {varDefinition && searchTerm == ""
          ? varDefinition.map((variable) => {
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #D6D6D6",
                    padding: "5px 10px 5px 10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox
                      onChange={() => handleCheckChange(variable)}
                      checked={variable.isChecked}
                      style={{
                        borderRadius: "1px",
                        height: "11px",
                        width: "11px",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        marginLeft: "15px",
                      }}
                    >
                      <p style={{ fontSize: "11px", color: "black" }}>
                        {variable.VarName ||
                          variable.DocName ||
                          variable.importedFieldName}
                      </p>
                      <span style={{ fontSize: "10px", color: "#B2B1B9" }}>
                        {variable.SysName}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: "10px", color: "black" }}>STRING</p>
                </div>
              );
            })
          : filteredRows.map((variable) => {
              return (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #D6D6D6",
                    padding: "5px 10px 5px 10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Checkbox
                      onChange={() => handleCheckChange(variable)}
                      checked={variable.isChecked}
                      style={{
                        borderRadius: "1px",
                        height: "11px",
                        width: "11px",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        marginLeft: "15px",
                      }}
                    >
                      <p style={{ fontSize: "11px", color: "black" }}>
                        {variable.VarName ||
                          variable.DocName ||
                          variable.importedFieldName}
                      </p>
                      <span style={{ fontSize: "10px", color: "#B2B1B9" }}>
                        {variable.SysName}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: "10px", color: "black" }}>STRING</p>
                </div>
              );
            })}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "right",
          padding: "5px 10px 5px 10px",
          justifyContent: "end",
          backgroundColor: "#F8F8F8",
        }}
      >
        <Button
          variant="outlined"
          onClick={() => props.setShowVariablesModal(false)}
          id="close_AddVariableModal_CallActivity"
        >
          {t("cancel")}
        </Button>
        <Button
          id="add_AddVariableModal_CallActivity"
          onClick={() => addVariablesToList()}
          variant="contained"
          color="primary"
        >
          {t("add")}
        </Button>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};

export default connect(mapStateToProps, null)(VarAndDocList);
