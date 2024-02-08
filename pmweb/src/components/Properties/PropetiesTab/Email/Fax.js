import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import "./index.css";
import { Select, MenuItem, Checkbox } from "@material-ui/core";
import { connect, useDispatch, useSelector } from "react-redux";
import { store, useGlobalState } from "state-pool";
import {
  RTL_DIRECTION,
  headerHeight,
  propertiesLabel,
} from "../../../../Constants/appConstants";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { OpenProcessSliceValue } from "../../../../redux-store/slices/OpenProcessSlice";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { ActivityPropertySaveCancelValue } from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";
import arabicStyles from "./ArabicStyles.module.css";

const StyledTableCell = withStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
  root: {
    "&:nth-of-type(even)": {
      backgroundColor: "#fff",
    },
  },
}))(TableRow);

// code updated on 11 Nov 2022 for BugId 115585
const useStyles = makeStyles((theme) => ({
  table: {
    height: 40,
    borderSpacing: "0 0.125rem",
  },
  tableContainer: {
    // padding: "1.5rem 0 0",
    height: 270,
  },
  tableRow: {
    height: 40,
  },
  tableHeader: {
    fontWeight: 600,
    fontSize: 13,
    backgroundColor: "#f8f8f8",
    borderTop: "1px solid #f8f8f8",
    borderBottom: "1px solid #f8f8f8",
    borderRadius: "0.125rem",
    color: "black",
    // padding: "0 1vw",
    padding: "0 3px",
    textAlign: "start",
  },
  tableBodyCell: {
    fontSize: "var(--base_text_font_size) !important",
    fontWeight: "500 !important",
    // padding: "0 1vw",
    padding: "0 3px",
    textAlign: "start",
  },
}));

