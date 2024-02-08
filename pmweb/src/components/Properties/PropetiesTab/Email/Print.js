// #BugID - 115277
// #BugDescription - handled checks for redirecting blank page on close.
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CustomizedDropdown from "../../../../UI/Components_With_ErrrorHandling/Dropdown";
import "./index.css";
import { MenuItem, Checkbox } from "@material-ui/core";
import { connect, useDispatch, useSelector } from "react-redux";
import { store, useGlobalState } from "state-pool";
import arabicStyles from "./ArabicStyles.module.css";
import {
  headerHeight,
  propertiesLabel,
  RTL_DIRECTION,
} from "../../../../Constants/appConstants";
import { OpenProcessSliceValue } from "../../../../redux-store/slices/OpenProcessSlice";
import { withStyles, makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { isReadOnlyFunc } from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";

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

function Print(props) {
  let { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch();
  const direction = `${t("HTML_DIR")}`;
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const DropdownOptions = [t("status")];
  const [varDocSelected, setVarDocSelected] = useState(DropdownOptions[0]);
  const [checked, setChecked] = useState({});
  const [allChecked, setAllChecked] = useState(false);
  const openProcessData = useSelector(OpenProcessSliceValue);
  const [allData, setAllData] = useState({});
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
  const { templateDoc } = props;

  const docTypeHandler = (e) => {
    setVarDocSelected(e.target.value);
  };

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

  const addHandler = () => {
    let temp1 = { ...allData };
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
        m_bPrint: false,
        varFieldId: "0",
        variableId: "42",
      };

      temp1 = { ...temp1, ["v_42_0"]: tempdata }; // key = [v_${variableId}_${varFieldId}]
      setAllData(temp1);

      let temp = { ...localLoadedActivityPropertyData };
      let SavePrint = {
        ...temp.ActivityProperty?.sendInfo?.printInfo?.mapselectedprintDocList,
      };
      temp.ActivityProperty.sendInfo.printInfo.mapselectedprintDocList = {
        ...SavePrint,
        [`v_42_0`]: tempdata,
      };
      setlocalLoadedActivityPropertyData(temp);
    }
  };

  useEffect(() => {
    let tempList =
      localLoadedActivityPropertyData?.ActivityProperty?.sendInfo?.printInfo
        ?.mapselectedprintDocList;
    let temp = {
      [`-998`]: {
        createDoc: "N",
        docTypeId: "-998",
        m_bCreateCheckbox: false,
        m_bPrint: false,
        varFieldId: "0",
        variableId: "0",
        DocName: `${t("conversation")}`,
      },
      [`-999`]: {
        createDoc: "N",
        docTypeId: "-999",
        m_bCreateCheckbox: false,
        m_bPrint: false,
        varFieldId: "0",
        variableId: "0",
        DocName: `${t("auditTrail")}`,
      },
    };

    let tempLocal = JSON.parse(JSON.stringify(openProcessData.loadedData));
    tempLocal?.DocumentTypeList.forEach((el) => {
      temp = {
        ...temp,
        [`d_${el.DocTypeId}`]: {
          createDoc: "N",
          docTypeId: el.DocTypeId,
          m_bCreateCheckbox: false,
          m_bPrint: true,
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
          m_bPrint: false,
          varFieldId: "0",
          variableId: "42",
        },
      };
    }
    setAllData(temp);

    let tempCheck = {};
    let isPrintAllChecked = true;
    Object.keys(temp)?.forEach((el) => {
      tempCheck = {
        ...tempCheck,
        [el]: {
          m_bCreateCheckbox:
            typeof tempList != "undefined" && tempList[el]?.m_bCreateCheckbox
              ? tempList[el].m_bCreateCheckbox
              : false,
          m_bPrint:
            typeof tempList != "undefined" && tempList[el]?.m_bPrint
              ? tempList[el].m_bPrint
              : false,
        },
      };
      if (typeof tempList != "undefined" && !tempList[el]?.m_bPrint) {
        isPrintAllChecked = false;
      }
    });
    setChecked(tempCheck);
    setAllChecked(isPrintAllChecked);
  }, [openProcessData.loadedData, localLoadedActivityPropertyData]);

  const CheckHandler = (e, el) => {
    let tempCheck = { ...checked };
    let isPrintAllChecked = true;
    if (e.target.name === "m_bPrint" && !e.target.checked) {
      tempCheck[el] = {
        ...tempCheck[el],
        [e.target.name]: e.target.checked,
        m_bCreateCheckbox: false,
      };
    } else {
      tempCheck[el] = { ...tempCheck[el], [e.target.name]: e.target.checked };
    }
    Object.keys(allData)?.forEach((el) => {
      if (!tempCheck[el].m_bPrint) {
        isPrintAllChecked = false;
      }
    });
    setChecked(tempCheck);
    setAllChecked(isPrintAllChecked);
    let temp = { ...localLoadedActivityPropertyData };
    let SavePrint = {
      ...temp.ActivityProperty?.sendInfo?.printInfo?.mapselectedprintDocList,
    };
    if (el === "-998" || el === "-999") {
      temp.ActivityProperty.sendInfo.printInfo.mapselectedprintDocList = {
        ...SavePrint,
        [`${allData[el].docTypeId}`]: {
          createDoc: allData[el].createDoc,
          docTypeId: allData[el].docTypeId,
          m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
          m_bPrint: tempCheck[el].m_bPrint ? true : false,
          varFieldId: allData[el].varFieldId,
          variableId: allData[el].variableId,
        },
      };
    } else if (el === "v_42_0") {
      temp.ActivityProperty.sendInfo.printInfo.mapselectedprintDocList = {
        ...SavePrint,
        [`v_42_0`]: {
          createDoc: tempCheck[el].m_bCreateCheckbox
            ? "Y"
            : allData[el].createDoc,
          docTypeId: allData[el].docTypeId,
          m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
          m_bPrint: tempCheck[el].m_bPrint ? true : false,
          varFieldId: allData[el].varFieldId,
          variableId: allData[el].variableId,
        },
      };
    } else {
      temp.ActivityProperty.sendInfo.printInfo.mapselectedprintDocList = {
        ...SavePrint,
        [`d_${allData[el].docTypeId}`]: {
          createDoc: templateDoc.includes(allData[el].DocName)
            ? tempCheck[el].m_bCreateCheckbox
              ? "Y"
              : "N"
            : allData[el].createDoc, // code edited on 13 Jan 2023 for BugId 122384
          docTypeId: allData[el].docTypeId,
          m_bCreateCheckbox: tempCheck[el].m_bCreateCheckbox ? true : false,
          m_bPrint: tempCheck[el].m_bPrint ? true : false,
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

  const handleAllCheck = (e) => {
    setAllChecked(e.target.checked);
    let tempCheck = { ...checked };
    Object.keys(allData)?.forEach((el) => {
      if (!e.target.checked) {
        tempCheck[el] = {
          ...tempCheck[el],
          m_bPrint: e.target.checked,
          m_bCreateCheckbox: false,
        };
      } else {
        tempCheck[el] = { ...tempCheck[el], m_bPrint: e.target.checked };
      }
    });
    setChecked(tempCheck);
    let temp = { ...localLoadedActivityPropertyData };
    let SavePrint = {
      ...temp.ActivityProperty?.sendInfo?.printInfo?.mapselectedprintDocList,
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
            m_bPrint: tempCheck[el].m_bPrint ? true : false,
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
            m_bPrint: tempCheck[el].m_bPrint ? true : false,
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
            m_bPrint: tempCheck[el].m_bPrint ? true : false,
            varFieldId: allData[el].varFieldId,
            variableId: allData[el].variableId,
          },
        };
      }
    });

    temp.ActivityProperty.sendInfo.printInfo.mapselectedprintDocList = {
      ...SavePrint,
      ...tempLocalCheck,
    };
    setlocalLoadedActivityPropertyData(temp);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.send]: { isModified: true, hasError: false },
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

      <div className="row" style={{ gap: "1vw" }}>
        <CustomizedDropdown
          className="dropdownEmail"
          MenuProps={menuProps}
          value={varDocSelected}
          onChange={(event) => docTypeHandler(event)}
          disabled={isReadOnly}
          direction={direction}
          id="pmweb_print_doctype_dropdown"
          ariaDescription="Document Type Select"
        >
          {DropdownOptions?.map((element) => {
            return (
              <MenuItem
                className="menuItemStylesDropdown"
                key={element}
                value={element}
                style={{
                  justifyContent: direction === RTL_DIRECTION ? "end" : "start",
                }}
              >
                {element}
              </MenuItem>
            );
          })}
        </CustomizedDropdown>
        <button
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.addbtnEmail
              : isReadOnly
              ? "disabledbtnEmail"
              : "addbtnEmail"
          }
          disabled={isReadOnly}
          onClick={addHandler}
          id="pmweb_print_document_add_button"
        >
          {t("add")}
        </button>
      </div>

      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table
          className={`${classes.table} ${
            props.isDrawerExpanded
              ? "webServicePropertiestableEx"
              : "webServicePropertiestableCo"
          } webServicePropertiestable`}
          style={{ width: props.isDrawerExpanded ? "70%" : "100%" }}
          aria-label="Documents table"
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
                {/* <span id="printcheck_checkbox" style={{display:"none"}}>{t("SelectAllDoc")} </span> */}
                <Checkbox
                  className="emailCheck"
                  checked={allChecked}
                  onChange={(e) => handleAllCheck(e)}
                  disabled={isReadOnly}
                  id="pmweb_print_printcheck_checkbox"
                  inputProps={{
                    "aria-label": t("SelectAllDocForPrint"),
                  }}
                  name="Print Checkbox"
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      handleAllCheck({
                        ...e,
                        target: {
                          ...e.target,
                          checked: !allChecked,
                        },
                      });
                    }
                  }}
                />
                {/* Added translation on 21-09-2023 for bugId: 136724*/}
                {t("print")}
                {/* till here  bugId: 136724 */}
              </StyledTableCell>

              <StyledTableCell
                className={classes.tableHeader}
                style={{ width: props.isDrawerExpanded ? "32vw" : "50%" }}
                width={props.isDrawerExpanded ? "32vw" : "50%"}
              >
                <Checkbox
                  className="emailCheck"
                  disabled
                  id="pmweb_print_emailcheck_checkbox"
                  inputProps={{
                    "aria-label": t("SelectAllDocCreateIfNotFoundForPrint"),
                  }}
                  tabIndex={0}
                  name="Create if not found"
                />
                {t("CreateIfNotFound")}
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody className="associatedTemplateDiv">
            {Object.keys(allData).map((el) => (
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
                  {/* <label htmlFor={`m_bPrint_checkbox_${el}`} style={{display:"none"}}>{allData[el].DocName}</label> */}
                  <Checkbox
                    className="emailCheck"
                    name="m_bPrint"
                    checked={checked[el]?.m_bPrint ? true : false}
                    onChange={(e) => CheckHandler(e, el)}
                    disabled={isReadOnly}
                    id={`pmweb_print_m_bPrint_checkbox_${el}`}
                    inputProps={{
                      "aria-label": allData[el]?.DocName,
                    }}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        CheckHandler(
                          {
                            ...e,
                            target: {
                              ...e.target,
                              checked: !checked[el]?.m_bPrint,
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
                  {/* <label htmlFor={`m_bCreateCheckbox_${el}`} style={{display:"none"}}>{allData[el].DocName}</label> */}
                  {/* code edited on 13 Jan 2023 for BugId 122384 */}
                  <Checkbox
                    className="emailCheck"
                    name="m_bCreateCheckbox"
                    disabled={
                      (allData[el].DocName !== t("status") &&
                        !templateDoc.includes(allData[el].DocName)) ||
                      isReadOnly
                        ? true
                        : !checked[el]?.m_bPrint || isReadOnly
                        ? true
                        : false
                    }
                    checked={
                      allData[el].DocName !== t("status") &&
                      !templateDoc.includes(allData[el].DocName)
                        ? false
                        : checked[el]?.m_bCreateCheckbox
                    }
                    onChange={(e) => CheckHandler(e, el)}
                    id={`pmweb_print_m_bCreateCheckbox_${el}`}
                    inputProps={{
                      "aria-label": allData[el]?.DocName,
                    }}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        CheckHandler(
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

export default connect(mapStateToProps, null)(Print);
