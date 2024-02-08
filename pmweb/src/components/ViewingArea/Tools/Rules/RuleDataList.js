// Changes made to solve Bug 105828 - IBPS 6.0 - > ToDo list bugs
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "../../../ProcessSettings/Trigger/Properties/properties.module.css";
import arabicStyles from "../../../ProcessSettings/Trigger/Properties/propertiesArabicStyles.module.css";
import SearchBox from "../../../../UI/Search Component/index";
import { RTL_DIRECTION } from "../../../../Constants/appConstants";
import RuleDataTable from "./RuleDataTable";
import { useMediaQuery } from "@material-ui/core";

function RuleDataList(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const { calledFrom } = props;
  const [variableList, setVariableList] = useState("");
  const [addedVariableList, setAddedVariableList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredRows, setFilteredRows] = useState([]);
  const [searchRule, setSearchRule] = useState("");
  const smallScreen = useMediaQuery("(max-width: 799px)");
  let array = [];
  props?.ruleDataType?.map((obj, index) => {
    array.push(obj.Name);
  });

  useEffect(() => {
    setFilteredRows(
      array.filter((row) => {
        if (searchTerm == "") {
          return row;
        } else if (row.toLowerCase().includes(searchTerm.toLowerCase())) {
          return row;
        }
      })
    );
    let listArray = [];
    props?.ruleDataType &&
      props?.ruleDataType.filter((el) => {
        filteredRows.map((val) => {
          if (val == el.Name) {
            listArray.push(el);
          }
        });
      });
  }, [searchTerm]);

  useEffect(() => {
    setVariableList(props?.ruleDataType);
  }, []);

  useEffect(() => {
    let localArray = [];
    let addArray = [];
    let restArray = [];
    props.rules?.ruleOpList.forEach((el) => {
      localArray.push(el.interfaceId);
    });
    props?.ruleDataType?.forEach((el) => {
      if (localArray.includes(el.NameId)) {
        addArray.push(el);
      } else {
        restArray.push(el);
      }
    });
    setVariableList(restArray);
    setAddedVariableList(addArray);
  }, [props.rules]);

  const addAllVariable = () => {
    setAddedVariableList((prev) => {
      let newData = [...prev];
      variableList.forEach((data) => {
        newData.push(data);
      });
      return newData;
    });
    setVariableList([]);
  };

  const addOneVariable = (variable) => {
    setAddedVariableList((prev) => {
      return [...prev, variable];
    });
    setVariableList((prev) => {
      let prevData = [...prev];
      return prevData.filter((data) => {
        if (data.Name !== variable.Name) {
          return data;
        }
      });
    });
  };

  const removeAllVariable = () => {
    setVariableList((prev) => {
      let newData = [...prev];
      addedVariableList.forEach((data) => {
        newData.push(data);
      });
      return newData;
    });
    setAddedVariableList([]);
  };

  const removeOneVariable = (variable) => {
    setVariableList((prev) => {
      return [...prev, variable];
    });
    setAddedVariableList((prevContent) => {
      let prevData = [...prevContent];
      return prevData.filter((dataContent) => {
        if (dataContent.Name !== variable.Name) {
          return dataContent;
        }
      });
    });
  };

  props.selectedVariableList(addedVariableList);

  let filteredRules =
    addedVariableList &&
    addedVariableList.filter((docType) => {
      if (searchRule.trim() == "") {
        return;
      } else if (
        docType.Name.toLowerCase().includes(searchRule.toLowerCase())
      ) {
        return docType;
      }
    });

  let filteredRulesComplete =
    variableList &&
    variableList.filter((docType) => {
      if (searchTerm.trim() == "") {
        return;
      } else if (
        docType.Name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return docType;
      }
    });

  return (
    <div
      className={styles.propertiesMainView}
      style={{
        // Changes on 07-09-2023 to resolve the issue serch box goes out from screen issue found by resolving the bug Id 135572
        //modified on 26/9/2023 for bug_id: 134046
        // width: calledFrom === "variable" ? "50%" : "72vw",
        width: calledFrom === "variable" ? "50%" : null,
        display: "flex",
        flexDirection: smallScreen ? "column" : "row",
        // till here
      }}
    >
      <div
        className={
          direction === RTL_DIRECTION
            ? `${arabicStyles.triggerNameTypeDiv} flex1`
            : `${styles.triggerNameTypeDiv} flex1`
        }
        style={{
          marginInlineEnd: smallScreen ? "unset" : "2vw",
          marginBottom: smallScreen ? "1rem" : null,
        }}
      >
        <div
          className={`${styles.mb025} flex`}
          style={{ marginBottom: "0.85rem" }}
        >
          <div className="flex flex1">
            <p className={`${styles.dataEntryHeading} ${styles.mr05} flex4`}>
              {props.ruleDataTableHeading}
            </p>
            {calledFrom !== "variable" ? (
              <div
              // className="flex2"
              >
                <SearchBox
                  width="100%"
                  //  height="1.5rem"
                  setSearchTerm={setSearchRule}
                  title={"pmweb_RuleDataList"}
                  ariaDescription={props.ruleDataTableHeading}
                />
              </div>
            ) : null}
            {/*code updated on 20 September 2022 for BugId 111160*/}
            {/* <button className={`${styles.filterTriggerButton} flex05`}>
              <img src={filter} alt="" />
            </button> */}
          </div>
        </div>
        {/* Changes made to solve Bug 116649 */}
        <RuleDataTable
          tableType="remove"
          tableContent={searchRule === "" ? addedVariableList : filteredRules}
          singleEntityClickFunc={removeOneVariable}
          headerEntityClickFunc={removeAllVariable}
          onKeyheaderEntityClickFunc={(e) => {
            if (e.key === "Enter") {
              removeAllVariable();
              e.stopPropagation();
            }
          }}
          ruleDataTableStatement={props.addRuleDataTableStatement}
          openProcessType={props.openProcessType}
          hideGroup={props.hideGroup}
          filteredRows={filteredRows}
          searchTerm={searchRule}
          calledFrom={calledFrom}
        />
      </div>

      {calledFrom !== "variable" ? (
        <div className="flex1">
          <div className={`flex ${styles.dataEntrySelectDiv}`}>
            <p className={`${styles.dataEntryHeading} ${styles.mr05} flex4`}>
              {props.addRuleDataTableHeading}
            </p>
            <div className="flex2">
              <SearchBox
                width="100%"
                // height="1.5rem"
                setSearchTerm={setSearchTerm}
                title={"pmweb_ruleDataList"}
                ariaDescription={props.addRuleDataTableHeading}
              />
            </div>
            {/*code updated on 20 September 2022 for BugId 111160*/}
            {/* <button className={`${styles.filterTriggerButton} flex05`}>
            <img src={filter} alt="" />
          </button> */}
          </div>

          <RuleDataTable
            tableType="add"
            tableContent={
              searchTerm === "" ? variableList : filteredRulesComplete
            }
            singleEntityClickFunc={addOneVariable}
            headerEntityClickFunc={addAllVariable}
            onKeyheaderEntityClickFunc={(e) => {
              if (e.key === "Enter") {
                addAllVariable();
                e.stopPropagation();
              }
            }}
            ruleDataTableStatement={props.ruleDataTableStatement}
            openProcessType={props.openProcessType}
            hideGroup={props.hideGroup}
            searchTerm={searchTerm}
            calledFrom={calledFrom}
          />
        </div>
      ) : null}
    </div>
  );
}

export default RuleDataList;
