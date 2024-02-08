// #BugID - 111522 (Archive Tab Bug)
//Date:28 June 2022
// #BugDescription - Handled check to prevent the archive tab blank redirection.
// #BugID - 116578  (Close modal popup bug)
//Date:18 October 2022
// #BugDescription - Handled check to prevent the backdrop click for closing the modal popup.
// #BugID - 116577
// #BugDescription - Validation message popup issue has been fixed.
// #Date - 18 Nov 2022
// #BugID - 120489
// #BugDescription - Handled css for mapping modal.

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { connect, useDispatch } from "react-redux";
import { store, useGlobalState } from "state-pool";
import {
  ENDPOINT_GET_LIBRARY_LIST,
  RTL_DIRECTION,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import axios from "axios";
import { addConstantsToString } from "../../../../utility/ProcessSettings/Triggers/triggerCommonFunctions";
import {
  Box,
  FormHelperText,
  TextField,
  MenuItem,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Modal,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import "./index.css";
import * as actionCreators from "../../../../redux-store/actions/Properties/showDrawerAction.js";
import Toast from "../../../../UI/ErrorToast";
import TabsHeading from "../../../../UI/TabsHeading";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  bgcolor: "background.paper",
  borderRadius: "2px",
  border: "1px solid #F5F5F5",
  boxShadow: 24,
  background: "#fff",
};

function SharePointArchive(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let dispatch = useDispatch();
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    );

  /*code updated on 28 June 2022 for BugId 111522*/
  const tempLoc = localLoadedActivityPropertyData?.ActivityProperty
    ?.sharePointArchiveInfo.diffFolderLoc
    ? false
    : true;

  const [location, setLocation] = useState(tempLoc);
  const [assign, setAssign] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.sharePointArchiveInfo
      ?.sameFieldForAllDoc
  );
  const [archiveVariables, setArchiveVariables] = useState([]);
  const [associateList, setAssociateList] = useState([]);

  /*code updated on 28 June 2022 for BugId 111522*/
  const [serviceUrl, setServiceUrl] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.sharePointArchiveInfo
      ?.serviceURL
  );
  const [url, setUrl] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.sharePointArchiveInfo
      ?.url
  );

  /*code updated on 28 June 2022 for BugId 111522*/
  const [docLibrary, setDocLibrary] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.sharePointArchiveInfo
      ?.docLibrary
  );

  /*code updated on 28 June 2022 for BugId 111522*/
  const [domain, setDomain] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.sharePointArchiveInfo
      ?.domainName
  );

  /*code updated on 28 June 2022 for BugId 111522*/
  const [siteUrl, setSiteUrl] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.sharePointArchiveInfo
      ?.site
  );
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const [urlVar, setUrlVar] = useState("0");

  const [docVar, setDocVar] = useState("0");

  const [locVar, setLocVar] = useState("0");

  const [archiveVar, setArchiveVar] = useState([]);
  const [locVarList, setLocVarList] = useState([]);
  const [archiveAsList, setArchiveAsList] = useState([]);
  const [archiveLocList, setArchiveLocList] = useState([]);

  const [isOpenAssignModal, setIsOpenAssignModal] = useState(false);

  const [assignLibraryList, setAssignLibraryList] = useState([]);

  const [sameLocation, setSameLocation] = useState(
    localLoadedActivityPropertyData?.ActivityProperty?.sharePointArchiveInfo
      ?.folderInfo?.folderName
  );

  const [isMapModalOpenRes, setIsMapModalOpenRes] = useState(false);

  const [mapList, setMapList] = useState([]);

  const [mapProcessVar, setMapProcessVar] = useState([]);

  const [mapUserData, setMapUserData] = useState({
    username: "",
    password: "",
  });

  const [isIndModal, setIsIndModal] = useState(false);

  const [assignIndivList, setAssignIndivList] = useState([]);

  const [indIndex, setIndIndex] = useState(null);

  const [isError, setIsError] = useState({
    valid: false,
    msg: "",
    severity: "",
  });

  //function to show hide for folder location
  const showLocation = (e) => {
    setLocation(e.target.checked);
  };

  //function to show hide for assign rights
  const showAssignment = (e) => {
    setAssign(e.target.checked);
  };

  useEffect(() => {
    //setting variable list from process
    setArchiveVariables(
      localLoadedProcessData?.Variable?.map((item) => ({
        DefaultValue: item.DefaultValue,
        ExtObjectId: item.ExtObjectId,
        SystemDefinedName: item.SystemDefinedName,
        Unbounded: item.Unbounded,
        VarFieldId: item.VarFieldId,
        VarPrecision: item.VarPrecision,
        VariableId: item.VariableId,
        VariableLength: item.VariableLength,
        VariableName: item.VariableName,
        VariableScope: item.VariableScope,
        VariableType: item.VariableType,
      }))
    );

    //fetching docTypeDCMapList from activityproperty

    setAssociateList(
      localLoadedActivityPropertyData?.ActivityProperty?.sharePointArchiveInfo?.docTypeInfo?.docTypeDCMapList?.map(
        (item, i) => ({
          archiveAs: item.archiveAs,
          archiveLoc: item.archiveLoc,
          docTypeId: item.docTypeId,
          docTypeName: item.docTypeName,
          selectedDoc: item.selectedDoc,
          assignRights: item.assignRights,
          checked: item.selectedDoc,
        })
      )
    );

    //setting map list data to state variable
    localLoadedActivityPropertyData?.ActivityProperty?.sharePointArchiveInfo?.docTypeInfo?.docTypeDCMapList?.forEach(
      (elem, i) => {
        setArchiveVar((archiveVar) => [...archiveVar, "0"]);
        setLocVarList((locVarList) => [...locVarList, "0"]);
        setArchiveAsList((archiveAsList) => [...archiveAsList, elem.archiveAs]);
        setArchiveLocList((archiveLocList) => [
          ...archiveLocList,
          elem.archiveLoc,
        ]);
      }
    );
  }, []);

  const openMapModal = () => {
    setIsMapModalOpen(true);
  };

  const closeMapModal = () => {
    setIsMapModalOpen(false);
  };

  const openMapModalRes = () => {
    setIsMapModalOpenRes(true);
  };

  const closeMapModalRes = () => {
    setIsMapModalOpenRes(false);
  };

  const openAssignModal = () => {
    setIsOpenAssignModal(true);
  };

  const closeAssignModal = () => {
    setIsOpenAssignModal(false);
  };

  const getVariableURL = (e) => {
    setUrlVar(e.target.value);
  };

  const getDocVar = (e) => {
    setDocVar(e.target.value);
  };

  const getLocVar = (e) => {
    setLocVar(e.target.value);
  };

  const addURL = () => {
    if (urlVar == "0" || urlVar == "" || urlVar == null) {
      /* setIsError({
        valid: true,
        msg: t("toolbox.sharePointArchive.selURLVar"),
        severity: "error",
      }); */

      dispatch(
        setToastDataFunc({
          message: t("toolbox.sharePointArchive.selURLVar"),
          severity: "error",
          open: true,
        })
      );
    } else {
      let str = addConstantsToString(url, urlVar);
      setUrl(str);

      const tempLocalState = { ...localLoadedActivityPropertyData };
      tempLocalState.ActivityProperty.sharePointArchiveInfo.url = str;
      setlocalLoadedActivityPropertyData(tempLocalState);

      dispatch(
        setActivityPropertyChange({
          ArchiveSharePoint: { isModified: true, hasError: false },
        })
      );
    }
  };

  const addDocVar = () => {
    if (docVar == "0" || docVar == "" || docVar == null) {
      /*  setIsError({
        valid: true,
        msg: t("toolbox.sharePointArchive.selDocLib"),
        severity: "error",
      }); */
      dispatch(
        setToastDataFunc({
          message: t("toolbox.sharePointArchive.selDocLib"),
          severity: "error",
          open: true,
        })
      );
    } else {
      let str = addConstantsToString(docLibrary, docVar);
      setDocLibrary(str);

      const tempLocalState = { ...localLoadedActivityPropertyData };
      tempLocalState.ActivityProperty.sharePointArchiveInfo.docLibrary = str;
      setlocalLoadedActivityPropertyData(tempLocalState);

      dispatch(
        setActivityPropertyChange({
          ArchiveSharePoint: { isModified: true, hasError: false },
        })
      );
    }
  };

  const addLocVar = () => {
    if (locVar == "0" || locVar == "" || locVar == null) {
      /*  setIsError({
        valid: true,
        msg: t("toolbox.sharePointArchive.selLocVar"),
        severity: "error",
      }); */
      dispatch(
        setToastDataFunc({
          message: t("toolbox.sharePointArchive.selLocVar"),
          severity: "error",
          open: true,
        })
      );
    } else {
      let str = addConstantsToString(sameLocation, locVar);
      setSameLocation(str);

      const tempLocalState = { ...localLoadedActivityPropertyData };
      tempLocalState.ActivityProperty.sharePointArchiveInfo.folderInfo.folderName =
        str;

      tempLocalState?.ActivityProperty?.sharePointArchiveInfo?.docTypeInfo?.docTypeDCMapList?.map(
        (data, i) => {
          data.archiveLoc = str;
        }
      );

      setlocalLoadedActivityPropertyData(tempLocalState);

      dispatch(
        setActivityPropertyChange({
          ArchiveSharePoint: { isModified: true, hasError: false },
        })
      );
    }
  };

  function getArchiveVar(e, index) {
    let data = [...archiveVar];
    data[index] = e.target.value;
    setArchiveVar(data);
  }

  const changeLocation = (e, index) => {
    let data = [...locVarList];
    data[index] = e.target.value;
    setLocVarList(data);

    dispatch(
      setActivityPropertyChange({
        ArchiveSharePoint: { isModified: true, hasError: false },
      })
    );
  };

  const addArchiveVar = (index) => {
    if (
      archiveVar[index] == "0" ||
      archiveVar[index] == "" ||
      archiveVar[index] == null
    ) {
      /* setIsError({
        valid: true,
        msg: t("toolbox.sharePointArchive.selArchVar"),
        severity: "error",
      }); */
      dispatch(
        setToastDataFunc({
          message: t("toolbox.sharePointArchive.selArchVar"),
          severity: "error",
          open: true,
        })
      );
    } else {
      let str = addConstantsToString(archiveAsList[index], archiveVar[index]);

      let data = [...archiveAsList];
      data[index] = str;
      setArchiveAsList(data);

      const tempLocalState = { ...localLoadedActivityPropertyData };
      tempLocalState.ActivityProperty.sharePointArchiveInfo.docTypeInfo.docTypeDCMapList[
        index
      ].archiveAs = str;
      setlocalLoadedActivityPropertyData(tempLocalState);

      dispatch(
        setActivityPropertyChange({
          ArchiveSharePoint: { isModified: true, hasError: false },
        })
      );
    }
  };

  const addArchiveLocation = (index) => {
    if (
      locVarList[index] == "0" ||
      locVarList[index] == "" ||
      locVarList[index] == null
    ) {
      /* setIsError({
        valid: true,
        msg: t("toolbox.sharePointArchive.selLocVar"),
        severity: "error",
      }); */
      dispatch(
        setToastDataFunc({
          message: t("toolbox.sharePointArchive.selLocVar"),
          severity: "error",
          open: true,
        })
      );
    } else {
      let str = addConstantsToString(archiveLocList[index], locVarList[index]);

      let data = [...archiveLocList];
      data[index] = str;
      setArchiveLocList(data);

      const tempLocalState = { ...localLoadedActivityPropertyData };
      tempLocalState.ActivityProperty.sharePointArchiveInfo.docTypeInfo.docTypeDCMapList[
        index
      ].archiveLoc = str;
      setlocalLoadedActivityPropertyData(tempLocalState);

      dispatch(
        setActivityPropertyChange({
          ArchiveSharePoint: { isModified: true, hasError: false },
        })
      );
    }
  };

  const mapData = () => {
    if (mapUserData.username == "" || mapUserData.password == "") {
      /* setIsError({
        valid: true,
        msg: t("toolbox.sharePointArchive.userMsg"),
        severity: "error",
      }); */
      dispatch(
        setToastDataFunc({
          message: t("toolbox.sharePointArchive.userMsg"),
          severity: "error",
          open: true,
        })
      );
    } else {
      setIsMapModalOpen(false);
      openMapModalRes();

      const postData = {
        serviceURL: serviceUrl,

        url: url,

        site: siteUrl,

        docLibrary: docLibrary,

        domainName: domain,

        userName: mapUserData.username,

        authCode: mapUserData.password,
      };

      {
        /*code updated on 28 June 2022 for BugId 111522*/
      }
      axios
        .post(
          SERVER_URL +
            ENDPOINT_GET_LIBRARY_LIST +
            localLoadedActivityPropertyData?.ActivityProperty?.actId,
          postData
        )
        .then((res) => {
          setMapList(
            res?.data?.map((elem) => ({
              assocExtObjId: elem.assocExtObjId,
              assocVarFieldId: elem.assocVarFieldId,
              assocVarId: elem.assocVarId,
              assocVarName: elem.assocVarName,
              dataFieldId: elem.dataFieldId,
              dataFieldLength: elem.dataFieldLength,
              dataFieldType: elem.dataFieldType,
              fieldName: elem.fieldName,
              m_arrProcessVarList: elem.m_arrProcessVarList,
              m_bShowConstantTextBox: elem.m_bShowConstantTextBox,
              m_bchkFieldName: elem.m_bchkFieldName,
              m_chkbxSelectAll: elem.m_chkbxSelectAll,
              m_strLocalConstant: elem.m_strLocalConstant,
              m_strSelectedProcessVar: elem.m_strSelectedProcessVar,
            }))
          );

          {
            /*code updated on 28 June 2022 for BugId 111522*/
          }

          res?.data?.forEach((elem, i) => {
            const selData =
              localLoadedActivityPropertyData?.ActivityProperty
                ?.sharePointArchiveInfo?.folderInfo?.fieldMappingInfoList[i]
                ?.assoFieldMapList[0]?.assocVarName;

            setMapProcessVar((mapProcessVar) => [...mapProcessVar, selData]);
          });
        })
        .catch((err) => {
          console.log("AXIOS ERROR: ", err);
        });

      dispatch(
        setActivityPropertyChange({
          ArchiveSharePoint: { isModified: true, hasError: false },
        })
      );
    }
  };

  const changeArchiveAsList = (e, index) => {
    let data = [...archiveAsList];
    data[index] = e.target.value;
    setArchiveAsList(data);

    const tempLocalState = { ...localLoadedActivityPropertyData };
    tempLocalState.ActivityProperty.sharePointArchiveInfo.docTypeInfo.docTypeDCMapList[
      index
    ].archiveAs = e.target.value;
    setlocalLoadedActivityPropertyData(tempLocalState);

    dispatch(
      setActivityPropertyChange({
        ArchiveSharePoint: { isModified: true, hasError: false },
      })
    );
  };

  const changeArchiveLocList = (e, index) => {
    let data = [...archiveLocList];
    data[index] = e.target.value;
    setArchiveLocList(data);

    const tempLocalState = { ...localLoadedActivityPropertyData };
    tempLocalState.ActivityProperty.sharePointArchiveInfo.docTypeInfo.docTypeDCMapList[
      index
    ].archiveLoc = e.target.value;
    setlocalLoadedActivityPropertyData(tempLocalState);

    dispatch(
      setActivityPropertyChange({
        ArchiveSharePoint: { isModified: true, hasError: false },
      })
    );
  };

  const getProcessVar = (e, index) => {
    let data = [...mapProcessVar];
    data[index] = e.target.value;
    setMapProcessVar(data);
  };

  {
    /*code updated on 28 June 2022 for BugId 111522*/
  }

  const selectAll = (e) => {
    if (e.target.checked == true) {
      setAssignLibraryList(
        assignLibraryList?.map((assignLibraryList) => ({
          ...assignLibraryList,
          checked: true,
        }))
      );
    } else {
      setAssignLibraryList(
        assignLibraryList?.map((assignLibraryList) => ({
          ...assignLibraryList,
          checked: false,
        }))
      );
    }
  };

  const selectAllInd = (e) => {
    let temp = [...assignIndivList];
    temp?.forEach((data) => {
      data.checked = e.target.checked;
    });

    setAssignIndivList(temp);
  };

  const checkedValues = (e, index) => {
    let temp = [...assignLibraryList];
    temp[index].checked = e.target.checked;
    setAssignLibraryList(temp);
  };

  const checkedValuesInd = (e, index) => {
    let temp = [...assignIndivList];
    temp[index].checked = e.target.checked;
    setAssignIndivList(temp);
  };

  const checkMapData = (e, index) => {
    let data = [...mapList];
    data[index].m_bchkFieldName = e.target.checked;
    setMapList(data);
  };

  //added data from mapping list to associated list

  const addedMapping = () => {
    let temp = [];

    const newArr = mapList?.map((data, i) => {
      if (data.m_bchkFieldName == true) {
        if (mapProcessVar[i] != "0" && mapProcessVar[i] != "<None>") {
          return { name: data.fieldName, checked: false };
        }
        return { name: 0, checked: false };
      } else {
        return { name: 0, checked: false };
      }
    });

    const tempArr = newArr?.filter((d) => d.name !== 0);
    setAssignLibraryList(tempArr);
    setAssignIndivList(tempArr);
    setIsMapModalOpenRes(false);
  };

  const openIndivAssignModal = (index) => {
    setIsIndModal(true);
    setIndIndex(index);
    if (Object.keys(assignLibraryList).length == 0) {
      const tempData = [...associateList];
      setAssignIndivList(
        tempData[index]?.assignRights?.map((data) => {
          return { name: data.selLibVar, checked: data.selected };
        })
      );
    }
  };

  const closeIndivAssignModal = () => {
    setIsIndModal(false);
  };

  {
    /*code updated on 28 June 2022 for BugId 111522*/
  }
  //Add assign rights to same fields for all location

  const assignDataToList = () => {
    const tempData = [...associateList];
    // tempData?.map((data, i) => {
    tempData?.forEach((data, i) => {
      data.assignRights = assignLibraryList?.filter((d) => d.checked === true);
    });

    setAssociateList(tempData);

    const assignRightsGlobal = assignLibraryList
      ?.filter((d) => d.checked === true)
      ?.map((item) => {
        return { selLibVar: item.name, selected: item.checked };
      });

    const tempLocalState = { ...localLoadedActivityPropertyData };
    tempLocalState?.ActivityProperty?.sharePointArchiveInfo?.docTypeInfo?.docTypeDCMapList?.map(
      (data, i) => {
        data.assignRights = assignRightsGlobal;
      }
    );
    setlocalLoadedActivityPropertyData(tempLocalState);

    setIsIndModal(false);
  };

  //Add assign rights to same fields for different location or Individual

  const assignDataToListInd = (index) => {
    const tempData = [...associateList];

    // tempData?.map((data, i) => {
    tempData?.forEach((data, i) => {
      if (i === index) {
        data.assignRights = assignLibraryList?.filter(
          (d) => d.checked === true
        );
      }
    });

    setAssociateList(tempData);

    {
      /*code updated on 28 June 2022 for BugId 111522*/
    }

    const assignRightsGlobal = assignLibraryList
      ?.filter((d) => d.checked === true)
      ?.map((item) => {
        return { selLibVar: item.name, selected: item.checked };
      });

    const tempLocalState = { ...localLoadedActivityPropertyData };
    tempLocalState?.ActivityProperty?.sharePointArchiveInfo?.docTypeInfo?.docTypeDCMapList?.map(
      (data, i) => {
        if (i === index) {
          data.assignRights = assignRightsGlobal;
        }
      }
    );
    setlocalLoadedActivityPropertyData(tempLocalState);

    setIsIndModal(false);
  };

  const checkedAssocList = (e, index) => {
    let temp = [...associateList];
    temp[index].checked = e.target.checked;

    // temp?.map((data, i) => {
    temp?.forEach((data, i) => {
      if (i === index) {
      }
    });
    setAssociateList(temp);
  };

  const handleChange = (properties, val) => {
    if (val == "") {
      setIsError({
        valid: true,
        msg: t("toolbox.sharePointArchive.emptyField"),
        severity: "error",
      });
    } else {
      const tempLocalState = { ...localLoadedActivityPropertyData };
      if (properties == "serviceURL") {
        tempLocalState.ActivityProperty.sharePointArchiveInfo.serviceURL = val;
      }
      if (properties == "url") {
        tempLocalState.ActivityProperty.sharePointArchiveInfo.url = val;
      }
      if (properties == "siteUrl") {
        tempLocalState.ActivityProperty.sharePointArchiveInfo.site = val;
      }
      if (properties == "doclibrary") {
        tempLocalState.ActivityProperty.sharePointArchiveInfo.docLibrary = val;
      }
      if (properties == "domain") {
        tempLocalState.ActivityProperty.sharePointArchiveInfo.domainName = val;
      }
      if (properties == "location") {
        {
          /*code updated on 28 June 2022 for BugId 111522*/
        }
        tempLocalState.ActivityProperty.sharePointArchiveInfo.folderInfo.folderName =
          val;
        tempLocalState?.ActivityProperty?.sharePointArchiveInfo?.docTypeInfo?.docTypeDCMapList?.map(
          (data, i) => {
            data.archiveLoc = val;
          }
        );
      }

      setlocalLoadedActivityPropertyData(tempLocalState);

      dispatch(
        setActivityPropertyChange({
          ArchiveSharePoint: { isModified: true, hasError: false },
        })
      );
    }
  };

  return (
    <>
      <div
        className={
          direction == RTL_DIRECTION ? "mainContainerRTL" : "mainContainer"
        }
      >
        {isError.valid === true ? (
          <Toast
            open={isError.valid != false}
            closeToast={() => setIsError({ ...isError, valid: false })}
            message={isError.msg}
            severity={isError.severity}
          />
        ) : null}

        {
          //the below modal is for data comes after mapping
        }
        <Modal
          open={isMapModalOpenRes}
          onClose={closeMapModalRes}
          id="map-modal"
          className="modalCommonFeature"
          disableBackdropClick="true"
        >
          <Box sx={styleModal} className="ModalBox">
            <div
              className={
                direction == RTL_DIRECTION ? "modalHeaderRTL" : "modalHeader"
              }
            >
              <div
                className={
                  direction == RTL_DIRECTION
                    ? "labels modalLabelRTL"
                    : "labels modalLabel"
                }
              >
                <h4>{t("toolbox.sharePointArchive.mapDataShare")}</h4>
              </div>
              <div
                className={
                  direction == RTL_DIRECTION ? "modalCloseRTL" : "modalClose"
                }
              >
                <CloseIcon
                  style={{
                    fontSize: "medium",
                    cursor: props.disabled ? "not-allowed" : "pointer",
                    height: "100%",
                    width: "1.2rem",
                    color: "#707070",
                    marginRight: "2px",
                    marginTop: "8px",
                    // display: props.disabled ? "none": ""
                  }}
                  onClick={closeMapModalRes}
                />
              </div>
            </div>
            <div className="modalBody">
              <Box>
                <table
                  className={
                    direction == RTL_DIRECTION
                      ? "archiveTableRTL"
                      : "archiveTable"
                  }
                >
                  <thead>
                    <tr>
                      <th>{t("toolbox.sharePointArchive.docLibField")}</th>
                      <th>{t("toolbox.sharePointArchive.processVar")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mapList?.map((item, i) => (
                      <tr>
                        <td>
                          <FormGroup>
                            <FormControlLabel
                              className={
                                direction == RTL_DIRECTION
                                  ? "controlTextRTL"
                                  : "controlText"
                              }
                              control={
                                <Checkbox
                                  size="small"
                                  onChange={(e) => {
                                    checkMapData(e, i);
                                  }}
                                  checked={item.m_bchkFieldName}
                                  value={item.fieldName}
                                />
                              }
                              label={item.fieldName}
                            ></FormControlLabel>
                          </FormGroup>
                        </td>
                        <td>
                          {
                            //mapProcessVar[i]
                          }
                          <CustomizedDropdown
                            className="dropDown"
                            id="url-dropdown"
                            isNotMandatory={true}
                            value={mapProcessVar[i]}
                            onChange={(e) => {
                              getProcessVar(e, i);
                            }}
                          >
                            <MenuItem value="0">
                              {t("toolbox.sharePointArchive.selectItem")}
                            </MenuItem>
                            {item?.m_arrProcessVarList?.map((data, i) => (
                              <MenuItem value={data.value}>
                                {data.label}
                              </MenuItem>
                            ))}
                          </CustomizedDropdown>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </div>
            <div
              className={
                direction == RTL_DIRECTION ? "modalFooterRTL" : "modalFooter"
              }
            >
              <div
                className={
                  direction == RTL_DIRECTION
                    ? "modalFooterInnerRTL"
                    : "modalFooterInner"
                }
              >
                <Button
                  id="cancelMapRes"
                  className="btn-archive cancelMap"
                  color="primary"
                  variant="outlined"
                  size="small"
                  onClick={closeMapModalRes}
                >
                  {t("toolbox.sharePointArchive.cancel")}
                </Button>
                <Button
                  id="mapDataModalRes"
                  className="btn-archive btnMapModal"
                  variant="contained"
                  size="small"
                  onClick={addedMapping}
                >
                  {t("toolbox.sharePointArchive.ok")}
                </Button>
              </div>
            </div>
          </Box>
        </Modal>
        {/*  <div className="labels">
          <h4> {t("toolbox.sharePointArchive.archive")}</h4>
        </div> */}
        <TabsHeading heading={props?.heading} />
        <Box
          className={
            props.isDrawerExpanded ? "flexRow section" : "sectionCollapse"
          }
        >
          <div
            className={
              props.isDrawerExpanded ? "formControl" : "formControlCollapse"
            }
          >
            <p>
              <FormHelperText
                className={
                  direction == RTL_DIRECTION ? "textHelperRTL" : "textHelper"
                }
              >
                {t("toolbox.sharePointArchive.serviceUrl")}
              </FormHelperText>
            </p>
            <p>
              <TextField
                className="outlinedBasic"
                value={serviceUrl}
                variant="outlined"
                onChange={(e) => {
                  setServiceUrl(e.target.value);
                }}
                onKeyUp={() => {
                  handleChange("serviceURL", serviceUrl);
                }}
                disabled={isReadOnly}
              />
            </p>
          </div>
          <div
            className={
              props.isDrawerExpanded ? "formControl" : "formControlCollapse"
            }
          >
            <p>
              <FormHelperText
                className={
                  direction == RTL_DIRECTION ? "textHelperRTL" : "textHelper"
                }
              >
                {t("toolbox.sharePointArchive.url")}
              </FormHelperText>
            </p>
            <p className={props.isDrawerExpanded ? "flexInnerRow" : ""}>
              <div className="dropBtnWrapper">
                <CustomizedDropdown
                  className="dropDown"
                  id="url-dropdown"
                  isNotMandatory={true}
                  value={urlVar}
                  onChange={getVariableURL}
                  disabled={isReadOnly}
                >
                  <MenuItem value="0">
                    {t("toolbox.sharePointArchive.selectItem")}
                  </MenuItem>
                  {/*code updated on 28 June 2022 for BugId 111522*/}
                  {archiveVariables?.map((data, i) => (
                    <MenuItem value={data.VariableName}>
                      {data.VariableName}
                    </MenuItem>
                  ))}
                </CustomizedDropdown>
                {!isReadOnly && (
                  <Button
                    className="btn-archive addBtn"
                    color="primary"
                    variant="outlined"
                    size="small"
                    onClick={addURL}
                  >
                    {t("toolbox.sharePointArchive.add")}
                  </Button>
                )}
              </div>

              <div
                className={props.isDrawerExpanded ? "" : "indvInputCollapse"}
              >
                <TextField
                  className="outlinedBasic"
                  value={url}
                  variant="outlined"
                  onChange={(e) => {
                    setUrl(e.target.value);
                  }}
                  onKeyUp={() => {
                    handleChange("url", url);
                  }}
                  disabled={isReadOnly}
                />
              </div>
            </p>
          </div>
          <div
            className={
              props.isDrawerExpanded ? "formControl" : "formControlCollapse"
            }
          >
            <p>
              <FormHelperText
                className={
                  direction == RTL_DIRECTION ? "textHelperRTL" : "textHelper"
                }
              >
                {t("toolbox.sharePointArchive.site")}
              </FormHelperText>
            </p>
            <p>
              <TextField
                className="outlinedBasic"
                value={siteUrl}
                variant="outlined"
                onChange={(e) => {
                  setSiteUrl(e.target.value);
                }}
                onKeyUp={() => {
                  handleChange("siteUrl", siteUrl);
                }}
                disabled={isReadOnly}
              />
            </p>
          </div>
        </Box>

        <Box className={props.isDrawerExpanded ? "flexRow section" : ""}>
          <div
            className={
              props.isDrawerExpanded ? "formControl" : "formControlCollapse"
            }
          >
            <p>
              <FormHelperText
                className={
                  direction == RTL_DIRECTION ? "textHelperRTL" : "textHelper"
                }
              >
                {t("toolbox.sharePointArchive.docLib")}
              </FormHelperText>
            </p>
            <p className={props.isDrawerExpanded ? "flexInnerRow" : ""}>
              <div className="dropBtnWrapper">
                <CustomizedDropdown
                  className="dropDown"
                  id="library-dropdown"
                  isNotMandatory={true}
                  value={docVar}
                  onChange={getDocVar}
                  disabled={isReadOnly}
                >
                  <MenuItem value="0">
                    {t("toolbox.sharePointArchive.selectItem")}
                  </MenuItem>
                  {/*code updated on 28 June 2022 for BugId 111522*/}
                  {archiveVariables?.map((data) => (
                    <MenuItem value={data.VariableName}>
                      {data.VariableName}
                    </MenuItem>
                  ))}
                </CustomizedDropdown>
                {!isReadOnly && (
                  <Button
                    className="btn-archive addBtn"
                    color="primary"
                    variant="outlined"
                    size="small"
                    onClick={addDocVar}
                  >
                    {t("toolbox.sharePointArchive.add")}
                  </Button>
                )}
              </div>

              <div
                className={props.isDrawerExpanded ? "" : "indvInputCollapse"}
              >
                <TextField
                  className="outlinedBasic"
                  value={docLibrary}
                  variant="outlined"
                  onChange={(e) => {
                    setDocLibrary(e.target.value);
                  }}
                  onKeyUp={() => {
                    handleChange("doclibrary", docLibrary);
                  }}
                  disabled={isReadOnly}
                />
              </div>
            </p>
          </div>
          <div
            className={
              props.isDrawerExpanded ? "formControl" : "formControlCollapse"
            }
          >
            <p>
              <FormHelperText
                className={
                  direction == RTL_DIRECTION ? "textHelperRTL" : "textHelper"
                }
              >
                {t("toolbox.sharePointArchive.domainName")}
              </FormHelperText>
            </p>
            <p>
              <TextField
                className="outlinedBasic"
                value={domain}
                variant="outlined"
                onChange={(e) => {
                  setDomain(e.target.value);
                }}
                onKeyUp={() => {
                  handleChange("domain", domain);
                }}
                disabled={isReadOnly}
              />
            </p>
          </div>
          <div
            className={
              props.isDrawerExpanded ? "formControl" : "formControlCollapse"
            }
          >
            {!isReadOnly && (
              <Button
                id={props.isDrawerExpanded ? "mapData" : ""}
                className="btn-archive"
                color="primary"
                variant="outlined"
                size="small"
                onClick={openMapModal}
              >
                {t("toolbox.sharePointArchive.mapData")}
              </Button>
            )}
          </div>
          {
            //this modal open when click on map data
          }

          <Modal
            open={isMapModalOpen}
            onClose={closeMapModal}
            id="map-modal"
            disableBackdropClick="true"
            className="modalCommonFeature"
          >
            <Box sx={styleModal} className="ModalBox">
              <div
                className={
                  direction == RTL_DIRECTION ? "modalHeaderRTL" : "modalHeader"
                }
              >
                <div
                  className={
                    direction == RTL_DIRECTION
                      ? "labels modalLabelRTL"
                      : "labels modalLabel"
                  }
                >
                  <h4> {t("toolbox.sharePointArchive.mapDataShare")}</h4>
                </div>
                <div
                  className={
                    direction == RTL_DIRECTION ? "modalCloseRTL" : "modalClose"
                  }
                >
                  <CloseIcon
                    style={{
                      fontSize: "medium",
                      cursor: props.disabled ? "not-allowed" : "pointer",
                      height: "100%",
                      width: "1.2rem",
                      color: "#707070",
                      marginRight: "2px",
                      marginTop: "8px",
                      // display: props.disabled ? "none": ""
                    }}
                    onClick={closeMapModal}
                  />
                </div>
              </div>
              <div className="modalBody">
                <div className="formControl">
                  <p>
                    <FormHelperText
                      className={
                        direction == RTL_DIRECTION
                          ? "textHelperRTL"
                          : "textHelper"
                      }
                    >
                      {t("toolbox.sharePointArchive.username")}
                      <span className="required">*</span>
                    </FormHelperText>
                  </p>
                  <p>
                    <TextField
                      className="outlinedBasic modalText"
                      variant="outlined"
                      value={mapUserData.username}
                      onChange={(e) => {
                        setMapUserData({
                          ...mapUserData,
                          username: e.target.value,
                        });
                      }}
                      id="username"
                    />
                  </p>
                </div>
                <div className="formControl modalControl">
                  <p>
                    <FormHelperText
                      className={
                        direction == RTL_DIRECTION
                          ? "textHelperRTL"
                          : "textHelper"
                      }
                    >
                      {t("toolbox.sharePointArchive.password")}
                      <span className="required">*</span>
                    </FormHelperText>
                  </p>
                  <p>
                    <TextField
                      className="outlinedBasic modalText"
                      id="filled-password-input"
                      type="password"
                      variant="outlined"
                      value={mapUserData.password}
                      onChange={(e) => {
                        setMapUserData({
                          ...mapUserData,
                          password: e.target.value,
                        });
                      }}
                    />
                  </p>
                </div>
                <div className="formControl modalControl">
                  <p>
                    <FormHelperText
                      className={
                        direction == RTL_DIRECTION
                          ? "textHelperRTL"
                          : "textHelper"
                      }
                    >
                      {t("toolbox.sharePointArchive.serviceUrl")}
                    </FormHelperText>
                  </p>
                  <p
                    className={
                      direction == RTL_DIRECTION ? "textHelperRTL" : ""
                    }
                  >
                    {serviceUrl}
                  </p>
                </div>
                <div className="formControl modalControl">
                  <p>
                    <FormHelperText
                      className={
                        direction == RTL_DIRECTION
                          ? "textHelperRTL"
                          : "textHelper"
                      }
                    >
                      {t("toolbox.sharePointArchive.url")}
                    </FormHelperText>
                  </p>
                  <p
                    className={
                      direction == RTL_DIRECTION ? "textHelperRTL" : ""
                    }
                  >
                    {url}
                  </p>
                </div>
                <div className="formControl modalControl">
                  <p>
                    <FormHelperText
                      className={
                        direction == RTL_DIRECTION
                          ? "textHelperRTL"
                          : "textHelper"
                      }
                    >
                      {t("toolbox.sharePointArchive.site")}
                    </FormHelperText>
                  </p>
                  <p
                    className={
                      direction == RTL_DIRECTION ? "textHelperRTL" : ""
                    }
                  >
                    {siteUrl}
                  </p>
                </div>
                <div className="formControl modalControl">
                  <p>
                    <FormHelperText
                      className={
                        direction == RTL_DIRECTION
                          ? "textHelperRTL"
                          : "textHelper"
                      }
                    >
                      {t("toolbox.sharePointArchive.docLib")}
                    </FormHelperText>
                  </p>
                  <p
                    className={
                      direction == RTL_DIRECTION ? "textHelperRTL" : ""
                    }
                  >
                    {docLibrary}
                  </p>
                </div>
                <div className="formControl modalControl">
                  <p>
                    <FormHelperText
                      className={
                        direction == RTL_DIRECTION
                          ? "textHelperRTL"
                          : "textHelper"
                      }
                    >
                      {t("toolbox.sharePointArchive.domainName")}
                    </FormHelperText>
                  </p>
                  <p
                    className={
                      direction == RTL_DIRECTION ? "textHelperRTL" : ""
                    }
                  >
                    {domain}
                  </p>
                </div>
              </div>
              <div
                className={
                  direction == RTL_DIRECTION ? "modalFooterRTL" : "modalFooter"
                }
              >
                <div
                  className={
                    direction == RTL_DIRECTION
                      ? "modalFooterInnerRTL"
                      : "modalFooterInner"
                  }
                >
                  <Button
                    id="cancelMap"
                    className="btn-archive cancelMap"
                    color="primary"
                    variant="outlined"
                    size="small"
                    onClick={closeMapModal}
                  >
                    {t("toolbox.sharePointArchive.cancel")}
                  </Button>
                  <Button
                    id="mapDataModal"
                    className="btn-archive btnMapModal"
                    variant="contained"
                    size="small"
                    onClick={() => {
                      mapData();
                    }}
                  >
                    {t("toolbox.sharePointArchive.map")}
                  </Button>
                </div>
              </div>
            </Box>
          </Modal>
        </Box>
        {!props.isDrawerExpanded ? (
          <Box
            className={
              props.isDrawerExpanded ? "section" : "archiveSectionCollapse"
            }
          >
            <div className="labels">
              <h4>{t("toolbox.sharePointArchive.archiveDocType")}</h4>
            </div>
            <div className="labels">
              <Button
                id="view"
                className="btn-archive"
                variant="outlined"
                size="small"
                onClick={() => {
                  props.expandDrawer(true);
                }}
              >
                {t("toolbox.sharePointArchive.view")}
              </Button>
            </div>
          </Box>
        ) : (
          ""
        )}

        {props.isDrawerExpanded ? (
          <>
            <Box
              className={
                props.isDrawerExpanded ? "section" : "archiveSectionCollapse"
              }
            >
              <div className="labels">
                <h4>{t("toolbox.sharePointArchive.archiveDocType")}</h4>
              </div>

              <div className="labels">
                <FormGroup>
                  <FormControlLabel
                    className={
                      direction == RTL_DIRECTION
                        ? "controlTextRTL"
                        : "controlText"
                    }
                    control={
                      <Checkbox
                        size="small"
                        checked={location}
                        onChange={showLocation}
                        disabled={isReadOnly}
                      />
                    }
                    label={t("toolbox.sharePointArchive.folderLocation")}
                  />
                  {location ? (
                    <Box className="flexRow">
                      <div className="formControl">
                        <p>
                          <FormHelperText
                            className={
                              direction == RTL_DIRECTION
                                ? "textHelperRTL"
                                : "textHelper"
                            }
                          >
                            {t("toolbox.sharePointArchive.variables")}
                          </FormHelperText>
                        </p>
                        <p
                          style={{
                            display: "flex",
                            gap: "5px",
                            alignItems: "center",
                          }}
                        >
                          <CustomizedDropdown
                            className="dropDown"
                            id="variable-dropdown"
                            isNotMandatory={true}
                            value={locVar}
                            onChange={getLocVar}
                            disabled={isReadOnly}
                          >
                            <MenuItem value="0">
                              {t("toolbox.sharePointArchive.selectItem")}
                            </MenuItem>
                            {/*code updated on 28 June 2022 for BugId 111522*/}
                            {archiveVariables?.map((data) => (
                              <MenuItem value={data.VariableName}>
                                {data.VariableName}
                              </MenuItem>
                            ))}
                          </CustomizedDropdown>
                          {!isReadOnly && (
                            <Button
                              className="btn-archive addBtn"
                              color="primary"
                              variant="outlined"
                              size="small"
                              onClick={addLocVar}
                            >
                              {t("toolbox.sharePointArchive.add")}
                            </Button>
                          )}
                        </p>
                      </div>
                      <div className="formControl">
                        <p>
                          <FormHelperText
                            className={
                              direction == RTL_DIRECTION
                                ? "textHelperRTL"
                                : "textHelper"
                            }
                          >
                            {t("toolbox.sharePointArchive.location")}
                          </FormHelperText>
                        </p>
                        <p>
                          <TextField
                            className="outlinedBasic"
                            value={sameLocation}
                            onChange={(e) => {
                              setSameLocation(e.target.value);
                            }}
                            onKeyUp={() => {
                              handleChange("location", sameLocation);
                            }}
                            disabled={isReadOnly}
                            variant="outlined"
                          />
                        </p>
                      </div>
                    </Box>
                  ) : (
                    ""
                  )}

                  <FormControlLabel
                    className={
                      direction == RTL_DIRECTION
                        ? "controlTextRTL"
                        : "controlText"
                    }
                    control={
                      <Checkbox
                        size="small"
                        checked={assign}
                        onChange={showAssignment}
                        disabled={isReadOnly}
                      />
                    }
                    label={t("toolbox.sharePointArchive.fieldLocation")}
                  />
                  {assign ? (
                    <Box className="flexRow">
                      <div className="formControl">
                        {!isReadOnly && (
                          <Button
                            id="rights"
                            className="btn-archive"
                            color="primary"
                            variant="outlined"
                            size="small"
                            onClick={openAssignModal}
                          >
                            {t("toolbox.sharePointArchive.assignRight")}
                          </Button>
                        )}
                      </div>
                    </Box>
                  ) : (
                    ""
                  )}
                </FormGroup>
              </div>
              {
                //this modal is for global assign rights
              }
              <Modal
                open={isOpenAssignModal}
                onClose={closeAssignModal}
                disableBackdropClick="true"
                className="modalCommonFeature"
              >
                <Box sx={styleModal} className="ModalBox">
                  <div
                    className={
                      direction == RTL_DIRECTION
                        ? "modalHeaderRTL"
                        : "modalHeader"
                    }
                  >
                    <div
                      className={
                        direction == RTL_DIRECTION
                          ? "labels modalLabelRTL"
                          : "labels modalLabel"
                      }
                    >
                      <h4>{t("toolbox.sharePointArchive.assignRight")}</h4>
                    </div>
                    <div
                      className={
                        direction == RTL_DIRECTION
                          ? "modalCloseRTL"
                          : "modalClose"
                      }
                    >
                      <CloseIcon
                        style={{
                          fontSize: "medium",
                          cursor: props.disabled ? "not-allowed" : "pointer",
                          height: "100%",
                          width: "1.2rem",
                          color: "#707070",
                          marginRight: "2px",
                          marginTop: "8px",
                        }}
                        onClick={closeAssignModal}
                      />
                    </div>
                  </div>
                  <div className="modalBody">
                    <div className="allCheckContainer">
                      <FormGroup>
                        <FormControlLabel
                          className={
                            direction == RTL_DIRECTION
                              ? "allCheckLabelRTL"
                              : "allCheckLabel"
                          }
                          control={
                            <Checkbox
                              name="cehckedAll"
                              size="small"
                              onChange={selectAll}
                            />
                          }
                          label={t("toolbox.sharePointArchive.docLibField")}
                        />
                      </FormGroup>
                    </div>
                    <div className="checkList">
                      <FormGroup>
                        {assignLibraryList?.map((data, j) => (
                          <FormControlLabel
                            className={
                              direction == RTL_DIRECTION
                                ? "allCheckLabelRTL"
                                : "allCheckLabel"
                            }
                            control={
                              <Checkbox
                                size="small"
                                key={data.name}
                                checked={data.checked}
                                value={data.name}
                                onChange={(e) => {
                                  checkedValues(e, j);
                                }}
                              />
                            }
                            label={data.name}
                          />
                        ))}
                      </FormGroup>
                    </div>
                    <div></div>
                  </div>
                  <div
                    className={
                      direction == RTL_DIRECTION
                        ? "modalFooterRTL"
                        : "modalFooter"
                    }
                  >
                    <div
                      className={
                        direction == RTL_DIRECTION
                          ? "modalFooterInnerRTL"
                          : "modalFooterInner"
                      }
                    >
                      <Button
                        id="cancelAssign"
                        className="btn-archive cancelMap"
                        color="primary"
                        variant="outlined"
                        size="small"
                        onClick={closeAssignModal}
                      >
                        {t("toolbox.sharePointArchive.cancel")}
                      </Button>
                      <Button
                        id="assignDataModal"
                        className="btn-archive btnMapModal"
                        variant="contained"
                        size="small"
                        onClick={assignDataToList}
                      >
                        {t("toolbox.sharePointArchive.ok")}
                      </Button>
                    </div>
                  </div>
                </Box>
              </Modal>
            </Box>
            <Box className="flexRow section">
              <table
                className={
                  direction == RTL_DIRECTION
                    ? "archiveTableRTL"
                    : "archiveTable"
                }
              >
                <thead>
                  <tr>
                    <th>{t("toolbox.sharePointArchive.docType")}</th>
                    <th>{t("toolbox.sharePointArchive.archiveAs")}</th>
                    <th>{t("toolbox.sharePointArchive.location")}</th>
                  </tr>
                </thead>
                <tbody>
                  {associateList?.map((data, i) => (
                    <tr key={i}>
                      <td>
                        <FormGroup>
                          <FormControlLabel
                            className={
                              direction == RTL_DIRECTION
                                ? "controlTextRTL"
                                : "controlText"
                            }
                            control={
                              <Checkbox
                                checked={data.checked}
                                size="small"
                                onChange={(e) => {
                                  checkedAssocList(e, i);
                                }}
                                disabled={isReadOnly}
                              />
                            }
                            label={data.docTypeName}
                          ></FormControlLabel>
                        </FormGroup>
                      </td>
                      <td>
                        <div
                          className="formControll"
                          style={{
                            display: "flex",
                            gap: "5px",
                          }}
                        >
                          <div>
                            <CustomizedDropdown
                              className="dropDown"
                              id="variable-dropdown"
                              isNotMandatory={true}
                              value={archiveVar[i]}
                              onChange={(e) => {
                                getArchiveVar(e, i);
                              }}
                              disabled={isReadOnly}
                            >
                              <MenuItem value="0">
                                {t("toolbox.sharePointArchive.selectItem")}
                              </MenuItem>
                              {/*code updated on 28 June 2022 for BugId 111522*/}
                              {archiveVariables?.map((item) => (
                                <MenuItem value={item.VariableName}>
                                  {item.VariableName}
                                </MenuItem>
                              ))}
                            </CustomizedDropdown>
                          </div>
                          <div>
                            {!isReadOnly && (
                              <Button
                                className="btn-archive addBtn"
                                color="primary"
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  addArchiveVar(i);
                                }}
                              >
                                {t("toolbox.sharePointArchive.add")}
                              </Button>
                            )}
                          </div>
                          <div>
                            <TextField
                              className="outlinedBasic"
                              value={archiveAsList[i]}
                              variant="outlined"
                              onChange={(e) => {
                                changeArchiveAsList(e, i);
                              }}
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div
                          className="formControll"
                          style={{ display: "flex", gap: "10px" }}
                        >
                          {location ? (
                            ""
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                gap: "5px",
                              }}
                            >
                              <CustomizedDropdown
                                className="dropDown"
                                id="library-dropdown"
                                isNotMandatory={true}
                                value={locVarList[i]}
                                onChange={(e) => {
                                  changeLocation(e, i);
                                }}
                                disabled={isReadOnly}
                              >
                                <MenuItem value="0">
                                  {t("toolbox.sharePointArchive.selectItem")}
                                </MenuItem>
                                {archiveVariables?.map((data) => (
                                  <MenuItem value={data.VariableName}>
                                    {data.VariableName}
                                  </MenuItem>
                                ))}
                              </CustomizedDropdown>
                              {!isReadOnly && (
                                <Button
                                  className="btn-archive addBtn"
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                  onClick={() => {
                                    addArchiveLocation(i);
                                  }}
                                >
                                  {t("toolbox.sharePointArchive.add")}
                                </Button>
                              )}
                              <TextField
                                className="outlinedBasic"
                                value={archiveLocList[i]}
                                variant="outlined"
                                onChange={(e) => {
                                  changeArchiveLocList(e, i);
                                }}
                                disabled={isReadOnly}
                              />
                            </div>
                          )}

                          {assign ? (
                            ""
                          ) : (
                            <div>
                              {!isReadOnly && (
                                <Button
                                  className="btn-archive"
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                  id=""
                                  onClick={() => {
                                    openIndivAssignModal(i);
                                  }}
                                >
                                  {t("toolbox.sharePointArchive.assignRight")}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {
                //this modal is for individual assign rights
              }
              <Modal
                open={isIndModal}
                onClose={closeIndivAssignModal}
                disableBackdropClick="true"
                className="modalCommonFeature"
              >
                <Box sx={styleModal} className="ModalBox">
                  <div
                    className={
                      direction == RTL_DIRECTION
                        ? "modalHeaderRTL"
                        : "modalHeader"
                    }
                  >
                    <div
                      className={
                        direction == RTL_DIRECTION
                          ? "labels modalLabelRTL"
                          : "labels modalLabel"
                      }
                    >
                      <h4>{t("toolbox.sharePointArchive.assignRight")}</h4>
                    </div>
                    <div
                      className={
                        direction == RTL_DIRECTION
                          ? "modalCloseRTL"
                          : "modalClose"
                      }
                    >
                      <CloseIcon
                        style={{
                          fontSize: "medium",
                          cursor: props.disabled ? "not-allowed" : "pointer",
                          height: "100%",
                          width: "1.2rem",
                          color: "#707070",
                          marginRight: "2px",
                          marginTop: "8px",
                          // display: props.disabled ? "none": ""
                        }}
                        onClick={closeIndivAssignModal}
                      />
                    </div>
                  </div>
                  <div className="modalBody">
                    <div className="allCheckContainer">
                      <FormGroup>
                        <FormControlLabel
                          className={
                            direction == RTL_DIRECTION
                              ? "allCheckLabelRTL"
                              : "allCheckLabel"
                          }
                          control={
                            <Checkbox
                              name="cehckedAll"
                              size="small"
                              onChange={selectAllInd}
                            />
                          }
                          label={t("toolbox.sharePointArchive.docLibField")}
                        />
                      </FormGroup>
                    </div>
                    <div className="checkList">
                      <FormGroup>
                        {assignIndivList?.map((data, j) => (
                          <FormControlLabel
                            className={
                              direction == RTL_DIRECTION
                                ? "allCheckLabelRTL"
                                : "allCheckLabel"
                            }
                            control={
                              <Checkbox
                                size="small"
                                key={data.name}
                                checked={data.checked}
                                value={data.name}
                                onChange={(e) => {
                                  checkedValuesInd(e, j);
                                }}
                              />
                            }
                            label={data.name}
                          />
                        ))}
                      </FormGroup>
                    </div>
                    <div></div>
                  </div>
                  <div
                    className={
                      direction == RTL_DIRECTION
                        ? "modalFooterRTL"
                        : "modalFooter"
                    }
                  >
                    <div
                      className={
                        direction == RTL_DIRECTION
                          ? "modalFooterInnerRTL"
                          : "modalFooterInner"
                      }
                    >
                      <Button
                        id="cancelAssign"
                        className="btn-archive cancelMap"
                        color="primary"
                        variant="outlined"
                        size="small"
                        onClick={closeIndivAssignModal}
                      >
                        {t("toolbox.sharePointArchive.cancel")}
                      </Button>
                      <Button
                        id="assignDataModal"
                        className="btn-archive btnMapModal"
                        variant="contained"
                        size="small"
                        onClick={() => {
                          assignDataToListInd(indIndex);
                        }}
                      >
                        {t("toolbox.sharePointArchive.ok")}
                      </Button>
                    </div>
                  </div>
                </Box>
              </Modal>
            </Box>
          </>
        ) : (
          ""
        )}
      </div>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    cellCheckedOut: state.selectedCellReducer.selectedCheckedOut,
    cellLaneId: state.selectedCellReducer.selectedActLaneId,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    expandDrawer: (flag) => dispatch(actionCreators.expandDrawer(flag)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SharePointArchive);
