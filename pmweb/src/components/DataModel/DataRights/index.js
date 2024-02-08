// #BugID - 114853
// #BugDescription - Discard button funtionality added.
// #BugID - 115259
// #BugDescription - save functionality issue for data rights has been resolved.
// #BugID - 115282
// #BugDescription - Handled the checked checkbox after saving.
// #BugID - 117265
// #BugDescription - Already Handled the function for disable in deployed section with another bug.
// #BugID - 122019
// #BugDescription - Added the nodata icon with text.

import React, { useEffect, useRef, useState } from "react";
import styles from "./rights.module.css";
import SearchComponent from "../../../UI/Search Component/index";
import "./index.css";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Switch,
  FormGroup,
  Button,
  CircularProgress,
  Grid,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { store, useGlobalState } from "state-pool";
import Paginate from "./paginate";
import axios from "axios";
import {
  ENDPOINT_GET_DATA_ASSOCIATE,
  RTL_DIRECTION,
  SERVER_URL,
} from "../../../Constants/appConstants";
import PaginateVar from "./PaginateVar";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import { isProcessDeployedFunc } from "../../../utility/CommonFunctionCall/CommonFunctionCall";
import { isActivityModifyDisabled } from "../../../utility/ActivityModifyDisabled/isActivityModifyDisabled";
import emptyStatePic from "../../../assets/ProcessView/NoDataExist.svg";
import NoResultFound from "../../../assets/NoSearchResult.svg";

