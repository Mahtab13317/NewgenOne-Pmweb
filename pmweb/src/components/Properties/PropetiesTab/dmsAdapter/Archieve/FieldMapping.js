// Made changes to solve bug ID - 111180, 112972 , 111162 and 111182
import React, { useState, useEffect } from "react";
import { MenuItem, Grid } from "@material-ui/core";
import { store, useGlobalState } from "state-pool";
import Button from "@material-ui/core/Button";
import "../Archieve/index.css";
import { connect, useDispatch } from "react-redux";
import {
  RTL_DIRECTION,
  propertiesLabel,
} from "../../../../../Constants/appConstants";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { useTranslation } from "react-i18next";
import { setActivityPropertyChange } from "../../../../../redux-store/slices/ActivityPropertyChangeSlice";

function FieldMapping(props) {
  const dispatch = useDispatch();
  const [loadedVariables] = useGlobalState("variableDefinition");
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [assDataClassMappingList, setAssDataClassMappingList] = useState([]);
  const [data, setData] = useState({});

  useEffect(() => {
    if (
      props.assDataClassMappingList &&
      props.assDataClassMappingList.length > 0
    ) {
      let tempData = {};
      if (props.mapType == "archeive") {
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.docTypeInfo?.docTypeDCMapList?.map(
          (el) => {
            if (el.docTypeId === props.selectedDoc.DocTypeId) {
              el.m_arrFieldMappingInfo?.map((list) => {
                let test = props.assDataClassMappingList.filter(
                  (d) => d.IndexName == list.assoFieldMapList[0].fieldName
                );
                if (test.length >= 1) {
                  tempData[list.assoFieldMapList[0].fieldName] =
                    list.assoFieldMapList[0].assocVarName;
                }
              });
            }
          }
        );
      } else {
        localLoadedActivityPropertyData?.ActivityProperty?.archiveInfo?.folderInfo?.fieldMappingInfoList?.map(
          (list) => {
            let test = props.assDataClassMappingList.filter(
              (d) => d.IndexName == list.assoFieldMapList[0].fieldName
            );
            if (test.length >= 1) {
              tempData[list.assoFieldMapList[0].fieldName] =
                list.assoFieldMapList[0].assocVarName;
            }
          }
        );
      }
      setData(tempData);
      setAssDataClassMappingList(props.assDataClassMappingList);
    }
  }, [props.assDataClassMappingList]);

  const handleDataClassVarSelection = (event, valueName) => {
    setData((prev) => {
      let newObj = { ...prev };
      newObj[valueName] = event.target.value;
      return newObj;
    });
  };

  const handleMappingSave = () => {
    let assoFieldMapListTemp = [];
    let tempAssociatedDataClass;
    Object.keys(data)?.forEach((d) => {
      let assTempData = assDataClassMappingList.filter(
        (assoData) => assoData.IndexName == d
      );

      loadedVariables.map((list) => {
        if (list.VariableName == data[d]) {
          assoFieldMapListTemp.push({
            assoFieldMapList: [
              {
                fieldName: d,
                dataFieldId: assTempData[0].IndexId,
                // m_strDataFieldType: assTempData[0].IndexType,
                dataFieldType: list.VariableType,
                assocVarName: list.VariableName,
                assocVarId: list.VariableId,
                assocVarFieldId: list.VarFieldId,
                assocExtObjId: list.ExtObjectId,
              },
            ],
          });
        }
      });
    });
    let temp = { ...localLoadedActivityPropertyData };
    if (props.mapType == "archeive") {
      let assoFieldIdTemp =
        props.docCheckList[props.selectedDoc.DocTypeId].selectedVal;
      props.associateDataClassList.map((clas) => {
        if (clas.dataDefIndex == assoFieldIdTemp) {
          tempAssociatedDataClass = clas.dataDefName;
        }
      });
      let docList =
        temp?.ActivityProperty?.archiveInfo?.docTypeInfo?.docTypeDCMapList;
      if (docList?.length > 0) {
        let isDocFound = false;
        docList.map((el, index) => {
          if (el.docTypeId == props.selectedDoc.DocTypeId) {
            isDocFound = true;
            temp.ActivityProperty.archiveInfo.docTypeInfo.docTypeDCMapList[
              index
            ].m_arrFieldMappingInfo = assoFieldMapListTemp;
            temp.ActivityProperty.archiveInfo.docTypeInfo.docTypeDCMapList[
              index
            ].assocDCId = assoFieldIdTemp;
            temp.ActivityProperty.archiveInfo.docTypeInfo.docTypeDCMapList[
              index
            ].assocDCName = tempAssociatedDataClass;
          }
        });
        if (!isDocFound) {
          temp.ActivityProperty.archiveInfo.docTypeInfo.docTypeDCMapList = [
            ...temp.ActivityProperty.archiveInfo.docTypeInfo.docTypeDCMapList,
            {
              m_arrFieldMappingInfo: assoFieldMapListTemp,
              docTypeId: props.selectedDoc.DocTypeId,
              assocDCId: assoFieldIdTemp,
              assocDCName: tempAssociatedDataClass,
              docTypeName: props.selectedDoc.DocName,
            },
          ];
        }
      } else {
        temp.ActivityProperty.archiveInfo.docTypeInfo.docTypeDCMapList = [
          {
            m_arrFieldMappingInfo: assoFieldMapListTemp,
            docTypeId: props.selectedDoc.DocTypeId,
            assocDCId: assoFieldIdTemp,
            assocDCName: tempAssociatedDataClass,
            docTypeName: props.selectedDoc.DocName,
          },
        ];
      }
    } else {
      temp.ActivityProperty.archiveInfo.folderInfo.fieldMappingInfoList =
        assoFieldMapListTemp;
    }
    props.setShowAssDataClassMapping(false);
    setlocalLoadedActivityPropertyData(temp);
    // added on 30/10/23 for BugId 140294
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.archive]: { isModified: true, hasError: false },
      })
    );
    // till here BugId 140294
  };

  const handleOkClose = (e) => {
    if (e.key === "Enter") {
      handleMappingSave();
      e.stopPropagation();
    }
    if (e.keyCode === 27) {
      props.setShowAssDataClassMapping(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener("keydown", handleOkClose);
    return () => document.removeEventListener("keydown", handleOkClose);
  }, [handleOkClose]);

  return (
    <div>
      <div style={{ height: "100%", maxHeight: "20rem", overflow: "auto" }}>
        <table style={{ width: "100%" }}>
          <tr>
            <Grid container xs={12} justifyContent="space-between">
              <Grid item xs={4}>
                <th style={{ display: "flex", alignItems: "center" }}>
                  {t("associatedFields")}
                </th>
              </Grid>
              <Grid item xs={8}>
                <th>{t("processVars")}</th>
              </Grid>
            </Grid>
          </tr>
          {assDataClassMappingList &&
            assDataClassMappingList.map((value, index) => {
              return (
                <tr>
                  <Grid container xs={12} justifyContent="space-between">
                    <Grid item xs={4}>
                      <td>{value.IndexName}</td>
                    </Grid>
                    {/* <Select
                  style={{
                    border: "1px solid #B2B2B2",
                    width: "140px",
                    marginLeft: "35px",
                  }}
                  // className={
                  //   props.isDrawerExpanded
                  //     ? "dropDownSelect_expandeddms"
                  //     : "dropDownSelect"
                  // }
                  onChange={(e) =>
                    handleDataClassVarSelection(e, value.IndexName)
                  }
                  value={data[value.IndexName]}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    getContentAnchorEl: null,
                  }}
                  disabled={props.isReadOnly} //code updated on 26 September 2022 for BugId 115467
                >
                  {loadedVariables.map((value) => {
                    return (
                      <MenuItem
                      style={{fontSize:'12px'}}  //Changes for Bug 121146 
                        // className="statusSelect"
                        value={value.VariableName}
                      >
                        {value.VariableName}
                      </MenuItem>
                    );
                  })}
                </Select> */}
                    {
                      //code updated on 07 mar 2023 for BugId 124545
                    }
                    <Grid item xs={8}>
                      <CustomizedDropdown
                        id={`pmweb_archive_fieldMapping_${index}`}
                        ariaLabel={`${data[value.IndexName]}`}
                        style={{
                          border: "1px solid #B2B2B2",
                          // width: "140px",
                          // marginLeft: "35px",
                          // for BUGID 127591 on 7/21/2023
                          width: "100%",
                        }}
                        MenuProps={{
                          anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left",
                          },
                          getContentAnchorEl: null,
                          PaperProps: {
                            style: {
                              maxHeight: props.maxHeight
                                ? props.maxHeight
                                : "15rem",
                            },
                          },
                        }}
                        onChange={(e) =>
                          handleDataClassVarSelection(e, value.IndexName)
                        }
                        value={data[value.IndexName]}
                        disabled={props.isReadOnly} //code updated on 26 September 2022 for BugId 115467
                      >
                        {loadedVariables.map((value) => {
                          return (
                            <MenuItem
                              // className="statusSelect"
                              value={value.VariableName}
                              style={{
                                fontSize: "12px", //Changes for Bug 121146
                                direction:
                                  direction === RTL_DIRECTION ? "rtl" : "ltr",
                              }}
                            >
                              {value.VariableName}
                            </MenuItem>
                          );
                        })}
                      </CustomizedDropdown>
                    </Grid>
                  </Grid>
                </tr>
              );
            })}
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "end",
          marginTop: "10px",
          marginRight: "-9px",
          // position: "absolute",
          bottom: "0%",
          right: "4%",
        }}
      >
        <Button
          id="ok_AddVariableModal_DMSAdapter"
          onClick={() => handleMappingSave()}
          variant="contained"
          color="primary"
          disabled={props.isReadOnly}
          onKeyUp={(e) => handleOkClose(e)}
        >
          {t("toolbox.sharePointArchive.ok")}
        </Button>
        <Button
          variant="outlined"
          onClick={() => props.setShowAssDataClassMapping(false)}
          id="close_AddVariableModal_DMSAdapter"
        >
          {t("toolbox.sharePointArchive.cancel")}
        </Button>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    showDrawer: state.showDrawerReducer.showDrawer,
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    cellType: state.selectedCellReducer.selectedType,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
  };
};
export default connect(mapStateToProps, null)(FieldMapping);
