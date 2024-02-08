// #BugID - 122318
// #BugDescription - Design issue fixed for workdesk exception.
import React, { useState, useEffect } from "react";
import { store, useGlobalState } from "state-pool";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import "./index.css";
import axios from "axios";
import Tabs from "../../../../UI/Tab/Tab.js";
import Todo from "./Todo";
import Action from "./Action";
import Exception from "./Exception";
import Document from "./Document";
import Scan from "./Scan";
import {
  ENDPOINT_GET_PROCESS_FEATURES,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import Mobile from "./Mobile";
import Others from "./Others";
import Sap from "./Sap";
import TabsHeading from "../../../../UI/TabsHeading";
import { LatestVersionOfProcess } from "../../../../utility/abstarctView/checkLatestVersion";

function Workdesk(props) {
  let { t } = useTranslation();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData] = useGlobalState(
    loadedActivityPropertyData
  );
  const [bmobile, setbmobile] = useState(false);
  const [bSap, setbSap] = useState(false);
  const [bOther, setOther] = useState(false);
  const [globalCustomInterfaces, setGlobalCustomInterfaces] = useState([]);
  let isReadOnly =
    props.openTemplateFlag ||
    LatestVersionOfProcess(localLoadedProcessData?.Versions) !==
      +localLoadedProcessData?.VersionNo; // modified on 05/09/2023 for BugId 136103;

  useEffect(() => {
    // code edited on 16 May 2023 for BugId 127715
    if (localLoadedProcessData?.ProcessDefId)
      axios
        .get(
          SERVER_URL +
            `${ENDPOINT_GET_PROCESS_FEATURES}/${localLoadedProcessData?.ProcessDefId}/${localLoadedProcessData?.ProcessType}/S`
        )
        .then((res) => {
          if (res.status === 200) {
            let mobileSelected = false;
            let sapSelected = false;
            let othersIncluded = false;
            res.data.GlobalInterfaceData?.filter((d) => {
              if (d.InterfaceId == "9" && d.Included) {
                mobileSelected = true;
              }
              if (d.InterfaceId == "10" && d.Included) {
                sapSelected = true;
              }
              if (+d.InterfaceId > 12 && d.Included) {
                othersIncluded = true;
              }
            });
            let isMobileEnabled =
              localLoadedActivityPropertyData?.ActivityProperty
                ?.isMobileEnabled;
            let isSAPEnabled = localLoadedProcessData?.SAPRequired;

            if (mobileSelected && isMobileEnabled) {
              setbmobile(true);
            }
            if (sapSelected && isSAPEnabled) {
              setbSap(true);
            }
            setOther(othersIncluded);
            setGlobalCustomInterfaces(
              res.data.GlobalInterfaceData?.filter(
                (intf) => +intf.InterfaceId > 12 && intf.Included
              )
            );
          }
        });
  }, []);

  const getTabNames = () => {
    let arr = [
      t("todo"),
      t("actions"),
      t("exception(s)"),
      t("document"),
      t("scan"),
    ];
    if (bmobile) {
      arr.splice(arr?.length - 1, 0, t("mobile"));
    }
    if (bOther) {
      arr.splice(arr?.length - 1, 0, t("others"));
    }
    if (bSap) {
      arr.splice(arr?.length, 0, t("SAP"));
    }
    return arr;
  };

  const getTabElements = () => {
    let arr = [
      <Todo isReadOnly={isReadOnly} />,
      <Action isReadOnly={isReadOnly} />,
      <Exception isReadOnly={isReadOnly} />,
      <Document isReadOnly={isReadOnly} />,
      <Scan isReadOnly={isReadOnly} />,
    ];
    if (bmobile) {
      arr.splice(arr?.length - 1, 0, <Mobile isReadOnly={isReadOnly} />);
    }
    if (bOther) {
      arr.splice(
        arr?.length - 1,
        0,
        <Others
          allCustomInterfaces={globalCustomInterfaces}
          isReadOnly={isReadOnly}
        />
      );
    }
    if (bSap) {
      arr.splice(arr?.length, 0, <Sap isReadOnly={isReadOnly} />);
    }
    return arr;
  };

  return (
    <React.Fragment>
      <TabsHeading heading={props?.heading} />
      <Tabs
        tabType="processSubTab"
        tabContentStyle="processSubTabContentStyle"
        tabBarStyle="processSubTabBarStyle"
        oneTabStyle="processSubOneTabStyle"
        tabStyling="processViewTabs"
        tabsStyle="processViewSubTabs"
        // tabLength={!props?.isDrawerExpanded ? "tabLength" : ""}
        TabNames={
          localLoadedActivityPropertyData?.ActivityProperty?.actType == 11 &&
          localLoadedActivityPropertyData?.ActivityProperty?.actSubType == 1 //query
            ? bmobile
              ? [
                  t("todo"),
                  t("exception(s)"),
                  t("document"),
                  t("scan"),
                  t("mobile"),
                ]
              : [t("todo"), t("exception(s)"), t("document"), t("scan")]
            : (localLoadedActivityPropertyData?.ActivityProperty?.actType ==
                4 &&
                localLoadedActivityPropertyData?.ActivityProperty?.actSubType ==
                  1) ||
              (localLoadedActivityPropertyData?.ActivityProperty?.actType ==
                10 &&
                localLoadedActivityPropertyData?.ActivityProperty?.actSubType ==
                  7) //timer and robot workdesk
            ? [t("document"), t("scan")]
            : (localLoadedActivityPropertyData?.ActivityProperty?.actType ==
                2 &&
                localLoadedActivityPropertyData?.ActivityProperty?.actSubType ==
                  1) ||
              (localLoadedActivityPropertyData?.ActivityProperty?.actType ==
                3 &&
                localLoadedActivityPropertyData?.ActivityProperty?.actSubType ==
                  1) ||
              (localLoadedActivityPropertyData?.ActivityProperty?.actType ==
                2 &&
                localLoadedActivityPropertyData?.ActivityProperty?.actSubType ==
                  2) //endevent, terminate, mesageEnd
            ? [t("todo"), t("exception(s)"), t("document")]
            : getTabNames()
        }
        TabElement={
          localLoadedActivityPropertyData?.ActivityProperty?.actType == 11 &&
          localLoadedActivityPropertyData?.ActivityProperty?.actSubType == 1 //query
            ? bmobile
              ? [
                  <Todo isReadOnly={isReadOnly} />,
                  <Exception isReadOnly={isReadOnly} />,
                  <Document isReadOnly={isReadOnly} />,
                  <Scan isReadOnly={isReadOnly} />,
                  <Mobile isReadOnly={isReadOnly} />,
                ]
              : [
                  <Todo isReadOnly={isReadOnly} />,
                  <Exception isReadOnly={isReadOnly} />,
                  <Document isReadOnly={isReadOnly} />,
                  <Scan isReadOnly={isReadOnly} />,
                ]
            : (localLoadedActivityPropertyData?.ActivityProperty?.actType ==
                4 &&
                localLoadedActivityPropertyData?.ActivityProperty?.actSubType ==
                  1) ||
              (localLoadedActivityPropertyData?.ActivityProperty?.actType ==
                10 &&
                localLoadedActivityPropertyData?.ActivityProperty?.actSubType ==
                  7) //timer and robot workdesk
            ? [
                <Document isReadOnly={isReadOnly} />,
                <Scan isReadOnly={isReadOnly} />,
              ]
            : (localLoadedActivityPropertyData?.ActivityProperty?.actType ==
                2 &&
                localLoadedActivityPropertyData?.ActivityProperty?.actSubType ==
                  1) ||
              (localLoadedActivityPropertyData?.ActivityProperty?.actType ==
                3 &&
                localLoadedActivityPropertyData?.ActivityProperty?.actSubType ==
                  1) ||
              (localLoadedActivityPropertyData?.ActivityProperty?.actType ==
                2 &&
                localLoadedActivityPropertyData?.ActivityProperty?.actSubType ==
                  2) //endevent, terminate, mesageEnd
            ? [
                <Todo isReadOnly={isReadOnly} />,
                <Exception isReadOnly={isReadOnly} />,
                <Document isReadOnly={isReadOnly} />,
              ]
            : getTabElements()
        }
      />
    </React.Fragment>
  );
}

const mapStateToProps = (state) => {
  return {
    showDrawer: state.showDrawerReducer.showDrawer,
    cellID: state.selectedCellReducer.selectedId,
    cellName: state.selectedCellReducer.selectedName,
    cellType: state.selectedCellReducer.selectedType,
    cellActivityType: state.selectedCellReducer.selectedActivityType,
    cellActivitySubType: state.selectedCellReducer.selectedActivitySubType,
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
    isDrawerExpanded: state.isDrawerExpanded.isDrawerExpanded,
    openTemplateFlag: state.openTemplateReducer.openFlag,
  };
};

export default connect(mapStateToProps, null)(Workdesk);
