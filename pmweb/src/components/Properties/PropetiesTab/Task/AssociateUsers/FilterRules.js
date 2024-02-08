import React, { useState, useEffect } from "react";
import styles from "./index.module.css";
import { useTranslation } from "react-i18next";
import {
  COMPLEX_VARTYPE,
  CONSTANT,
  RTL_DIRECTION,
  SPACE,
} from "../../../../../Constants/appConstants";
import { store, useGlobalState } from "state-pool";
import {
  ConditionalOperator,
  getLogicalOperatorReverse,
  getVarDetails,
} from "../../../../../utility/CommonFunctionCall/CommonFunctionCall";
import CustomizedDropdown from "../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { Grid, MenuItem } from "@material-ui/core";
import { DeleteOutline } from "@material-ui/icons";
import { getConditionalOperator } from "../../ActivityRules/CommonFunctionCall";
import { LightTooltip } from "../../../../../UI/StyledTooltip";
import { setToastDataFunc } from "../../../../../redux-store/slices/ToastDataHandlerSlice";
import { useDispatch } from "react-redux";
import { convertToArabicDate } from "../../../../../UI/DatePicker/DateInternalization";

function FilterRules(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const parameter1dropdown = localLoadedProcessData?.Variable.filter(
    (d) => d.VariableType !== COMPLEX_VARTYPE
  );
  const [filterList, setFilterList] = useState(null);
  const blankObjectFilter = {
    type2: "M",
    extObjID1: "0",
    extObjID2: "0",
    variableId_1: "0",
    variableId_2: "0",
    type1: "M",
    param1: "",
    operator: "",
    param2: "",
    varFieldId_1: "0",
    varFieldId_2: "0",
    logicalOp: "3",
    datatype1: "",
  };

  useEffect(() => {
    if (props.filterData && props.filterData?.length > 0) {
      setFilterList([...props?.filterData]);
    } else {
      let ConOrderID = { condOrderId: 1 + "" };
      let newRow = { ...ConOrderID, ...blankObjectFilter };
      setFilterList([newRow]);
    }
  }, [props.filterData]);

  // function to get variable type depending on field value of filter row.
  const getVarType = (data) => {
    let varDetail = getVarDetails(parameter1dropdown, data.param1);
    let varType = varDetail?.VariableType;
    return varType;
  };

  // function to get conditional operator list depending on variable type value of filter row.
  const getConditionalOperatorList = (data) => {
    let varDetail = getVarDetails(parameter1dropdown, data.param1);
    let varType = varDetail?.VariableType;
    if (
      +varType === 10 ||
      +varType === 12 ||
      +varType === 3 ||
      +varType === 4 ||
      +varType === 6 ||
      +varType === 8 ||
      +varType === 15
    ) {
      let localArr = ConditionalOperator?.filter((val) =>
        val.type?.includes(+varType)
      );
      return localArr;
    } else {
      return [];
    }
  };

  // function to get value options list depending on variable type value of filter row.
  const getParam2Options = (data) => {
    if (+data.operator === 9 || +data.operator === 10) {
      return [];
    }
    let varDetail = getVarDetails(parameter1dropdown, data.param1);
    let varType = varDetail?.VariableType;
    let parameter2 = parameter1dropdown?.filter(
      (d) => d.VariableType !== COMPLEX_VARTYPE && d.VariableType === varType
    );
    return parameter2;
  };

  const onSelectParam1 = (e, index) => {
    // code edited on 25 Aug 2023 for BugId 134645 - Calendar not showing in filter for data variable.
    let data = [...filterList];
    data[index].param1 = e.target.value;
    let varDetail = getVarDetails(parameter1dropdown, e.target.value);
    data[index].variableId_1 = varDetail?.VariableId;
    data[index].varFieldId_1 = varDetail?.VarFieldId;
    data[index].extObjID1 = varDetail?.ExtObjectId;
    data[index].type1 = varDetail?.VariableScope;
    data[index].datatype1 = varDetail?.VariableType;
    setFilterList(data);
    if (data[index].param2 !== "" && data[index].param2 !== CONSTANT) {
      buildRuleStatement();
    }
  };

  const onSelectOperator = (e, index) => {
    let data = [...filterList];
    data[index].operator = e.target.value;
    setFilterList(filterList);
    // code edited on 25 Aug 2023 for BugId 134645 - Calendar not showing in filter for data variable.
    if (
      +e.target.value === 9 ||
      +e.target.value === 10 ||
      (data[index].param2 !== "" &&
        data[index].param2 !== CONSTANT &&
        +e.target.value !== 9 &&
        +e.target.value !== 10)
    ) {
      buildRuleStatement();
    }
  };

  //Added on 22/09/2023, bug_id:138043
  const validateCondition = (str) => {
    var regex = new RegExp("[&'<>\\\\]+");

    return !regex.test(str);
  };

  //till here for bug id 138043

  const onSelectCondition = (e, constStatus, index) => {
    // code edited on 25 Aug 2023 for BugId 134645 - Calendar not showing in filter for data variable.
    let data = [...filterList];
    data[index].param2 = e.target.value;
    if (constStatus) {
      data[index].variableId_2 = "0";
      data[index].varFieldId_2 = "0";
      data[index].extObjID2 = "0";
      data[index].type2 = "C";
    } else {
      let varDetail = getVarDetails(parameter1dropdown, e.target.value);
      data[index].variableId_2 = varDetail?.VariableId;
      data[index].varFieldId_2 = varDetail?.VarFieldId;
      data[index].extObjID2 = varDetail?.ExtObjectId;
      data[index].type2 = varDetail?.VariableScope;
    }
    setFilterList(data);
    if (e.target.value !== CONSTANT) {
      buildRuleStatement();
    }
  };

  const newRow = (val, index) => {
    if (index === filterList.length - 1) {
      let maxId = 0;
      filterList?.forEach((element) => {
        if (element.condOrderId > maxId) {
          maxId = element.condOrderId;
        }
      });
      let ConOrderID = { condOrderId: +maxId + 1 + "" };
      let newRow = { ...ConOrderID, ...blankObjectFilter };
      setFilterList([...filterList, newRow]);
    }
  };

  const onSelectLogicalOperator = (e, index) => {
    let data = [...filterList];
    data[index].logicalOp = e.target.value;
    setFilterList(data);
    newRow("+", index);
  };

  const deleteRow = (index) => {
    let tempData = JSON.parse(JSON.stringify(filterList));
    tempData.splice(index, 1);
    setFilterList(tempData);
  };

  const buildRuleStatement = () => {
    let ruleStatement = "";
    let tempList = [...filterList];
    tempList?.forEach((element, i) => {
      if (
        element.param1 !== "" &&
        element.operator !== "" &&
        element.param2 !== "" &&
        element.param2 !== CONSTANT
      ) {
        const concatenatedString = ruleStatement.concat(
          SPACE,
          element.param1,
          SPACE,
          "is",
          SPACE,
          getConditionalOperator(element.operator),
          SPACE,
          // modified on 27/09/2023 for BugId 136677
          // element.param2,
          (element.datatype1 === "8" || element.datatype1 === "15") &&
            element.type2 === "C"
            ? convertToArabicDate(element.param2)
            : element.param2,
          // till here BugId 136677
          SPACE,
          element.logicalOp === "+" || element.logicalOp === "3"
            ? ""
            : getLogicalOperatorReverse(element.logicalOp)
        );
        ruleStatement = concatenatedString;
      }
    });
    props?.setCritireaSatatement(ruleStatement);
    filterList?.forEach((data, i) => {
      if (data.logicalOp === "+") {
        data.logicalOp = "3";
      }
    });
    props?.changeFilterData(filterList);
  };

  return (
    <>
      <Grid container xs={12} style={{ gap: "1vw" }}>
        <Grid item xs={3}>
          <p
            className={
              direction === RTL_DIRECTION
                ? styles.operationsLabelRTL
                : styles.operationsLabel
            }
          >
            {t("fields")}
          </p>
        </Grid>
        <Grid item xs={2}>
          <p
            className={
              direction === RTL_DIRECTION
                ? styles.operationsLabelRTL
                : styles.operationsLabel
            }
          >
            {t("operator")}
          </p>
        </Grid>
        <Grid item xs={3}>
          <p
            className={
              direction === RTL_DIRECTION
                ? styles.operationsLabelRTL
                : styles.operationsLabel
            }
          >
            {t("value")}
          </p>
        </Grid>
        <Grid item xs={2}>
          <p
            className={
              direction === RTL_DIRECTION
                ? styles.operationsLabelRTL
                : styles.operationsLabel
            }
          ></p>
        </Grid>
        <Grid item xs={1}></Grid>
      </Grid>
      {filterList?.length > 0 &&
        filterList?.map((data, i) => {
          return (
            <Grid
              container
              xs={12}
              style={{ gap: "1vw", marginBottom: "0.5rem" }}
            >
              <Grid item xs={3}>
                <CustomizedDropdown
                  id={`pmweb_FilterRules_filterlist_dropdown${i}`}
                  className={styles.dataDropdown}
                  value={data?.param1}
                  style={{
                    width: "100%",
                    border: "1px solid #c4c4c4",
                  }}
                  onChange={(e) => onSelectParam1(e, i)}
                  menuItemStyles={styles.menuItemStyles}
                >
                  {parameter1dropdown
                    ?.filter((element) => element.VariableScope !== "C")
                    ?.map((element) => {
                      return (
                        <MenuItem
                          className={styles.menuItemStyles}
                          key={element.VariableName}
                          value={element.VariableName}
                          style={{ direction: direction }}
                        >
                          {element.VariableName}
                        </MenuItem>
                      );
                    })}
                </CustomizedDropdown>
              </Grid>
              <Grid item xs={2}>
                <CustomizedDropdown
                  id={`pmweb_FilterRules_ruleConditionalDropdown_dropdown${i}`}
                  className={styles.dataDropdown}
                  style={{
                    width: "100%",
                    border: "1px solid #c4c4c4",
                  }}
                  value={data?.operator}
                  onChange={(e) => {
                    onSelectOperator(e, i);
                  }}
                  menuItemStyles={styles.menuItemStyles}
                >
                  {getConditionalOperatorList(data)?.map((element) => {
                    return (
                      <MenuItem
                        className={styles.menuItemStyles}
                        key={element.value}
                        value={element.value}
                        style={{ direction: direction }}
                      >
                        {element.label.toLocaleUpperCase()}
                      </MenuItem>
                    );
                  })}
                </CustomizedDropdown>
              </Grid>
              <Grid item xs={3}>
                <CustomizedDropdown
                  id={`pmweb_FilterRules_ruleParam2Dropdown_dropdown${i}`}
                  className={styles.dataDropdown}
                  name="selected_operator"
                  style={{
                    width: "100%",
                    border: "1px solid #c4c4c4",
                  }}
                  value={data?.param2}
                  // code edited on 25 Aug 2023 for BugId 134645
                  onChange={(e, isConstant) => {
                    onSelectCondition(e, isConstant, i);
                  }}
                  disabled={+data?.operator === 9 || +data?.operator === 10}
                  isConstant={data?.type2 === "C"}
                  // code edited on 25 Aug 2023 for BugId 134645
                  constType={getVarType(data)}
                  menuItemStyles={styles.menuItemStyles}
                  showConstValue={true}
                  //Added on 22/09/2023, bug_id:138043
                  validateConstField={(e) => {
                    if (!validateCondition(e.target.value)) {
                      dispatch(
                        setToastDataFunc({
                          message: `${t("value")}${SPACE}${t(
                            "cannotContain"
                          )}${SPACE}&<>\\'${SPACE}${t("charactersInIt")}`,
                          severity: "error",
                          open: true,
                        })
                      );
                      return false;
                    }
                    return true;
                  }}
                  //till here for bug id 138043
                >
                  {getParam2Options(data)?.map((element) => {
                    return (
                      <MenuItem
                        className={styles.menuItemStyles}
                        key={element.VariableName}
                        value={element.VariableName}
                        style={{ direction: direction }}
                      >
                        {element.VariableName}
                      </MenuItem>
                    );
                  })}
                </CustomizedDropdown>
              </Grid>
              <Grid item xs={2}>
                <CustomizedDropdown
                  id={`pmweb_FilterRules_logicalOperator_dropdown${i}`}
                  className={styles.dataDropdown}
                  style={{
                    width: "100%",
                    border: "1px solid #c4c4c4",
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
                  }}
                  onChange={(e) => onSelectLogicalOperator(e, i)}
                  value={data.logicalOp}
                >
                  <MenuItem
                    className={styles.menuItemStyles}
                    style={{ direction: direction }}
                    value="2"
                  >
                    OR
                  </MenuItem>
                  <MenuItem
                    className={styles.menuItemStyles}
                    style={{ direction: direction }}
                    value="1"
                  >
                    AND
                  </MenuItem>
                </CustomizedDropdown>
              </Grid>
              <Grid item xs={1}>
                {filterList.length - 1 !== i ? (
                  <LightTooltip
                    arrow={true}
                    enterDelay={500}
                    placement="bottom"
                    title={"Delete"}
                  >
                    <DeleteOutline
                      className={styles.deleteIcon}
                      onClick={() => {
                        deleteRow(i);
                      }}
                      id={`pmweb_FilterRules_deleteRuleRow_dropdown${i}`}
                    />
                  </LightTooltip>
                ) : null}
              </Grid>
            </Grid>
          );
        })}
    </>
  );
}

export default FilterRules;
