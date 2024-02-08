import React, { useState, useEffect } from "react";
import {
  OPTION_USER_DEFINED,
  OPTION_SYSTEM_DEFINED,
  SERVER_URL,
  SYSTEM_DEFINED_SCOPE,
  USER_DEFINED_SCOPE,
  GLOBAL_SCOPE,
  DEFAULT_GLOBAL_ID,
  RTL_DIRECTION,
  ENDPOINT_GET_WEBSERVICE,
  APP_HEADER_HEIGHT,
} from "../../../Constants/appConstants";
import { Accordion, AccordionDetails, Divider } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { AccordionSummaryStyled } from "../../../UI/AccordionSummaryStyled";
import SystemDefined from "./SystemDefined";
import "./common.css";
import styles from "./index.module.css";
import arabicStyles from "./arabicStyles.module.css";
import UserDefined from "./UserDefined";
import { connect, useSelector } from "react-redux";
import axios from "axios";
import CircularProgress from "@material-ui/core/CircularProgress";
import { store, useGlobalState } from "state-pool";

function ExternalMethods(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  const [methodCount, setMethodCount] = useState({});
  const [methodList, setMethodList] = useState([]);
  const [expanded, setExpanded] = useState(2);
  const [userDefinedExpanded, setUserDefinedExpanded] = useState(false);
  const [primaryInputStrip, setPrimaryInputStrip] = useState(false);
  const [spinner, setSpinner] = useState(true);
  const [maxMethodCount, setMaxMethodCount] = useState(0);
  const { isReadOnly } = props;
  // changes added for bug_id: 134226
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  useEffect(() => {
    if (
      (props.scope !== GLOBAL_SCOPE && localLoadedProcessData?.ProcessDefId) ||
      props.scope === GLOBAL_SCOPE
    ) {
      //code edited on 16 June 2022 for BugId 110949
      axios
        .get(
          SERVER_URL +
            ENDPOINT_GET_WEBSERVICE +
            `${
              props.scope === GLOBAL_SCOPE
                ? DEFAULT_GLOBAL_ID
                : localLoadedProcessData?.ProcessDefId
            }`
        )
        .then((res) => {
          if (res.data.Status === 0) {
            setMethodList(res.data.Methods.Catalog);
            setMaxMethodCount(res.data.Methods.MaxExtFuncGlblMethodIndex);
            setSpinner(false);
          } else {
            setSpinner(false);
          }
        });
    }
  }, [localLoadedProcessData?.ProcessDefId]);

  useEffect(() => {
    setSpinner(true);
  }, [localLoadedProcessData?.ProcessDefId]);

  useEffect(() => {
    let systemDefinedCount = methodList?.filter(
      (e) => e.AppType === SYSTEM_DEFINED_SCOPE
    ).length;
    let userDefinedCount = methodList?.filter(
      (e) => e.AppType === USER_DEFINED_SCOPE
    ).length;
    setMethodCount({
      systemDefinedCount: systemDefinedCount,
      userDefinedCount: userDefinedCount,
    });
  }, [methodList]);

  //Bug 121789 - Setting Page: Service Catalog-Catalog issues
  //[23-03-2023] On AddClick -> In case the ExternalMethod was expanded, the userDefined Accordion won't expand.
  // Function that handles change for accordion.
  const handleChange = (panel) => (event, newExpanded) => {
    if (panel === OPTION_USER_DEFINED) {
      setUserDefinedExpanded(newExpanded);
    } else {
      setExpanded(newExpanded);
    }
    // setExpanded(newExpanded ? panel : false);
    // if (expanded === OPTION_USER_DEFINED && primaryInputStrip === true) {
    //   setPrimaryInputStrip(false);
    // }
  };

  //Bug 121789 - Setting Page: Service Catalog-Catalog issues
  //[23-03-2023] On AddClick -> UserDefined Accordion was getting collapsed
  // Function that calls when the user clicks the add button for the primary business variables.
  const handleAddPrimary = (event) => {
    setPrimaryInputStrip(!primaryInputStrip);
    if (!userDefinedExpanded) {
      setUserDefinedExpanded(true);
    } else {
      event.stopPropagation();
    }
    // if (expanded === OPTION_USER_DEFINED) {
    //   setPrimaryInputStrip(!primaryInputStrip);
    //   event.stopPropagation();
    // } else {
    //   setPrimaryInputStrip(true);
    // }
  };

  return spinner ? (
    <CircularProgress
      style={
        direction === RTL_DIRECTION
          ? { marginTop: "30vh", marginRight: "50%" }
          : { marginTop: "30vh", marginLeft: "50%" }
      }
    />
  ) : (
    <div
      className={styles.mainDiv}
      style={{
        padding: props.scope === GLOBAL_SCOPE ? "0" : "0.5rem 1rem",
        // changes added for bug_id: 134226
        height: `calc(${windowInnerHeight}px - ${APP_HEADER_HEIGHT} - 11.125rem)`,
        overflowY: "auto",
      }}
    >
      <p
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.businessVariableHeading
            : styles.businessVariableHeading
        }
      >
        {t("external")} {t("Methods")}
      </p>
      {
        //code added on 20 Feb 2023 for BugId 121789
      }
      <Accordion
        id="externalMethods_first_accordion"
        className="external_method_accordion"
        // expanded={expanded === OPTION_USER_DEFINED}
        onChange={handleChange(OPTION_USER_DEFINED)}
      >
        <AccordionSummaryStyled>
          <div className={styles.accordianHeadingDiv}>
            <span
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.accordionHeader
                  : styles.accordionHeader
              }
            >
              {t("userDefined")}
            </span>
            <span
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.accordianHeaderCount
                  : styles.accordianHeaderCount
              }
            >{`(${methodCount.userDefinedCount})`}</span>
            <Divider
              className={
                primaryInputStrip
                  ? direction === RTL_DIRECTION
                    ? arabicStyles.accordianHeaderDividerUD_noAdd
                    : styles.accordianHeaderDividerUD_noAdd
                  : direction === RTL_DIRECTION
                  ? arabicStyles.accordianHeaderDividerUD
                  : styles.accordianHeaderDividerUD
              }
            />
            {!isReadOnly && !primaryInputStrip ? (
              <p
                id="pmweb_externalMethods_addVariable_button"
                className={
                  direction === RTL_DIRECTION
                    ? arabicStyles.accordionHeaderButton
                    : styles.accordionHeaderButton
                }
                onClick={handleAddPrimary}
                tabIndex={0}
                // onKeyUp={(e)=>{
                //   if(e.key === "Enter"){
                //     handleAddPrimary(e)
                //     e.stopPropagation();
                //   }
                // }}
              >
                {t("addDataObject").toUpperCase()}
              </p>
            ) : null}
          </div>
        </AccordionSummaryStyled>
        <AccordionDetails>
          <UserDefined
            methodList={methodList}
            primaryInputStrip={primaryInputStrip}
            setPrimaryInputStrip={setPrimaryInputStrip}
            setMethodList={setMethodList}
            //code added on 16 June 2022 for BugId 110949
            maxMethodCount={maxMethodCount}
            setMaxMethodCount={setMaxMethodCount}
            scope={props.scope}
            isReadOnly={isReadOnly}
          />
        </AccordionDetails>
      </Accordion>
      <Accordion
        id="pmweb_externalMethods_second_accordion"
        className="external_method_accordion"
        //expanded={expanded === OPTION_SYSTEM_DEFINED}
        onChange={handleChange(OPTION_SYSTEM_DEFINED)}
      >
        <AccordionSummaryStyled>
          <div className={styles.accordianHeadingDiv}>
            <span
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.accordionHeader
                  : styles.accordionHeader
              }
            >
              {t("system")}
            </span>
            <span
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.accordianHeaderCount
                  : styles.accordianHeaderCount
              }
            >{`(${methodCount.systemDefinedCount})`}</span>
            <Divider
              className={
                direction === RTL_DIRECTION
                  ? arabicStyles.accordianHeaderDividerSD
                  : styles.accordianHeaderDividerSD
              }
            />
          </div>
        </AccordionSummaryStyled>
        <AccordionDetails>
          <SystemDefined methodList={methodList} />
        </AccordionDetails>
      </Accordion>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps)(ExternalMethods);
