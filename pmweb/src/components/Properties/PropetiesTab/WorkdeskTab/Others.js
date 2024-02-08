import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./Others.module.css";
import { Checkbox, Grid } from "@material-ui/core";
import { store, useGlobalState } from "state-pool";
import { useDispatch, useSelector } from "react-redux";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import { propertiesLabel } from "../../../../Constants/appConstants";

function Others(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const dispatch = useDispatch();
  const isDrawerExpanded = useSelector(
    (state) => state.isDrawerExpanded.isDrawerExpanded
  );
  const { allCustomInterfaces, isReadOnly } = props;

  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const loadedActivityPropertyData = store.getState("activityPropertyData");
  const [localLoadedActivityPropertyData, setlocalLoadedActivityPropertyData] =
    useGlobalState(loadedActivityPropertyData);

  const handleChange = (e, interfaceId) => {
    const { name, value, checked } = e.target;

    const newPropData = { ...localLoadedActivityPropertyData };
    let newArrInterfaceList = [
      ...localLoadedActivityPropertyData.ActivityProperty.m_objPMCustomInterface
        .m_arrInterfaceList,
    ];

    if (interfaceId) {
      const changedInterfaceObj = newArrInterfaceList.find(
        (intf) => intf.intefaceDefInfo?.interfaceId === interfaceId
      );
      if (changedInterfaceObj) {
        const index = newArrInterfaceList.findIndex(
          (intf) => intf.intefaceDefInfo?.interfaceId === interfaceId
        );
        if (name === "showAlways") {
          changedInterfaceObj.intefaceDefInfo["m_bshowalways"] = checked;
          newArrInterfaceList.splice(index, 1, changedInterfaceObj);
        } else if (name === "isIncluded") {
          //changedInterfaceObj.isIncluded = checked;
          newArrInterfaceList.splice(index, 1);
        }
      } else {
        const newObjDetails = allCustomInterfaces.find(
          (intf) => intf.InterfaceId === interfaceId
        );

        const newObj = {
          intefaceDefInfo: {
            executeClass: newObjDetails?.ExecuteClass || "",
            m_bCustomInterface: false,
            buttonName: newObjDetails?.ButtonName || "",
            clientInvocation: newObjDetails?.ClientInvocation,
            executeClassWeb: newObjDetails?.ExecuteClassWeb,
            m_bshowalways: name === "showAlways" ? checked : false,
            menuName: newObjDetails?.MenuName || "",
            m_bEnableShowAlways: false,
            interfaceId: `${interfaceId}`,
            interfaceName: newObjDetails?.WindowName || "",
            status: "I",
            tableName: "",
          },
          isIncluded: false,
        };
        newArrInterfaceList.push(newObj);
      }
    }
    newPropData.ActivityProperty.m_objPMCustomInterface.m_ballCustomInterface = false;
    if (name === "AllCustomInterface") {
      newPropData.ActivityProperty.m_objPMCustomInterface.m_ballCustomInterface =
        checked;
      if (checked) {
        newArrInterfaceList = allCustomInterfaces.map((newObjDetails) => {
          const newObj = {
            intefaceDefInfo: {
              executeClass: newObjDetails?.ExecuteClass || "",
              m_bCustomInterface: false,
              buttonName: newObjDetails?.ButtonName || "",
              clientInvocation: newObjDetails?.ClientInvocation,
              executeClassWeb: newObjDetails?.ExecuteClassWeb,
              m_bshowalways: isChecked("showAlways", newObjDetails.InterfaceId),
              menuName: newObjDetails?.MenuName || "",
              m_bEnableShowAlways: false,
              interfaceId: newObjDetails.InterfaceId,
              interfaceName: newObjDetails?.WindowName || "",
              status: "I",
              tableName: "",
            },
            isIncluded: false,
          };
          return newObj;
        });
      }
    }

    newPropData.ActivityProperty.m_objPMCustomInterface.m_arrInterfaceList = [
      ...newArrInterfaceList,
    ];
    setlocalLoadedActivityPropertyData(newPropData);
    dispatch(
      setActivityPropertyChange({
        [propertiesLabel.workdesk]: { isModified: true, hasError: false },
      })
    );
  };

  const isChecked = (name, interfaceId) => {
    let newArrInterfaceList = [
      ...localLoadedActivityPropertyData.ActivityProperty.m_objPMCustomInterface
        .m_arrInterfaceList,
    ];

    const changedInterfaceObj = newArrInterfaceList.find(
      (intf) => intf.intefaceDefInfo?.interfaceId === interfaceId
    );

    if (changedInterfaceObj) {
      if (name === "showAlways") {
        return changedInterfaceObj.intefaceDefInfo["m_bshowalways"];
      } else if (name === "isIncluded") {
        return true;
      }
    }
    return false;
  };
  return (
    <div style={{ padding: "20px" }}>
      <Grid container spacing={1}>
        <Grid item container xs={isDrawerExpanded ? 3 : 8} alignItems="center">
          <Grid item style={{ marginLeft: "-4px" }}>
            <Checkbox
              name="AllCustomInterface"
              value={
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.m_objPMCustomInterface?.m_ballCustomInterface
              }
              checked={
                localLoadedActivityPropertyData?.ActivityProperty
                  ?.m_objPMCustomInterface?.m_ballCustomInterface
              }
              onChange={(e) => handleChange(e)}
              isReadOnly={isReadOnly}
            />
          </Grid>

          <Grid item>
            <p className={styles.commonInterface}>{t("customInterface")}</p>
          </Grid>
        </Grid>
        <Grid item>
          <p className={styles.checkBoxShowAlways}>{t("showAlways")}</p>
        </Grid>
      </Grid>

      <Grid container direction="column" spacing={1}>
        {allCustomInterfaces.map((interfaceObj, index) => (
          <Grid container spacing={1}>
            <Grid
              item
              container
              xs={isDrawerExpanded ? 3 : 8}
              alignItems="center"
            >
              <Grid item>
                <Checkbox
                  name={`isIncluded`}
                  //  checked={interfaceObj.isIncluded}
                  //value={interfaceObj.isIncluded}
                  checked={isChecked("isIncluded", interfaceObj.InterfaceId)}
                  value={isChecked("isIncluded", interfaceObj.InterfaceId)}
                  onChange={(e) => handleChange(e, interfaceObj.InterfaceId)}
                  disabled={isReadOnly}
                />
              </Grid>
              <Grid item>
                <p className={styles.commonInterfaceTableRow}>
                  {interfaceObj?.WindowName}
                </p>
              </Grid>
            </Grid>
            <Grid item>
              <Checkbox
                name={`showAlways`}
                // checked={interfaceObj.m_bshowalways}
                //value={interfaceObj.m_bshowalways}
                checked={isChecked("showAlways", interfaceObj.InterfaceId)}
                value={isChecked("showAlways", interfaceObj.InterfaceId)}
                onChange={(e) => handleChange(e, interfaceObj.InterfaceId)}
                disabled={isReadOnly}
              />
            </Grid>
          </Grid>
        ))}
      </Grid>
    </div>
  );
}

export default Others;