function Fax(props) {
  let { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const [checked, setChecked] = useState({});
  const [allData, setAllData] = useState({});
  const [FaxDropdown, setFaxDropdown] = useState([]);
  const [faxNumber, setfaxNumber] = useState([]);
  const [isFaxConst, setIsFaxConst] = useState(false);
  const openProcessData = useSelector(OpenProcessSliceValue);
  const DropdownOptions = [t("status")];
  const [varDocSelected, setVarDocSelected] = useState(DropdownOptions[0]);
  const [allChecked, setAllChecked] = useState(false);
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  let isReadOnly =
    props.openTemplateFlag ||
    isReadOnlyFunc(
      localLoadedProcessData,
      props.cellCheckedOut,
      props.cellLaneId
    ) ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue);
  const { templateDoc } = props;
  const faxNoRef = useRef();

  const menuProps = {
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    style: {
      maxHeight: 400,
    },
    getContentAnchorEl: null,
  };

  /*Bug 123919 - safari>>email>>getting error in saving email property
    [27-03-2023] Commented the UseEffect which gets called on saveCancelStatus.SaveClicked change*/

  // useEffect(() => {
  //   if (saveCancelStatus.SaveOnceClicked) {
  //     let isValidObj;
  //     isValidObj = validateFunc();
  //     //   if (!isValidObj) {
  //     //     dispatch(
  //     //       setToastDataFunc({
  //     //         message: "Please fill all the mandatory fields",
  //     //         severity: "error",
  //     //         open: true,
  //     //       })
  //     //     );
  //     //   } else {
  //     //     dispatch(
  //     //       setActivityPropertyChange({
  //     //         [propertiesLabel.send]: { isModified: true, hasError: false },
  //     //       })
  //     //     );
  //     //   }
  //     // }
  //     // dispatch(setSave({ SaveClicked: false }));
  //   }
  // }, [saveCancelStatus.SaveClicked]);

  useEffect(() => {
    let temp = [];
    let tempLocal = JSON.parse(JSON.stringify(localLoadedProcessData));
    tempLocal?.DynamicConstant?.forEach((el) => {
      let tempObj = {
        VariableName: el.ConstantName,
        VariableScope: "C",
        ExtObjId: "0",
        VarFieldId: "0",
        VariableId: "0",
      };
      temp.push(tempObj);
    });
    tempLocal?.Variable?.forEach((el) => {
      if (el.VariableScope === "M") {
        temp.push(el);
      }
    });
    setFaxDropdown(temp);
  }, [localLoadedProcessData]);

  const docTypeHandler = (e) => {
    setVarDocSelected(e.target.value);
  };

  const addHandler = () => {
    let temp1 = JSON.parse(JSON.stringify(allData));
    if (temp1["v_42_0"]) {
      dispatch(
        setToastDataFunc({
          message: t("docAlreadyAdded"),
          severity: "error",
          open: true,
        })
      );
    } else {
      let tempdata = {
        docTypeId: "0",
        DocName: t("status"),
        createDoc: "N",
        m_bCreateCheckbox: false,
        m_bFax: false,
        varFieldId: "0",
        variableId: "42",
      };
      temp1 = { ...temp1, ["v_42_0"]: tempdata }; // key = [v_${variableId}_${varFieldId}]
      setAllData(temp1);

      let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
      let SaveFax = {
        ...temp.ActivityProperty?.sendInfo?.faxInfo?.mapselectedfaxDocList,
      };
      temp.ActivityProperty.sendInfo.faxInfo.mapselectedfaxDocList = {
        ...SaveFax,
        [`v_42_0`]: tempdata,
      };
      setlocalLoadedActivityPropertyData(temp);
    }
  };

  useEffect(() => {
    let tempList =
      localLoadedActivityPropertyData?.ActivityProperty?.sendInfo?.faxInfo
        ?.mapselectedfaxDocList;
    let temp = {
      [`-998`]: {
        createDoc: "N",
        docTypeId: "-998",
        m_bCreateCheckbox: false,
        m_bFax: false,
        varFieldId: "0",
        variableId: "0",
        DocName: "Conversation",
      },
      [`-999`]: {
        createDoc: "N",
        docTypeId: "-999",
        m_bCreateCheckbox: false,
        m_bFax: false,
        varFieldId: "0",
        variableId: "0",
        DocName: "Audit Trail",
      },
    };
    let tempLocal = JSON.parse(JSON.stringify(openProcessData.loadedData));
    tempLocal?.DocumentTypeList?.forEach((el) => {
      temp = {
        ...temp,
        [`d_${el.DocTypeId}`]: {
          createDoc: "N",
          docTypeId: el.DocTypeId,
          m_bCreateCheckbox: false,
          m_bFax: true,
          varFieldId: "0",
          variableId: "0",
          DocName: el.DocName,
        },
      };
    });
    if (tempList && tempList["v_42_0"]) {
      temp = {
        ...temp,
        ["v_42_0"]: {
          docTypeId: "0",
          DocName: t("status"),
          createDoc: "N",
          m_bCreateCheckbox: false,
          m_bFax: false,
          varFieldId: "0",
          variableId: "42",
        },
      };
    }
    setAllData(temp);

    let tempCheck = {};
    let isFaxAllChecked = true;
    Object.keys(temp)?.forEach((el) => {
      tempCheck = {
        ...tempCheck,
        [el]: {
          m_bCreateCheckbox:
            typeof tempList != "undefined" && tempList[el]?.m_bCreateCheckbox
              ? tempList[el].m_bCreateCheckbox
              : false,
          m_bFax:
            typeof tempList != "undefined" && tempList[el]?.m_bFax
              ? tempList[el].m_bFax
              : false,
        },
      };
      if (typeof tempList != "undefined" && !tempList[el]?.m_bFax) {
        isFaxAllChecked = false;
      }
    });
    setChecked({ ...tempCheck });
    setAllChecked(isFaxAllChecked);

    setIsFaxConst(
      localLoadedActivityPropertyData?.ActivityProperty?.sendInfo?.faxInfo
        ?.m_bConstFaxFlag
    );
    if (
      localLoadedActivityPropertyData?.ActivityProperty?.sendInfo?.faxInfo
        ?.m_bConstFaxFlag
    ) {
      setfaxNumber(
        localLoadedActivityPropertyData?.ActivityProperty?.sendInfo?.faxInfo
          ?.m_strConstantFaxNumber
      );
    } else {
      setfaxNumber(
        localLoadedActivityPropertyData?.ActivityProperty?.sendInfo?.faxInfo
          ?.m_strFaxNumber
      );
    }

    let isValidObj = validateFunc();

    //Modified on 24/05/2023, bug_id:127611
    /*  if (!isValidObj) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.send]: { isModified: true, hasError: true },
        })
      );
    } */

    if (saveCancelStatus.SaveOnceClicked) {
      if (!isValidObj) {
        dispatch(
          setActivityPropertyChange({
            [propertiesLabel.send]: { isModified: true, hasError: true },
          })
        );
      }
    }

    /*Bug 123919 - safari>>email>>getting error in saving email property
    [27-03-2023] Calling the props passed method*/
    props.UpdateActivityData(localLoadedActivityPropertyData);
  }, [openProcessData.loadedData, localLoadedActivityPropertyData]);

  const validateFunc = () => {
    let isValid = true;
    let faxInfo =
      localLoadedActivityPropertyData?.ActivityProperty?.sendInfo?.faxInfo;
    if (faxInfo?.m_bConstFaxFlag) {
      if (
        !faxInfo?.m_strConstantFaxNumber ||
        faxInfo?.m_strConstantFaxNumber?.trim() === ""
      ) {
        isValid = false;
      }
    } else {
      if (faxInfo?.m_strFaxNumber?.trim() === "") {
        isValid = false;
      }
    }
    return isValid;
  };

  // Function that runs when the user changes the value of fax number handler.
  const faxNumHandler = (e, isConst) => {
    const { value } = e.target;

    setfaxNumber("");
    setfaxNumber(e.target.value);
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    temp.ActivityProperty.sendInfo.faxInfo.m_bConstFaxFlag = isConst;
    if (isConst) {
      temp.ActivityProperty.sendInfo.faxInfo.m_strConstantFaxNumber = value;
      temp.ActivityProperty.sendInfo.faxInfo.m_strFaxNumber = "";
      temp.ActivityProperty.sendInfo.faxInfo.varFieldIdFax = "0";
      temp.ActivityProperty.sendInfo.faxInfo.varIdFax = "0";
      temp.ActivityProperty.sendInfo.faxInfo.varTypeFax = "C";
    } else {
      let varId, varFieldId, varType;
      FaxDropdown?.forEach((el) => {
        if (el.VariableName === value) {
          varId = el.VariableId;
          varFieldId = el.VarFieldId;
          varType = el.VariableScope;
        }
      });
      temp.ActivityProperty.sendInfo.faxInfo.m_strConstantFaxNumber = "";
      temp.ActivityProperty.sendInfo.faxInfo.m_strFaxNumber = value;
      temp.ActivityProperty.sendInfo.faxInfo.varFieldIdFax = varFieldId;
      temp.ActivityProperty.sendInfo.faxInfo.varIdFax = varId;
      temp.ActivityProperty.sendInfo.faxInfo.varTypeFax = varType;
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.send]: { isModified: true, hasError: false },
      })
    );
  };

  // Function that gets called when the user clicks on any checkbox for a specific document.
  const checkHandler = (e, el) => {
    const { name } = e.target;
    let tempCheck = { ...checked };
    let isFaxAllChecked = true;
    if (name === "m_bFax" && !e.target.checked) {
      tempCheck[el] = {
        ...tempCheck[el],
        [name]: e.target.checked,
        m_bCreateCheckbox: false,
      };
    } else {
      tempCheck[el] = { ...tempCheck[el], [name]: e.target.checked };
    }
    Object.keys(allData)?.forEach((el) => {
      if (!tempCheck[el].m_bFax) {
        isFaxAllChecked = false;
      }
    });
    setChecked({ ...tempCheck });
    setAllChecked(isFaxAllChecked);
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let SaveFax = JSON.parse(
      JSON.stringify(
        temp.ActivityProperty?.sendInfo?.faxInfo?.mapselectedfaxDocList
      )
    );
    if (el === "-998" || el === "-999") {
      temp.ActivityProperty.sendInfo.faxInfo.mapselectedfaxDocList = {
        ...SaveFax,
        [`${allData[el].docTypeId}`]: {
          createDoc: allData[el].createDoc,
          docTypeId: allData[el].docTypeId,
          m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox,
          m_bFax: tempCheck[el].m_bFax,
          varFieldId: allData[el].varFieldId,
          variableId: allData[el].variableId,
        },
      };
    } else if (el === "v_42_0") {
      temp.ActivityProperty.sendInfo.faxInfo.mapselectedfaxDocList = {
        ...SaveFax,
        [`v_42_0`]: {
          createDoc: tempCheck[el].m_bCreateCheckbox
            ? "Y"
            : allData[el].createDoc,
          docTypeId: allData[el].docTypeId,
          m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
          m_bFax: tempCheck[el].m_bFax ? true : false,
          varFieldId: allData[el].varFieldId,
          variableId: allData[el].variableId,
        },
      };
    } else {
      temp.ActivityProperty.sendInfo.faxInfo.mapselectedfaxDocList = {
        ...SaveFax,
        [`d_${allData[el].docTypeId}`]: {
          createDoc: templateDoc.includes(allData[el].DocName)
            ? tempCheck[el].m_bCreateCheckbox
              ? "Y"
              : "N"
            : allData[el].createDoc, // code edited on 13 Jan 2023 for BugId 122384
          docTypeId: allData[el].docTypeId,
          m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
          m_bFax: tempCheck[el].m_bFax ? true : false,
          varFieldId: allData[el].varFieldId,
          variableId: allData[el].variableId,
        },
      };
    }
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.send]: { isModified: true, hasError: false },
      })
    );
  };

  // Function that handles the check all checkbox changes for fax.
  const handleAllCheck = (e) => {
    setAllChecked(e.target.checked);
    let tempCheck = JSON.parse(JSON.stringify(checked));
    Object.keys(allData)?.forEach((el) => {
      if (!e.target.checked) {
        tempCheck[el] = {
          ...tempCheck[el],
          m_bFax: e.target.checked,
          m_bCreateCheckbox: false,
        };
      } else {
        tempCheck[el] = { ...tempCheck[el], m_bFax: e.target.checked };
      }
    });
    setChecked({ ...tempCheck });
    let temp = JSON.parse(JSON.stringify(localLoadedActivityPropertyData));
    let SaveFax = {
      ...temp.ActivityProperty?.sendInfo?.faxInfo?.mapselectedfaxDocList,
    };
    let tempLocalCheck = {};
    Object.keys(allData)?.forEach((el) => {
      if (el === "-998" || el === "-999") {
        tempLocalCheck = {
          ...tempLocalCheck,
          [`${allData[el].docTypeId}`]: {
            createDoc: allData[el].createDoc,
            docTypeId: allData[el].docTypeId,
            m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
            m_bFax: tempCheck[el].m_bFax ? true : false,
            varFieldId: allData[el].varFieldId,
            variableId: allData[el].variableId,
          },
        };
      } else if (el === "v_42_0") {
        tempLocalCheck = {
          ...tempLocalCheck,
          [`v_42_0`]: {
            createDoc: tempCheck[el].m_bCreateCheckbox
              ? "Y"
              : allData[el].createDoc,
            docTypeId: allData[el].docTypeId,
            m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
            m_bFax: tempCheck[el].m_bFax ? true : false,
            varFieldId: allData[el].varFieldId,
            variableId: allData[el].variableId,
          },
        };
      } else {
        tempLocalCheck = {
          ...tempLocalCheck,
          [`d_${allData[el].docTypeId}`]: {
            createDoc: allData[el].createDoc,
            docTypeId: allData[el].docTypeId,
            m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
            m_bFax: tempCheck[el].m_bFax ? true : false,
            varFieldId: allData[el].varFieldId,
            variableId: allData[el].variableId,
          },
        };
      }
    });

    temp.ActivityProperty.sendInfo.faxInfo.mapselectedfaxDocList = {
      ...SaveFax,
      ...tempLocalCheck,
    };
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.send]: { isModified: true, hasError: false },
      })
    );
  };

  const handleError = (msg) => {
    dispatch(
      setToastDataFunc({
        message: msg,
        severity: "error",
        open: true,
      })
    );
  };

  return (
    <div
      className="marginAllAround"
      style={{
        direction: direction,
        /* code added on 6 July 2023 for issue - save and discard button hide 
        issue in case of tablet(landscape mode)*/
        height: `calc((${windowInnerHeight}px - ${headerHeight}) - 15rem)`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: props.isDrawerExpanded ? "row" : "column",
          gap: props.isDrawerExpanded ? "3vw" : "1rem",
        }}
      >
        <div className="row" style={{ alignItems: "end", gap: "1vw" }}>
          <div>
            <p
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.varUsedLabel
                  : "varUsedLabel"
              }
              style={{ color: "#606060" }}
            >
              {t("DocType")}
            </p>
            <label htmlFor="doctype_select" className="pmweb_sr_only">
              {t("SelectDocumentTypeForFax")}
            </label>
            <Select
              className="dropdownEmail"
              MenuProps={menuProps}
              value={varDocSelected}
              onChange={(event) => docTypeHandler(event)}
              style={{ margin: "var(--spacing_v) 0" }}
              disabled={isReadOnly}
              id="pmweb_fax_doctype_select"
              inputProps={{
                id: "doctype_select",
                "aria-label": t("SelectDocumentTypeForFax"),
              }}
              name="Select Document Type"
              tabIndex={0}
            >
              {DropdownOptions?.map((element) => {
                return (
                  <MenuItem
                    className="menuItemStylesDropdown"
                    key={element}
                    value={element}
                    style={{
                      justifyContent:
                        direction === RTL_DIRECTION ? "end" : "start",
                    }}
                  >
                    {element}
                  </MenuItem>
                );
              })}
            </Select>
          </div>
          <button
            style={{ margin: "0 !important" }}
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.addbtnEmail
                : isReadOnly
                ? "disabledbtnEmail"
                : "addbtnEmail"
            }
            disabled={isReadOnly}
            onClick={addHandler}
            id="pmweb_fax_doctype_add_button"
          >
            {t("add")}
          </button>
        </div>
        <div style={{ width: "fit-content" }}>
          <p
            className={
              direction === RTL_DIRECTION
                ? arabicStyles.varUsedLabel
                : "varUsedLabel"
            }
            style={{ color: "#606060" }}
          >
            {t("faxNo")}
            <span className="starIcon">*</span>
          </p>
          <div style={{ margin: "var(--spacing_v) 0" }}>
            <CustomizedDropdown
              className="dropdownEmail"
              value={faxNumber}
              onChange={(event, isConst) => faxNumHandler(event, isConst)}
              isConstant={isFaxConst}
              setIsConstant={(val) => setIsFaxConst(val)}
              showConstValue={true}
              menuItemStyles="menuItemStylesDropdown"
              disabled={isReadOnly}
              constType={"11"} //Bug 126315 - email>>improper message is appearing while entering special character
              minimumValue={"0"}
              onError={handleError} //Bug 126315 - email>>improper message is appearing while entering special character
              id="pmweb_fax_faxno_dropdown"
              ariaDescription="Fax No. Select"
              reference={faxNoRef} // added on 11/09/2023 for BugId 136715
            >
              {FaxDropdown?.map((element) => {
                return (
                  <MenuItem
                    className="menuItemStylesDropdown"
                    key={element.VariableName}
                    value={element.VariableName}
                    style={{
                      justifyContent:
                        direction === RTL_DIRECTION ? "end" : "start",
                    }}
                  >
                    {element.VariableName}
                  </MenuItem>
                );
              })}
            </CustomizedDropdown>
          </div>
        </div>
      </div>

      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table
          className={`${classes.table} ${
            props.isDrawerExpanded
              ? "webServicePropertiestableEx"
              : "webServicePropertiestableCo"
          } webServicePropertiestable`}
          style={{ width: props.isDrawerExpanded ? "70%" : "100%" }}
          aria-label="Documents Table"
          stickyHeader
        >
          <TableHead>
            <StyledTableRow className={classes.tableRow}>
              <StyledTableCell
                className={classes.tableHeader}
                style={{ width: props.isDrawerExpanded ? "32vw" : "25%" }}
                width={props.isDrawerExpanded ? "32vw" : "25%"}
              >
                {t("document")}
              </StyledTableCell>
              <StyledTableCell
                className={classes.tableHeader}
                style={{ width: props.isDrawerExpanded ? "32vw" : "25%" }}
                width={props.isDrawerExpanded ? "32vw" : "25%"}
              >
                {/* <span id="faxcheck_checkbox" style={{display:"none"}}>{t("SelectAllDoc")}</span> */}
                <Checkbox
                  className="emailCheck"
                  checked={allChecked}
                  onChange={(e) => handleAllCheck(e)}
                  disabled={isReadOnly}
                  id="pmweb_fax_faxcheck_checkbox"
                  inputProps={{
                    "aria-label": t("SelectAllDocForFax"),
                  }}
                  name="Fax Checkbox"
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      handleAllCheck({
                        ...e,
                        target: { ...e.target, checked: !allChecked },
                      });
                    }
                  }}
                />
                {t("fax")}
              </StyledTableCell>
              <StyledTableCell
                className={classes.tableHeader}
                style={{ width: props.isDrawerExpanded ? "32vw" : "50%" }}
                width={props.isDrawerExpanded ? "32vw" : "50%"}
              >
                {/* <label htmlFor="createifnotfound_checkbox" style={{display:"none"}}>Create If Not Found</label> */}
                <Checkbox
                  className="emailCheck"
                  disabled
                  id="pmweb_fax_emailcheck_checkbox"
                  inputProps={{
                    "aria-label": t("SelectAllDocCreateIfNotFoundForFax"),
                  }}
                  name="Create If not found checkbox"
                />
                {t("CreateIfNotFound")}
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody className="associatedTemplateDiv">
            {Object?.keys(allData)?.map((el) => (
              <StyledTableRow
                key={allData[el].DocId}
                className={classes.tableRow}
              >
                <StyledTableCell
                  className={classes.tableBodyCell}
                  component="th"
                  scope="row"
                  style={{ width: props.isDrawerExpanded ? "32vw" : "25%" }}
                  width={props.isDrawerExpanded ? "32vw" : "25%"}
                >
                  {allData[el].DocName}
                </StyledTableCell>

                <StyledTableCell
                  className={classes.tableBodyCell}
                  style={{ width: props.isDrawerExpanded ? "32vw" : "25%" }}
                  width={props.isDrawerExpanded ? "32vw" : "25%"}
                >
                  {/* <label htmlFor={`m_bfaxcheckbox_${el}`} style={{display:"none"}}>{allData[el].DocName}</label> */}
                  <Checkbox
                    className="emailCheck"
                    name="m_bFax"
                    checked={checked[el]?.m_bFax ? true : false}
                    onChange={(e) => checkHandler(e, el)}
                    disabled={isReadOnly}
                    id={`pmweb_fax_m_bfaxcheckbox_${el}`}
                    inputProps={{
                      "aria-label": allData[el]?.DocName,
                    }}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        checkHandler(
                          {
                            ...e,
                            target: {
                              ...e.target,
                              checked: !checked[el]?.m_bFax,
                            },
                          },
                          el
                        );
                      }
                    }}
                  />
                </StyledTableCell>
                <StyledTableCell
                  className={classes.tableBodyCell}
                  style={{ width: props.isDrawerExpanded ? "32vw" : "50%" }}
                  width={props.isDrawerExpanded ? "32vw" : "50%"}
                >
                  {/* code edited on 13 Jan 2023 for BugId 122384 */}
                  {/* <label htmlFor={`m_bCreateCheckbox_${el}`} style={{display:"none"}}>{allData[el].DocName}</label> */}
                  <Checkbox
                    className="emailCheck"
                    name="m_bCreateCheckbox"
                    disabled={
                      (allData[el].DocName !== t("status") &&
                        !templateDoc.includes(allData[el].DocName)) ||
                      isReadOnly
                        ? true
                        : !checked[el]?.m_bFax || isReadOnly
                        ? true
                        : false
                    }
                    checked={
                      allData[el].DocName !== t("status") &&
                      !templateDoc.includes(allData[el].DocName)
                        ? false
                        : checked[el]?.m_bCreateCheckbox
                    }
                    onChange={(e) => checkHandler(e, el)}
                    id={`pmweb_fax_m_bCreateCheckbox_${el}`}
                    inputProps={{
                      "aria-label": allData[el]?.DocName,
                    }}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        checkHandler(
                          {
                            ...e,
                            target: {
                              ...e.target,
                              checked: !(allData[el].DocName !== t("status") &&
                              !templateDoc.includes(allData[el].DocName)
                                ? false
                                : checked[el]?.m_bCreateCheckbox),
                            },
                          },
                          el
                        );
                      }
                    }}
                  />
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
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

export default connect(mapStateToProps, null)(Fax);