function DataRights({ isReadOnly }) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let dispatch = useDispatch();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);

  const actSize =
    localLoadedProcessData?.ActivityBatchSize &&
    localLoadedProcessData?.ActivityBatchSize > 0
      ? localLoadedProcessData?.ActivityBatchSize
      : 4;
  const varSize =
    localLoadedProcessData?.VariableBatchSize &&
    localLoadedProcessData?.VariableBatchSize > 0
      ? localLoadedProcessData?.VariableBatchSize
      : 5;
  const [variables, setVariables] = useState([]); // for left side variables
  const [activities, setActivities] = useState([]); //for showing activities
  const [actVar, setActVar] = useState([]); //variables in an activity
  const [varActRights, setVarActRights] = useState([]); // all data rights matrix
  const showPerPage = actSize; // page size for activities
  const [pagination, setPagination] = useState({
    start: 0,
    end: showPerPage,
  });
  const showPerPageVar = varSize; // page size for variable list
  const [paginationVar, setPaginationVar] = useState({
    start: 0,
    end: showPerPageVar,
  });

  const [fetchedRights, setFetchedRights] = useState([]); //existing fetched rights from get api call
  const [searchVar, setSearchVar] = useState(""); // for variable search filter
  const [searchAct, setSearchAct] = useState(""); // for activities search filter
  const [btnDisable, setBtnDisable] = useState(true);
  const [btnDiscard, setBtnDiscard] = useState(true);

  // code added on 15 Feb 2023 for BugId 123838
  let updatedVariables = variables?.filter((d) =>
    d.name.toLowerCase().includes(searchVar.toLowerCase())
  );
  let updatedActivities = activities?.filter((d) =>
    d.actName.toLowerCase().includes(searchAct.toLowerCase())
  );

  //array list for filter the activities which have data rights tab in properties else activity will not shown in matrix
  const actTypeArr = [
    1, 10, 27, 2, 34, 20, 32, 11, 29, 19, 3, 21, 4, 33, 22, 31,
  ];

  // code edited on 2 Dec 2022 for BugId 120005
  useEffect(async () => {
    //getting variable list from process
    let temp = [];
    localLoadedProcessData?.Variable?.filter(
      (d) => d.VariableScope === "U" || d.VariableScope === "I"
    )?.forEach((data) => {
      temp.push({
        id: data.VariableId,
        name: data.VariableName,
        varScope: data.VariableScope,
        varType: data.VariableType,
        read: false,
        modify: false,
        bulk: false,
      });
    });
    let arr = [];
    //getting activities list from process
    localLoadedProcessData?.MileStones?.forEach((mileStone) => {
      mileStone.Activities?.filter((d) =>
        actTypeArr?.includes(d?.ActivityType)
      )?.forEach((activity) => {
        arr.push({
          id: activity.ActivityId,
          type: activity.ActivityType,
          subType: activity.ActivitySubType,
          actName: activity.ActivityName,
          read: false,
          modify: false,
          bulk: false,
          isChecked: false,
        });
      });
    });
    let tempVar = [...temp];
    let tempAct = [...arr];
    let newArr = [];

    //code for getting existing rights using get api call and set to the above array which have both list activity and variables
    let ids = arr?.map((elem) => {
      return elem.id;
    });
    ids = ids.toString();
    const urlData = {
      pid: localLoadedProcessData.ProcessDefId,
      repoType: localLoadedProcessData.ProcessType,
      version: localLoadedProcessData.VersionNo,
      name: localLoadedProcessData.ProcessName,
      type: localLoadedProcessData.ProcessVariantType,
      id: ids,
    };
    const url =
      SERVER_URL +
      ENDPOINT_GET_DATA_ASSOCIATE +
      "?pDefId=" +
      urlData.pid +
      "&repoType=" +
      urlData.repoType +
      "&versionNo=" +
      urlData.version +
      "&pName=" +
      urlData.name +
      "&pVariantType=" +
      urlData.type +
      "&actId=" +
      urlData.id;
    const response = await getRightsAPICall(url);
    const actArr = response?.data?.actVarRightsDetails?.map((data) => {
      return data?.actName;
    });

    setActivities(arr?.filter((d) => actArr?.includes(d?.actName)));
    //setting activities and variable both list in an array to give rights for read and modify
    tempAct
      ?.filter((d) => actArr?.includes(d?.actName))
      ?.forEach((data, i) => {
        newArr[i] = {
          id: data.id,
          actName: data.actName,
          type: data.type,
          subType: data.subType,
          modStatus: false,
          varDetail: tempVar?.map((item, j) => {
            return {
              varId: item.id,
              varName: item.name,
              actName: data.actName,
              read: false,
              modify: false,
              bulk: false,
              varScope: item.varScope,
              varType: item.varType,
              mStatus: null,
              fetchedRights: "",
            };
          }),
        };
        tempVar?.forEach((item, j) => {
          newArr[i][j] = {
            varId: item.id,
            varName: item.name,
            actName: data.actName,
            read: false,
            modify: false,
            bulk: false,
          };
        });
      });

    setFetchedRights(response?.data?.actVarRightsDetails);

    response?.data?.actVarRightsDetails?.forEach((data, i) => {
      if (data?.varDetails && data?.varDetails?.length > 0) {
        data?.varDetails?.forEach((item, j) => {
          //finding index of matrix from variables array which was defined above in temp variable
          const varIndex = temp.findIndex(
            (x) => x.name?.trim() === item.varName?.trim() // code edited on 6 Dec 2022 for BugId 120198
          );

          if (item.varType === "O") {
            newArr[i][varIndex].read = true;
            newArr[i].varDetail[varIndex].read = true;
            newArr[i][varIndex].modify = true;
            newArr[i].varDetail[varIndex].modify = true;
            newArr[i][varIndex].bulk = false;
            newArr[i].varDetail[varIndex].bulk = false;
          } else if (item.varType === "R") {
            newArr[i][varIndex].read = true;
            newArr[i].varDetail[varIndex].read = true;
            newArr[i][varIndex].modify = false;
            newArr[i].varDetail[varIndex].modify = false;
            newArr[i][varIndex].bulk = false;
            newArr[i].varDetail[varIndex].bulk = false;
          } else if (item.varType === "A") {
            newArr[i][varIndex].read = true;
            newArr[i][varIndex].modify = true;
            newArr[i].varDetail[varIndex].read = true;
            newArr[i].varDetail[varIndex].modify = true;
            newArr[i][varIndex].bulk = true;
            newArr[i].varDetail[varIndex].bulk = true;
          }
          newArr[i].varDetail[varIndex].fetchedRights = item.varType;
        });
      } else {
        newArr = [...newArr];
      }
    });
    setVarActRights(newArr);

    // code added on 11 October 2022 for BugId 116289
    temp.forEach((data, i) => {
      let tempCount = [];
      let modifyCount = [];
      newArr.forEach((item, j) => {
        if (item.varDetail[i].read) {
          tempCount.push(j);
        }
        if (item.varDetail[i].modify) {
          modifyCount.push(j);
        }
      });

      if (tempCount?.length === arr.length - 1) {
        data.read = true;
      }
      if (modifyCount?.length === arr.length - 1) {
        data.modify = true;
      }
    });
    temp.sort(function (a, b) {
      var nameA = a.name.toLowerCase(),
        nameB = b.name.toLowerCase();
      if (nameA < nameB)
        //sort string ascending
        return -1;
      if (nameA > nameB) return 1;
      return 0; //default return value (no sorting)
    });
    setVariables(temp);
    setActVar(temp);
  }, []);

  const getRightsAPICall = async (url) => {
    return await axios.get(url);
  };

  //function for variable search filter
  const getVarList = (val) => {
    setSearchVar(val);
  };

  //function for activities search filter
  const getList = (val) => {
    setSearchAct(val);
  };

  //give all rights to all variables in a particular activity
  const checkedAllAct = (e, element, i) => {
    const tempAct = [...activities];
    let tempVar = [...variables];
    let tempVarAct = [...varActRights];

    tempVarAct
      ?.filter((d) => d.actName === element.actName)
      ?.forEach((data, i) => {
        data.modStatus = true;
        tempVar?.forEach((elem, j) => {
          data.varDetail[j].read = e.target.checked;
          if (!isActivityModifyDisabled(data.type, data.subType)) {
            data.varDetail[j].modify = e.target.checked;
            data.varDetail[j].bulk = e.target.checked;
          }

          if (e.target.checked === false) {
            data.varDetail[j].mStatus = "D";
          } else {
            data.varDetail[j].mStatus = "A";
          }
        });
      });

    tempAct?.forEach((el, z) => {
      if (el.actName === element.actName) {
        el.isChecked = e.target.checked;
      }
    });

    setActivities(tempAct);
    setVarActRights(tempVarAct);
    setBtnDisable(false);
    setBtnDiscard(false);
  };

  //function to give read rights to the particular variable in all activities
  const readAllVar = (e, data, j) => {
    let tempVar = [...variables];
    let tempVarAct = [...varActRights];

    tempVarAct?.forEach((el, i) => {
      el.modStatus = true;
      el.varDetail
        ?.filter((d) => d.varName === data.name)
        ?.forEach((elem, j) => {
          elem.read = e.target.checked;

          if (e.target.checked === false) {
            elem.mStatus = "D";
            elem.modify = e.target.checked;
            elem.bulk = e.target.checked;
          } else {
            elem.mStatus = "A";
          }
        });
    });

    tempVar?.forEach((el, z) => {
      if (el.name === data.name) {
        el.read = e.target.checked;
        if (e.target.checked === false) {
          el.modify = e.target.checked;
          el.bulk = e.target.checked;
        }
      }
    });

    setVariables(tempVar);
    setVarActRights(tempVarAct);
    setBtnDisable(false);
    setBtnDiscard(false);
  };

  //function to give modify rights to the particular variable in all activities
  const modifyAllVar = (e, data, j) => {
    let tempVar = [...variables];
    let tempVarAct = [...varActRights];

    tempVarAct.forEach((el, i) => {
      el.modStatus = true;

      el.varDetail
        ?.filter((d) => d.varName === data.name)
        ?.forEach((elem, j) => {
          if (!isActivityModifyDisabled(el.type, el.subType)) {
            elem.modify = e.target.checked;
          }
          if (e.target.checked === false) {
            elem.mStatus = "U"; //Modified on 05/10/2023, bug_id:131213
            //elem.mStatus = "D";
            elem.bulk = false;
          } else {
            elem.mStatus = "A";
            elem.read = e.target.checked;
          }
        });
    });

    tempVar?.forEach((el, z) => {
      if (el.name === data.name) {
        el.modify = e.target.checked;
        if (e.target.checked === true) {
          el.read = e.target.checked;
        } else {
          el.bulk = false;
        }
      }
    });

    setVariables(tempVar);
    setVarActRights(tempVarAct);
    setBtnDisable(false);
    setBtnDiscard(false);
  };

  const bulkAllVar = (e, data, j) => {
    let tempVar = [...variables];
    let tempVarAct = [...varActRights];

    tempVarAct.forEach((el, i) => {
      el.modStatus = true;

      el.varDetail
        ?.filter((d) => d.varName === data.name)
        ?.forEach((elem, j) => {
          if (!isActivityModifyDisabled(el.type, el.subType)) {
            elem.bulk = e.target.checked;
          }
          if (e.target.checked === false) {
            elem.mStatus = "U"; //Modified on 05/10/2023, bug_id:131213
            //elem.mStatus = "D";
          } else {
            elem.mStatus = "A";
            elem.read = e.target.checked;
            if (!isActivityModifyDisabled(el.type, el.subType)) {
              elem.modify = e.target.checked;
            }
          }
        });
    });

    tempVar?.forEach((el, z) => {
      if (el.name === data.name) {
        el.bulk = e.target.checked;
        if (e.target.checked === true) {
          el.read = e.target.checked;
          el.modify = e.target.checked;
        }
      }
    });

    setVariables(tempVar);
    setVarActRights(tempVarAct);
    setBtnDisable(false);
    setBtnDiscard(false);
  };

  //give read rights to particular variable in an activity
  const readVar = (e, actData, varData) => {
    let tempVarAct = [...varActRights];

    tempVarAct
      ?.filter((d) => d.actName == actData)
      ?.forEach((el, i) => {
        el.modStatus = true;
        el.varDetail?.forEach((itm, j) => {
          if (itm.varName == varData) {
            if (!e.target.checked) {
              itm.modify = false;
              itm.bulk = false;
            }
            itm.read = e.target.checked;

            tempVarAct[i][j].read = e.target.checked;
            if (e.target.checked === false) {
              itm.modify = e.target.checked;
              itm.mStatus = "D";
            } else {
              itm.mStatus = "A";
            }
          }
        });
      });

    // code added on 11 October 2022 for BugId 116289

    let count = 0;
    tempVarAct?.forEach((el, i) => {
      el.varDetail?.forEach((itm, j) => {
        if (itm.varName == varData) {
          if (itm.read === true) {
            ++count;
          }
        }
      });
    });

    let tempVar = [...variables];
    tempVar?.forEach((el, z) => {
      if (el.name === varData) {
        // el.read = e.target.checked;
        if (e.target.checked === false) {
          el.read = e.target.checked;
          el.modify = e.target.checked;
        } else {
          if (activities.length === count) {
            el.read = e.target.checked;
          }
        }
      }
    });

    setVariables(tempVar);

    setVarActRights(tempVarAct);
    setBtnDisable(false);
    setBtnDiscard(false);
  };

  //give modify rights to particular variable in an activity
  const modifyVar = (e, actData, varData) => {
    let tempVarAct = [...varActRights];
    tempVarAct
      ?.filter((d) => d.actName == actData)
      ?.forEach((el, i) => {
        el.modStatus = true;
        el.varDetail?.forEach((itm, j) => {
          if (itm.varName == varData) {
            if (e.target.checked) {
              itm.read = e.target.checked;
              itm.modify = e.target.checked;
            } else {
              itm.modify = e.target.checked;
              itm.bulk = e.target.checked;
            }

            tempVarAct[i][j].modify = e.target.checked;
            if (e.target.checked === false) {
              itm.mStatus = "D";
            } else {
              itm.mStatus = "A";
              itm.read = e.target.checked;
            }
          }
        });
      });

    // code added on 11 October 2022 for BugId 116289

    let count = 0;
    tempVarAct?.forEach((el, i) => {
      el.varDetail?.forEach((itm, j) => {
        if (itm.varName == varData) {
          if (itm.read === true) {
            ++count;
          }
        }
      });
    });

    let tempVar = [...variables];
    tempVar?.forEach((el, z) => {
      if (el.name === varData) {
        // el.read = e.target.checked;
        if (e.target.checked === false) {
          el.modify = e.target.checked;
        } else {
          if (activities.length === count) {
            el.modify = e.target.checked;
            el.read = e.target.checked;
          }
        }
      }
    });

    setVariables(tempVar);

    setVarActRights(tempVarAct);
    setBtnDisable(false);
    setBtnDiscard(false);
  };

  const bulkVar = (e, actData, varData) => {
    let tempVarAct = [...varActRights];
    tempVarAct
      ?.filter((d) => d.actName == actData)
      ?.forEach((el, i) => {
        el.modStatus = true;
        el.varDetail?.forEach((itm, j) => {
          if (itm.varName == varData) {
            if (e.target.checked) {
              itm.read = e.target.checked;
              itm.modify = e.target.checked;
            }
            itm.bulk = e.target.checked;

            tempVarAct[i][j].bulk = e.target.checked;
            if (e.target.checked === false) {
              itm.mStatus = "D";
            } else {
              itm.mStatus = "A";
            }
          }
        });
      });

    setVarActRights(tempVarAct);
    setBtnDisable(false);
    setBtnDiscard(false);
  };

  //function for pagination for activities
  const onPaginationChange = (start, end) => {
    setPagination({ start: start, end: end });
    return { start: start + 1, end: end };
  };

  //function for pagination for variables
  const onPaginationVarChange = (start, end) => {
    setPaginationVar({ start: start, end: end });
    return { start: start + 1, end: end };
  };

  //function to return by default read value
  const getReadVal = (actData, varData) => {
    let tempRights = [...varActRights];
    let retVal = null;
    tempRights
      ?.filter((d) => d.actName == actData)
      ?.forEach((el, i) => {
        el.varDetail?.forEach((itm, j) => {
          if (itm.varName == varData) {
            retVal = itm.read;
          }
        });
      });
    return retVal;
  };

  //function to return by default modify value
  const getModifyVal = (actData, varData) => {
    let tempRights = [...varActRights];
    let retVal = null;
    tempRights
      ?.filter((d) => d.actName == actData)
      ?.forEach((el, i) => {
        el.varDetail?.forEach((itm, j) => {
          if (itm.varName == varData) {
            retVal = itm.modify;
          }
        });
      });
    return retVal;
  };
  const getBulkVal = (actData, varData) => {
    let tempRights = [...varActRights];
    let retVal = null;
    tempRights
      ?.filter((d) => d.actName == actData)
      ?.forEach((el, i) => {
        el.varDetail?.forEach((itm, j) => {
          if (itm.varName == varData) {
            retVal = itm.bulk;
          }
        });
      });
    return retVal;
  };

  //While saving getting mapped variable for json payload
  const getMappedVar = (data, index) => {
    let tempVarAct = [...varActRights];

    const x = tempVarAct[index]?.varDetail
      ?.filter((d) => d.mStatus != null)
      ?.map((item) => ({
        m_sStatus: item.mStatus,
        varDefInfo: {
          varScope: item.varScope,
          variableId: item.varId,
          varName: item.varName.trim(),
          type: item.varType,
        },
        isModify: item.modify,
        isView: item.read,
        isBulk: item.bulk,
        m_strFetchedRights: item.fetchedRights,
      }));

    return x;
  };

  const getVarArr = (data) => {
    const x = data?.varDetail
      ?.filter((d) => d.mStatus != null && (d.read || d.modify || d.bulk))
      ?.map((item, m) => {
        let varTypeVal = item.bulk ? "A" : item.modify ? "O" : "R";
        return {
          varName: item.varName.trim(),
          varType: varTypeVal,
        };
      });

    return x;
  };

  //save data function after submitting save button
  const saveData = () => {
    let tempVarAct = [...varActRights];
    //list of save activities with variable rights
    const saveAct = tempVarAct?.map((el, i) => {
      const retMapVar = getMappedVar(el, i);
      return {
        actId: el.id,
        actType: el.type,
        actSubType: el.subType,
        actName: el.actName,
        bActDataModified: el.modStatus,
        m_objDataVarMappingInfo:
          el.modStatus == true
            ? {
                dataVarMap: Object.assign({}, retMapVar), //converting array into object
              }
            : {},
      };
    });

    const payLoad = {
      processDefId: localLoadedProcessData.ProcessDefId,
      processName: localLoadedProcessData.ProcessName,
      projectId: localLoadedProcessData.ProjectId,
      activities: saveAct, // this is an array variable coming from above
    };

    axios
      .post(SERVER_URL + "/saveDataAssoc", payLoad)
      .then((res) => {
        if (res?.data?.Status === 0) {
          // code added on 2 Dec 2022 for BugId 120005
          let tempRights = [];
          tempVarAct?.forEach((el) => {
            tempRights.push({
              actId: el.id,
              actName: el.actName,
              varDetails: getVarArr(el),
            });
          });
          setFetchedRights(tempRights);
          dispatch(
            setToastDataFunc({
              message: t("toolbox.dataRights.dataSaveMsg"),
              severity: "success",
              open: true,
            })
          );
          setBtnDisable(true);
          setBtnDiscard(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  // code edited on 2 Dec 2022 for BugId 120005
  const discard = async () => {
    let tempVar = [...variables];
    let tempAct = [...activities];
    let newArr = [];

    const originalRights = [...fetchedRights];
    const actArr = originalRights?.map((data) => {
      return data?.actName;
    });

    //setting activities and variable both list in an array to give rights for read and modify
    tempAct
      ?.filter((d) => actArr?.includes(d?.actName))
      ?.forEach((data, i) => {
        newArr[i] = {
          id: data.id,
          actName: data.actName,
          type: data.type,
          subType: data.subType,
          modStatus: false,
          varDetail: tempVar?.map((item, j) => {
            return {
              varId: item.id,
              varName: item.name,
              actName: data.actName,
              read: false,
              modify: false,
              bulk: false,
              varScope: item.varScope,
              varType: item.varType,
              mStatus: null,
              fetchedRights: "",
            };
          }),
        };
        tempVar?.forEach((item, j) => {
          newArr[i][j] = {
            varId: item.id,
            varName: item.name,
            actName: data.actName,
            read: false,
            modify: false,
            bulk: false,
          };
        });
      });

    fetchedRights?.forEach((data, i) => {
      if (data?.varDetails && data?.varDetails?.length > 0) {
        data?.varDetails?.forEach((item, j) => {
          //finding index of matrix from variables array which was defined above in temp variable
          const varIndex = tempVar.findIndex(
            (x) => x.name?.trim() === item.varName?.trim() // code edited on 6 Dec 2022 for BugId 120198
          );

          if (item.varType === "O") {
            newArr[i][varIndex].read = true;
            newArr[i].varDetail[varIndex].read = true;
            newArr[i][varIndex].modify = true;
            newArr[i].varDetail[varIndex].modify = true;
            newArr[i][varIndex].bulk = false;
            newArr[i].varDetail[varIndex].bulk = false;
          } else if (item.varType === "R") {
            newArr[i][varIndex].read = true;
            newArr[i].varDetail[varIndex].read = true;
            newArr[i][varIndex].modify = false;
            newArr[i].varDetail[varIndex].modify = false;
            newArr[i][varIndex].bulk = false;
            newArr[i].varDetail[varIndex].bulk = false;
          } else if (item.varType === "A") {
            newArr[i][varIndex].read = true;
            newArr[i][varIndex].modify = true;
            newArr[i].varDetail[varIndex].read = true;
            newArr[i].varDetail[varIndex].modify = true;
            newArr[i][varIndex].bulk = true;
            newArr[i].varDetail[varIndex].bulk = true;
          }
          newArr[i].varDetail[varIndex].fetchedRights = item.varType;
        });
      } else {
        newArr = [...newArr];
      }
    });
    setVarActRights(newArr);

    let temp = [...variables];
    temp.forEach((data, i) => {
      let tempCount = [];
      let modifyCount = [];
      newArr.forEach((item, j) => {
        if (item.varDetail[i].read) {
          tempCount.push(j);
        }
        if (item.varDetail[i].modify) {
          modifyCount.push(j);
        }
      });
      if (tempCount?.length === activities.length - 1) {
        data.read = true;
      }
      if (modifyCount?.length === activities.length - 1) {
        data.modify = true;
      }
    });
    setVariables(temp);
    setActVar(temp);
    setBtnDisable(true);
    setBtnDiscard(true);
  };

  const getAllCheckedRead = (data) => {
    console.log("###", "all checked", data, varActRights);
    let tempVarAct = [...varActRights];
    let temp = true;
    tempVarAct.forEach((el, i) => {
      el.varDetail
        ?.filter((d) => d.varName === data.name)
        ?.forEach((elem, j) => {
          if (elem.read === false) temp = false;
        });
    });

    return temp;
  };
  const getAllCheckedModify = (data) => {
    let tempVarAct = [...varActRights];
    let temp = true;
    tempVarAct.forEach((el, i) => {
      if (!isActivityModifyDisabled(el.type, el.subType)) {
        el.varDetail
          ?.filter((d) => d.varName === data.name)
          ?.forEach((elem, j) => {
            if (elem.modify === false) temp = false;
          });
      }
    });

    return temp;
  };
  const getAllCheckedBulk = (data) => {
    let tempVarAct = [...varActRights];
    let temp = true;
    tempVarAct.forEach((el, i) => {
      if (!isActivityModifyDisabled(el.type, el.subType)) {
        el.varDetail
          ?.filter((d) => d.varName === data.name)
          ?.forEach((elem, j) => {
            if (elem.bulk === false) temp = false;
          });
      }
    });

    return temp;
  };

  const getAllCheckedActivity = (data) => {
    let temp = true;
    varActRights.forEach((act) => {
      if (act.actName === data.actName) {
        act.varDetail.forEach((_var) => {
          if (!isActivityModifyDisabled(act.type, act.subType)) {
            if (
              _var.bulk === false ||
              _var.read === false ||
              _var.modify === false
            )
              temp = false;
          } else {
            if (_var.read === false) temp = false;
          }
        });
      }
    });
    return temp;
  };
  const [rightsActWidth, setRightsActWidth] = useState("100%");

  const rightsActRef = useRef();
  useEffect(() => {
    console.log("cur", rightsActRef.current?.scrollWidth);
    if (rightsActRef.current) {
      setRightsActWidth(rightsActRef.current?.scrollWidth);
    }
  }, [rightsActRef.current]);
  return (
    <>
      {varActRights?.length > 0 ? (
        /* Bug 121583 - Safari browser>>Data model>> footer of save and discard button is distorted
        [01-04-2023] Provided the flex*/
        <>
          {/* Changes made to solve Bug 139487 */}
          {variables && variables.length > 0 ? (
            <div className={styles.mainDiv}>
              <div className={styles.flexContainer}>
                <div
                  className={
                    direction === RTL_DIRECTION
                      ? styles.leftPanelArabic
                      : styles.leftPanel
                  }
                >
                  <div className={styles.leftHeadSection}>
                    <div className={styles.variableHead}>
                      <h4 className={styles.heading}>
                        {t("toolbox.dataRights.variables")}
                      </h4>
                      <div className={styles.showCount}>
                        <PaginateVar
                          showPerPageVar={showPerPageVar}
                          onPaginationVarChange={onPaginationVarChange}
                          total={updatedVariables.length} // code added on 15 Feb 2023 for BugId 123838
                          page={paginationVar}
                        />
                      </div>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.searchBar}>
                        <SearchComponent
                          width="100%"
                          height="var(--line_height)"
                          searchTerm={searchVar}
                          onSearchChange={(val) => {
                            getVarList(val);
                          }}
                          placeholder={t("search")}
                        />
                      </span>
                    </div>
                  </div>
                  <div className={styles.variableSection}>
                    {/* code added on 15 Feb 2023 for BugId 123838 */}
                    {updatedVariables.length > 0 ? (
                      updatedVariables
                        ?.slice(paginationVar.start, paginationVar.end)
                        ?.map((data, i) => (
                          <div className={styles.varibleList}>
                            <p className={styles.varTitle}>{data.name}</p>
                            <p className={styles.checkGroup}>
                              <FormGroup row style={{ gap: "0.5vw" }}>
                                <FormControlLabel
                                  className={styles.rightsCheck}
                                  control={
                                    <Checkbox
                                      disabled={
                                        isReadOnly ||
                                        isProcessDeployedFunc(
                                          localLoadedProcessData
                                        )
                                      }
                                      onChange={(e) => {
                                        readAllVar(e, data, i);
                                      }}
                                      name="read"
                                      checked={getAllCheckedRead(data)}
                                    />
                                  }
                                  id={`pmweb_dataRights_left_read_${i}`}
                                  label={t("read")}
                                />
                                <FormControlLabel
                                  className={styles.rightsCheck}
                                  control={
                                    <Checkbox
                                      disabled={
                                        isReadOnly ||
                                        isProcessDeployedFunc(
                                          localLoadedProcessData
                                        )
                                      }
                                      onChange={(e) => {
                                        modifyAllVar(e, data, i);
                                      }}
                                      name="modify"
                                      checked={getAllCheckedModify(data)}
                                    />
                                  }
                                  id={`pmweb_dataRights_left_modify_${i}`}
                                  label={t("modify")}
                                />
                                <FormControlLabel
                                  className={styles.rightsCheck}
                                  control={
                                    <Checkbox
                                      disabled={
                                        isReadOnly ||
                                        isProcessDeployedFunc(
                                          localLoadedProcessData
                                        )
                                      }
                                      onChange={(e) => {
                                        bulkAllVar(e, data, i);
                                      }}
                                      name="bulk"
                                      checked={getAllCheckedBulk(data)}
                                    />
                                  }
                                  id={`pmweb_dataRights_left_bulk_${i}`}
                                  label={t("bulk")}
                                />
                              </FormGroup>
                            </p>
                          </div>
                        ))
                    ) : (
                      // Changes made to solve Bug 139487
                      <div
                        className={
                          direction === RTL_DIRECTION
                            ? "NoResultFoundLeftDivArabic"
                            : "NoResultFoundLeftDiv"
                        }
                      >
                        <img
                          src={NoResultFound}
                          style={{
                            height: "18rem",
                          }}
                          alt={t("noResultsFound")}
                        />
                        <p
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            position: "absolute",
                            left: "15%",
                            top: "88%",
                          }}
                        >
                          {t("noSearchResult")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.rightPanel}>
                  {/**code modified for 140298 on 02-11-23 
                  <div
                      className={styles.rightsHead}
                      
                        >*/}
                  <Grid
                    container
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "white",
                      zIndex: 1,
                      width: rightsActWidth,
                    }}
                  >
                    <div
                      className={styles.rightsHead}
                      style={{ minWidth: "700px" }}
                    >
                      <div style={{ flexGrow: "4" }}>
                        <h4 className={styles.heading}>
                          {t("toolbox.dataRights.rightsAct")}
                        </h4>
                      </div>
                      <div className={styles.showCountRight}>
                        <Paginate
                          showPerPage={showPerPage}
                          onPaginationChange={onPaginationChange}
                          total={updatedActivities.length} // code added on 15 Feb 2023 for BugId 123838
                          page={pagination}
                        />
                      </div>
                      <div className={styles.searchBar}>
                        <SearchComponent
                          onSearchChange={(e) => {
                            getList(e);
                          }}
                          placeholder={t("search")}
                        />
                      </div>
                      <div className="pmweb_switch">
                        <FormControl>
                          <FormControlLabel
                            control={
                              <Switch
                                className={styles.switchToggle}
                                color="primary"
                                size="small"
                              />
                            }
                            label={t("compact")}
                            labelPlacement="start"
                          />
                        </FormControl>
                      </div>
                    </div>
                  </Grid>
                  <div class={styles.rightsActivities} ref={rightsActRef}>
                    {/* code added on 15 Feb 2023 for BugId 123838 */}
                    {updatedActivities.length > 0 ? (
                      updatedActivities
                        ?.slice(pagination.start, pagination.end)
                        ?.map((elem, i) => (
                          <div
                            class={styles.actColumn}
                            //code added for bug id 136739
                            style={{
                              borderInlineStart:
                                i === 0 ? "1px solid #c4c4c4" : "",
                            }}
                          >
                            <div className={styles.actItem}>
                              <FormControlLabel
                                className={styles.rightsCheck}
                                control={
                                  <Checkbox
                                    disabled={
                                      isReadOnly ||
                                      isProcessDeployedFunc(
                                        localLoadedProcessData
                                      )
                                    }
                                    onChange={(e) => {
                                      checkedAllAct(e, elem, i);
                                    }}
                                    checked={getAllCheckedActivity(elem)}
                                  />
                                }
                                id={`pmweb_dataRights_right_${elem?.actName}`}
                                label={
                                  <span className={styles.actTitle}>
                                    {elem?.actName}
                                  </span>
                                }
                              />
                            </div>

                            <div className={styles.variableSection}>
                              {/* code added on 15 Feb 2023 for BugId 123838 */}
                              {actVar
                                ?.filter((d) =>
                                  d.name
                                    .toLowerCase()
                                    .includes(searchVar.toLowerCase())
                                )
                                ?.slice(paginationVar.start, paginationVar.end)
                                ?.map((item, j) => (
                                  <div className={styles.actRights}>
                                    <p className={styles.checkGroup}>
                                      <FormGroup row style={{ gap: "0.5vw" }}>
                                        <FormControlLabel
                                          className={styles.rightsCheck}
                                          control={
                                            <Checkbox
                                              disabled={
                                                isReadOnly ||
                                                isProcessDeployedFunc(
                                                  localLoadedProcessData
                                                )
                                              }
                                              checked={getReadVal.call(
                                                this,
                                                elem?.actName,
                                                item?.name
                                              )}
                                              onChange={(e) => {
                                                readVar(
                                                  e,
                                                  elem?.actName,
                                                  item?.name
                                                );
                                              }}
                                            />
                                          }
                                          label={t("read")}
                                          id={`pmweb_dataRights_right_read_${elem?.actName}_${j}`}
                                        />

                                        <FormControlLabel
                                          className={styles.rightsCheck}
                                          control={
                                            <Checkbox
                                              disabled={
                                                isReadOnly ||
                                                isProcessDeployedFunc(
                                                  localLoadedProcessData
                                                ) ||
                                                isActivityModifyDisabled(
                                                  elem.type,
                                                  elem.subType
                                                )
                                              }
                                              checked={getModifyVal.call(
                                                this,
                                                elem?.actName,
                                                item?.name
                                              )}
                                              onChange={(e) => {
                                                modifyVar(
                                                  e,
                                                  elem?.actName,
                                                  item?.name
                                                );
                                              }}
                                            />
                                          }
                                          id={`pmweb_dataRights_right_modify_${elem?.actName}_${j}`}
                                          label={t("modify")}
                                        />
                                        <FormControlLabel
                                          className={styles.rightsCheck}
                                          control={
                                            <Checkbox
                                              disabled={
                                                isReadOnly ||
                                                isProcessDeployedFunc(
                                                  localLoadedProcessData
                                                ) ||
                                                isActivityModifyDisabled(
                                                  elem.type,
                                                  elem.subType
                                                )
                                              }
                                              checked={getBulkVal.call(
                                                this,
                                                elem?.actName,
                                                item?.name
                                              )}
                                              onChange={(e) => {
                                                bulkVar(
                                                  e,
                                                  elem?.actName,
                                                  item?.name
                                                );
                                              }}
                                            />
                                          }
                                          id={`pmweb_dataRights_right_bulk_${elem?.actName}_${j}`}
                                          label={t("bulk")}
                                        />
                                      </FormGroup>
                                    </p>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))
                    ) : (
                      // Changes made to solve Bug 139487
                      <div
                        className={
                          direction === RTL_DIRECTION
                            ? "NoResultFoundRightDivArabic"
                            : "NoResultFoundRightDiv"
                        }
                      >
                        <img
                          src={NoResultFound}
                          style={{
                            height: "18rem",
                            // position: "absolute",
                            // left: "60%",
                            // top: "30%",
                          }}
                          alt={t("noResultsFound")}
                        />
                        <p
                          style={{
                            fontSize: "var(--base_text_font_size)",
                            position: "absolute",
                            left: "15%",
                            top: "90%",
                          }}
                        >
                          {t("noSearchResult")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {!isReadOnly && (
                <div className={styles.footer}>
                  <div className={styles.btnList}>
                    <Button
                      id="pmweb_dataRights_cancel"
                      className="tertiary"
                      variant="outlined"
                      size="small"
                      disabled={
                        btnDiscard ||
                        isProcessDeployedFunc(localLoadedProcessData)
                      }
                      onClick={discard}
                    >
                      {t("toolbox.dataRights.discard")}
                    </Button>
                    <Button
                      id="pmweb_dataRights_save"
                      className={
                        btnDisable ? "btnDisable primary" : "btnSave primary"
                      }
                      variant="contained"
                      size="small"
                      onClick={saveData}
                      disabled={
                        btnDisable ||
                        isProcessDeployedFunc(localLoadedProcessData)
                      }
                    >
                      {t("toolbox.dataRights.save")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="noData">
              <img src={emptyStatePic} alt={t("emptyState")} />
              <p
                style={{
                  fontSize: "12px",
                  fontWeight: "400",
                  marginLeft: "-10rem",
                }}
              >
                {t("noDataMsgForDataRights")}
              </p>
            </div>
          )}
        </>
      ) : (
        <CircularProgress
          style={
            direction === RTL_DIRECTION
              ? { marginTop: "40vh", marginRight: "50%" }
              : { marginTop: "40vh", marginLeft: "50%" }
          }
        />
      )}
    </>
  );
}

export default DataRights;
