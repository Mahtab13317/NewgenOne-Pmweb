// Bug solved for: No validation when documents with same name is added - 109986
// Changes made to solve Todo Screen distorts when the count increases  ID 112558
// Changes made to solve Bug = 114551 =>Add Document not working once you add document, log out , login and again create document is not working
// #BugID - 109986
// #BugDescription - validation for Doctype duplicate name length has been added.
// #BugID - 114022
// #BugDescription - Document Type is being added now when lengthy name is entered and text validate also.
// #BugID - 117804
// #BugDescription - isMandatory field added in view modal.
// #Date - 28 October 2022
// #BugID - 119039
// #BugDescription - Switching tab data showing issue for Rules has been fixed.
// #Date - 15 November 2022
// #BugID - 121845,121884,122101
// #BugDescription - Handled the doctype name,description length and added tooltip to show complete data

import React, { useEffect, useState, useRef } from "react";
import "../Interfaces.css";
import { useTranslation } from "react-i18next";
import SearchProject from "../../../../UI/Search Component/index";
import CheckBoxes from "./CheckBoxes";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import AddDocType from "./AddDoc";
import Modal from "@material-ui/core/Modal";
import { store, useGlobalState } from "state-pool";
import {
  SERVER_URL,
  ENDPOINT_EDIT_DOC,
  RTL_DIRECTION,
  BATCH_COUNT,
  headerHeight,
} from "../../../../Constants/appConstants";
import axios from "axios";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ActivityModal from "./ActivityModal.js";
import Backdrop from "../../../../UI/Backdrop/Backdrop";
import { giveCompleteRights } from "../../../../utility/Tools/giveCompleteRights_docType";
import { connect, useDispatch, useSelector } from "react-redux";
import DeleteDocModal from "../../../../UI/ActivityModal/Modal";
import CircularProgress from "@material-ui/core/CircularProgress";
import Rules from "../Rules/Rules";
import DefaultModal from "../../../../UI/Modal/Modal";
import ObjectDependencies from "../../../../UI/ObjectDependencyModal";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import {
  isProcessDeployedFunc,
  shortenRuleStatement,
} from "../../../../utility/CommonFunctionCall/CommonFunctionCall";
import EmptyStateIcon from "../../../../assets/ProcessView/EmptyState.svg";
import {
  decode_utf8,
  encode_utf8,
} from "../../../../utility/UTF8EncodeDecoder";
import { LightTooltip } from "../../../../UI/StyledTooltip";
import NoResultFound from "../../../../assets/NoSearchResult.svg";
import { v4 as uuidv4 } from "uuid";
import { Grid, IconButton } from "@material-ui/core";
import { FocusTrap } from "@mui/base";
import manageRights from "../../../../assets/abstractView/manageRights.svg";

function DocType(props) {
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setlocalLoadedProcessData] =
    useGlobalState(loadedProcessData);
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const [isLoading, setIsLoading] = useState(true);
  let [docSearchTerm, setDocSearchTerm] = useState("");
  let [activitySearchTerm, setActivitySearchTerm] = useState("");
  const [addDocModal, setAddDocModal] = React.useState(false);
  const [compact, setCompact] = useState(false);
  const [fullRightCheckOneDocArr, setFullRightCheckOneDocArr] = useState([]);
  const [bDocExists, setbDocExists] = useState(false);
  const [openActivityModal, setOpenActivityModal] = useState(null);
  const [fullRightCheckOneActivityArr, setFullRightCheckOneActivityArr] =
    useState([]);
  const [docData, setDocData] = useState({});
  const [docNameToModify, setDocNameToModify] = useState(null);
  const [docDescToModify, setDocDescToModify] = useState();
  const [docIdToModify, setDocIdToModify] = useState();
  //code added on 8 June 2022 for BugId 110212
  const [docArray, setDocArray] = useState([]);
  const [docAllRules, setDocAllRules] = useState([]);
  const [selectedTab, setSelectedTab] = useState("screenHeading");
  const [subColumns, setSubColumns] = useState([]);
  const [splicedColumns, setSplicedColumns] = useState([]);
  const [showDocNameError, setShowDocNameError] = useState(false);
  const [processType, setProcessType] = useState(null);
  const [addAnotherDoc, setAddAnotherDoc] = useState(false);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [taskAssociation, setTaskAssociation] = useState([]);
  const [isMandatory, setIsMandatory] = useState(false);
  /* changes added for bug_id: 134226 */
  const windowInnerHeight = useSelector(
    (state) => state.setWindowInnerHeight.windowInnerHeight
  );
  const allRightstoActivityRef = useRef([]);
  const allRightRef = useRef([]);
  const dispatch = useDispatch();
  const rightTypes = ["Modify", "Delete", "Print", "Download"];
  let isReadOnly =
    props.isReadOnly || isProcessDeployedFunc(localLoadedProcessData);

  const [spinner, setSpinner] = useState({
    addAndClose: false,
    addAnother: false,
  });
  const isFirstRenderRef = useRef(true);

  const tabChangeHandler = (e, tabName) => {
    setSelectedTab(tabName);
  };

  useEffect(() => {
    setIsLoading(true);
  }, [localLoadedProcessData?.ProcessDefId]);

  //  Modified on 15-01-24 for Bug 142600
  useEffect(() => {
    if (isFirstRenderRef.current) {
      let arr = [];
      let activityIdString = "";
      localLoadedProcessData?.MileStones.forEach((mileStone) => {
        mileStone.Activities.forEach((activity) => {
          if (
            !(activity.ActivityType === 18 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 1 && activity.ActivitySubType === 2) &&
            !(activity.ActivityType === 26 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 10 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 20 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 22 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 31 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 29 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 10 && activity.ActivitySubType === 4) &&
            !(activity.ActivityType === 33 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 27 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 19 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 21 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 5 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 6 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 5 && activity.ActivitySubType === 2) &&
            !(activity.ActivityType === 6 && activity.ActivitySubType === 2) &&
            !(activity.ActivityType === 7 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 34 && activity.ActivitySubType === 1) &&
            !(activity.ActivityType === 35 && activity.ActivitySubType === 1) &&
            // code added on 11 Oct 2022 for BugId 116576
            !(activity.ActivityType === 30 && activity.ActivitySubType === 1)
          ) {
            activityIdString = activityIdString + activity.ActivityId + ",";
            arr.push(activity);
          }
        });
      });

      if (activityIdString !== "" && activityIdString !== null) {
        MapAllActivities(activityIdString);
      }
      setSubColumns(arr);
      setSplicedColumns(arr.slice(0, BATCH_COUNT));
      setProcessType(localLoadedProcessData?.ProcessType);
      isFirstRenderRef.current = false;
    }
  }, [localLoadedProcessData]);
  // Till here for Bug 142600

  useEffect(() => {
    if (document.getElementById("oneBoxMatrix")) {
      document.getElementById("oneBoxMatrix").onscroll = function (event) {
        let scrollLeftVal =
          direction === RTL_DIRECTION ? 0 - +this.scrollLeft : this.scrollLeft;
        if (scrollLeftVal >= this.scrollWidth - this.clientWidth) {
          const timeout = setTimeout(() => {
            setSplicedColumns((prev) =>
              subColumns.slice(0, prev.length + BATCH_COUNT)
            );
          }, 500);
          return () => clearTimeout(timeout);
        }
      };
    }
  });

  const MapAllActivities = (activityIdString) => {
    // code edited on 7 Nov 2022 for BugId 116221
    if (localLoadedProcessData?.ProcessDefId) {
      axios
        .get(
          SERVER_URL +
            `/doctypes/${localLoadedProcessData.ProcessDefId}/${localLoadedProcessData.ProcessType}/${localLoadedProcessData.ProcessName}/${activityIdString}`
        )
        .then((res) => {
          if (res.status === 200) {
            setDocAllRules(res.data.Rules);
            setDocData(res.data);
            //code added on 8 June 2022 for BugId 110212
            let docTypeList = res?.data?.DocumentTypeList
              ? [...res.data.DocumentTypeList]
              : [];
            let array = [];
            docTypeList?.forEach((grp) => {
              let obj = {
                Name: grp.DocName,
                NameId: grp.DocTypeId,
              };
              array.push(obj);
            });
            setDocArray(array);

            let tempFullRightCheckOneDocArr =
              fullRightCheckOneDocArr.length > 0
                ? [...fullRightCheckOneDocArr]
                : [];
            docTypeList?.forEach((docType, doc_idx) => {
              let allChecked = true;
              for (let prop in docType?.SetAllChecks) {
                if (docType.SetAllChecks[prop] === false) {
                  allChecked = false;
                  tempFullRightCheckOneDocArr[doc_idx] = false;
                  break;
                }
              }
              if (allChecked) {
                tempFullRightCheckOneDocArr[doc_idx] = true;
              }
            });
            setFullRightCheckOneDocArr(tempFullRightCheckOneDocArr);
            //-------
            let localActArr = new Map();
            docTypeList?.forEach((docType) => {
              docType.Activities?.forEach((activity) => {
                let localActivityArrVal = true;
                let actType = getActType(activity.ActivityId);
                // modified on 29/10/23 for BugId 138883
                if (
                  +actType !== 2 &&
                  +actType !== 3 &&
                  docType.DocType !== "C"
                ) {
                  if (Object.values(activity).includes(false)) {
                    localActivityArrVal = false;
                  } else {
                    if (localActArr.get(activity.ActivityId) !== false) {
                      localActivityArrVal = true;
                    } else {
                      localActivityArrVal = false;
                    }
                  }
                } else {
                  if (
                    !activity["View"] &&
                    localActArr.get(activity.ActivityId)
                  ) {
                    localActivityArrVal = false;
                  } else {
                    if (localActArr.get(activity.ActivityId) === undefined) {
                      localActivityArrVal = activity["View"];
                    } else if (localActArr.get(activity.ActivityId) !== false) {
                      localActivityArrVal = true;
                    } else {
                      localActivityArrVal = false;
                    }
                  }
                }
                localActArr.set(activity.ActivityId, localActivityArrVal);
              });
            });

            let fullRightArr = [...fullRightCheckOneActivityArr];
            localActArr?.forEach((act, actVal) => {
              fullRightArr[actVal] = act;
            });
            setFullRightCheckOneActivityArr(fullRightArr);
            //-------
            setIsLoading(false);
          }
        })
        .catch(() => setIsLoading(false));
    }
  };

  // Modified on 15-01-24 for Bug 142600
  /*code updated on 10 October 2022 for BugId 114022	*/
  const addDocToList = (DocToAdd, DocDesc, button_type, mandatorydoc) => {
    let exist = false;
    if (docData && docData?.DocumentTypeList) {
      const lowerCaseDocToAdd = DocToAdd?.trim()?.toLowerCase();
      //modified below changes for checkmarx issue
      // for (let i = 0; i < docData.DocumentTypeList.length; i++) {
      //   console.log("Inside loop, iteration:", i);
      //   const type = docData.DocumentTypeList[i];
      //   if (type.DocName.trim().toLowerCase() === lowerCaseDocToAdd) {
      //     setbDocExists(true);
      //     exist = true;
      //     break;
      //   }
      // }
      if (
        docData.DocumentTypeList.some(
          (type) => type.DocName.trim().toLowerCase() === lowerCaseDocToAdd
        )
      ) {
        setbDocExists(true);
        exist = true;
      }
    }
    // Till here for Bug 142600

    if (exist) {
      return;
    }

    if (DocToAdd?.trim() !== "") {
      if (DocToAdd.length <= 50) {
        // Added on 27-09-23 for Bug 135569
        if (DocDesc?.trim()?.length <= 255) {
          let maxToDoId = 0;
          docData.DocumentTypeList?.map((doc) => {
            if (+doc.DocTypeId > +maxToDoId) {
              maxToDoId = doc.DocTypeId;
            }
          });
          // Added on 15-01-24 for Bug 142600
          if (button_type === "addAnother") {
            setSpinner({ addAnother: true, addAndClose: false });
          } else {
            setSpinner({ addAnother: false, addAndClose: true });
          }
          // Till here for Bug 142600
          axios
            .post(SERVER_URL + "/addDocType", {
              processDefId: props.openProcessID,
              docTypeName: DocToAdd,
              docTypeId: `${+maxToDoId + 1}`,
              docTypeDesc: encode_utf8(DocDesc),
              sDocType: "D",
              mandatorydoc: mandatorydoc ? "Y" : "N",
            })
            .then((res) => {
              if (res?.data?.Status == 0) {
                let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
                temp.DocumentTypeList.push({
                  DocName: DocToAdd,
                  DocTypeId: `${+maxToDoId + 1}`,
                  Description: DocDesc,
                });
                setlocalLoadedProcessData(temp);
                let addedActivity = [];
                let tempData = { ...docData };
                if (subColumns.length > 0) {
                  subColumns?.forEach((activity) => {
                    addedActivity.push({
                      ActivityId: activity.ActivityId,
                      Add: false,
                      View: false,
                      Modify: false,
                      Delete: false,
                      Download: false,
                      Print: false,
                    });
                  });
                }
                tempData &&
                  tempData.DocumentTypeList.push({
                    DocName: DocToAdd,
                    // Added on 15-01-24 for Bug 142600
                    Description: DocDesc,
                    // Till here for Bug 142600
                    DocTypeId: `${+maxToDoId + 1}`,
                    SetAllChecks: {
                      Add: false,
                      View: false,
                      Modify: false,
                      Delete: false,
                      Download: false,
                      Print: false,
                    },

                    Activities: [...addedActivity],
                  });
                setDocData(tempData);
                // Added on 15-01-24 for Bug 142600
                setSpinner({ addAnother: false, addAndClose: false });
                // Till here for Bug 142600
                // code added on 2 August 2022 for BugId 112251
                if (button_type !== "addAnother") {
                  handleClose();
                  setAddAnotherDoc(false);
                } else if (button_type === "addAnother") {
                  setAddAnotherDoc(true);
                  document
                    .getElementById("pmweb_docType_addDoc_DocNameInput")
                    .focus();
                }
              }
            });
        } else {
          dispatch(
            setToastDataFunc({
              message: `${t("length")} ${t("lengthOfDescriptionLengthLimit")}`,
              severity: "error",
              open: true,
            })
          );
        }
        // Till here for Bug 135569
      } else {
        dispatch(
          setToastDataFunc({
            message: t("docLengthLimit"),
            severity: "error",
            open: true,
          })
        );
        return false;
      }
    } else {
      setShowDocNameError(true);
      document.getElementById("pmweb_docType_addDoc_DocNameInput").focus();
    }
  };

  const deleteDocType = (docName, docId) => {
    axios
      .post(SERVER_URL + "/removeDocType", {
        processDefId: props.openProcessID,
        docTypeName: docName,
        docTypeId: docId,
        sDocType: "D",
      })
      .then((res) => {
        if (res?.data?.Status == 0) {
          // Changes made to solve Bug 122220 - Document>>deleted documents are appearing in call activity for mapping
          setTaskAssociation(res?.data?.Validations);
          if (res?.data?.Validations?.length > 0) {
            setShowDependencyModal(true);
          } else {
            let temp = JSON.parse(JSON.stringify(localLoadedProcessData));
            let tempDocDataProcessJson = temp?.DocumentTypeList?.filter(
              (el) => el.DocTypeId !== docId
            );
            temp.DocumentTypeList = [...tempDocDataProcessJson];
            setlocalLoadedProcessData(temp);
            let tempData = global.structuredClone(docData);
            let tempDocData = tempData.DocumentTypeList.filter(
              (docType) => docType.DocTypeId !== docId
            );
            tempData.DocumentTypeList = [...tempDocData];
            setDocData(tempData);
            handleClose();
          }
        }
      });
  };

  const handleOpen = () => {
    setAddDocModal(true);
  };

  const handleClose = () => {
    setAddDocModal(false);
    setbDocExists(false);
    setShowDocNameError(false);
  };

  const handleActivityModalOpen = (activity_id) => {
    setOpenActivityModal(activity_id);
  };

  const handleActivityModalClose = () => {
    setOpenActivityModal(null);
  };

  const editDescription = (docId, docName, docDesc, mandatory) => {
    setDocNameToModify(docName);
    setDocDescToModify(docDesc);
    setDocIdToModify(docId);
    setIsMandatory(mandatory === "Y" ? true : false);
    handleOpen();
  };

  const modifyDescription = (docName, docDesc, docId) => {
    axios
      .post(SERVER_URL + ENDPOINT_EDIT_DOC, {
        processDefId: props.openProcessID,
        docTypeName: docName,
        docTypeId: docId,
        docTypeDesc: encode_utf8(docDesc),
        sDocType: "D",
      })
      .then((res) => {
        let tempData = { ...docData };
        tempData.DocumentTypeList.map((doc) => {
          doc.Description = docDesc;
        });
        setDocData(tempData);
        handleClose();
      });
  };

  const getActType = (actId) => {
    let actType = null;
    localLoadedProcessData?.MileStones?.forEach((mile) => {
      mile?.Activities?.forEach((act) => {
        if (+act.ActivityId === +actId) {
          actType = act.ActivityType;
        }
      });
    });
    return actType;
  };

  //Reusable function with common code to keep check on fullRightCheckOneActivityArr changing values
  const fullRights_oneActivity_allDocs = (activity_id, newState) => {
    let bFlag = true;
    newState.DocumentTypeList.forEach((docType) => {
      docType.Activities.forEach((activity) => {
        if (+activity.ActivityId === +activity_id) {
          let actType = getActType(activity.ActivityId);
          // modified on 29/10/23 for BugId 138883
          if (+actType !== 2 && +actType !== 3 && docType.DocType !== "C") {
            if (Object.values(activity).includes(false) && bFlag) {
              bFlag = false;
            }
          } else {
            if (!activity["View"] && bFlag) {
              bFlag = false;
            }
          }
        }
      });
    });
    setFullRightCheckOneActivityArr((prevArr) => {
      let temp = [...prevArr];
      temp[activity_id] = bFlag;
      return temp;
    });
  };

  const toggleSingleChecks = (
    check_type,
    doc_idx,
    activity_id,
    checkTypeValue
  ) => {
    // CASE:1 - Single checkBox of any Activity in Any Doc
    let localActivity = {};
    docData.DocumentTypeList[doc_idx]?.Activities.forEach((activity) => {
      if (+activity.ActivityId === +activity_id) {
        localActivity = {
          Add: activity.Add ? "Y" : "N",
          Print: activity.Print ? "Y" : "N",
          Delete: activity.Delete ? "Y" : "N",
          Download: activity.Download ? "Y" : "N",
          View:
            check_type === "Modify" && !checkTypeValue
              ? "Y"
              : activity.View
              ? "Y"
              : "N",
          Modify:
            check_type === "View" && checkTypeValue
              ? "N"
              : activity.Modify
              ? "Y"
              : "N",
        };
      }
    });

    let postBody = !checkTypeValue
      ? {
          processDefId: props.openProcessID,
          check: true,
          pMDocRightsInfoList: [
            {
              docTypeName: docData.DocumentTypeList[doc_idx].DocName,
              docTypeId: docData.DocumentTypeList[doc_idx].DocTypeId,
              pMActRightsList: [
                {
                  actId: activity_id,
                  add: check_type === "Add" ? "Y" : localActivity.Add,
                  delete: check_type === "Delete" ? "Y" : localActivity.Delete,
                  view: check_type === "View" ? "Y" : localActivity.View,
                  modify: check_type === "Modify" ? "Y" : localActivity.Modify,
                  download:
                    check_type === "Download" ? "Y" : localActivity.Download,
                  print: check_type === "Print" ? "Y" : localActivity.Print,
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          check: false,
          pMDocRightsInfoList: [
            {
              docTypeName: docData.DocumentTypeList[doc_idx].DocName,
              docTypeId: docData.DocumentTypeList[doc_idx].DocTypeId,
              pMActRightsList: [
                {
                  actId: activity_id,
                  add: check_type === "Add" ? "N" : localActivity.Add,
                  delete: check_type === "Delete" ? "N" : localActivity.Delete,
                  view: check_type === "View" ? "N" : localActivity.View,
                  modify: check_type === "Modify" ? "N" : localActivity.Modify,
                  download:
                    check_type === "Download" ? "N" : localActivity.Download,
                  print: check_type === "Print" ? "N" : localActivity.Print,
                },
              ],
              add: check_type === "Add" ? "Y" : "N",
              delete: check_type === "Delete" ? "Y" : "N",
              view: check_type === "View" ? "Y" : "N",
              modify: check_type === "Modify" ? "Y" : "N",
              download: check_type === "Download" ? "Y" : "N",
              print: check_type === "Print" ? "Y" : "N",
            },
          ],
        };
    axios.post(SERVER_URL + `/saveRight`, postBody).then((res) => {
      if (res.data.Status === 0) {
      }
    });

    let newState = { ...docData };

    // single-check
    newState.DocumentTypeList[doc_idx].Activities.map((activity) => {
      if (+activity.ActivityId === +activity_id) {
        activity[check_type] = !activity[check_type];
        if (check_type === "Modify" && activity[check_type]) {
          activity["View"] = true;
        }
        if (check_type === "View" && !activity[check_type]) {
          activity["Modify"] = false;
        }
      }
    });

    // set-all check
    let setAllCheck = {
      Add: true,
      View: true,
      Modify: true,
      Delete: true,
      Download: true,
      Print: true,
    };
    newState.DocumentTypeList[doc_idx].Activities.forEach((activity) => {
      let actType = getActType(activity.ActivityId);
      if (+actType !== 2 && +actType !== 3) {
        if (!activity.View) {
          setAllCheck["View"] = false;
        }
        if (!activity.Add) {
          setAllCheck["Add"] = false;
        }
        rightTypes.forEach((actRight) => {
          if (!activity[actRight]) {
            setAllCheck[actRight] = false;
          }
        });
      } else if (+actType === 2 || +actType === 3) {
        if (!activity.View) {
          setAllCheck["View"] = false;
        }
      }
    });
    newState.DocumentTypeList[doc_idx].SetAllChecks = setAllCheck;

    let allChecked = true;
    for (let prop in newState.DocumentTypeList[doc_idx].SetAllChecks) {
      if (!newState.DocumentTypeList[doc_idx].SetAllChecks[prop]) {
        allChecked = false;
        break;
      }
    }
    let arr = [...fullRightCheckOneDocArr];
    arr[doc_idx] = allChecked;
    setFullRightCheckOneDocArr(arr);

    // activity-all check
    fullRights_oneActivity_allDocs(activity_id, newState);
    setDocData(newState);
  };

  const updateActivitySetAllChecks = (
    check_type,
    activity_id,
    checkTypeValue,
    checks,
    setChecks
  ) => {
    // CASE:5 - Giving a particular right (eg:Modify) for one Activity, in all Docs
    let localActivity;
    localActivity = {
      Add: checks.Add ? "Y" : "N",
      Print: checks.Print ? "Y" : "N",
      Delete: checks.Delete ? "Y" : "N",
      Download: checks.Download ? "Y" : "N",
      View:
        check_type === "Modify" && checkTypeValue
          ? "Y"
          : checks.View
          ? "Y"
          : "N",
      Modify:
        check_type === "View" && !checkTypeValue
          ? "N"
          : checks.Modify
          ? "Y"
          : "N",
    };
    let postBody = checkTypeValue
      ? {
          processDefId: props.openProcessID,
          check: true,
          pMDocRightsInfoList: [
            {
              docTypeName: "",
              docTypeId: 0,
              pMActRightsList: [
                {
                  actId: activity_id,
                  add: check_type === "Add" ? "Y" : localActivity.Add,
                  delete: check_type === "Delete" ? "Y" : localActivity.Delete,
                  view: check_type === "View" ? "Y" : localActivity.View,
                  modify: check_type === "Modify" ? "Y" : localActivity.Modify,
                  download:
                    check_type === "Download" ? "Y" : localActivity.Download,
                  print: check_type === "Print" ? "Y" : localActivity.Print,
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          check: false,
          pMDocRightsInfoList: [
            {
              docTypeName: "",
              docTypeId: 0,
              pMActRightsList: [
                {
                  actId: activity_id,
                  add: check_type === "Add" ? "Y" : localActivity.Add,
                  delete: check_type === "Delete" ? "Y" : localActivity.Delete,
                  view: check_type === "View" ? "Y" : localActivity.View,
                  modify: check_type === "Modify" ? "Y" : localActivity.Modify,
                  download:
                    check_type === "Download" ? "Y" : localActivity.Download,
                  print: check_type === "Print" ? "Y" : localActivity.Print,
                },
              ],
              add: check_type == "Add" ? "Y" : "N",
              delete: check_type == "Delete" ? "Y" : "N",
              view: check_type == "View" ? "Y" : "N",
              modify: check_type == "Modify" ? "Y" : "N",
              download: check_type == "Download" ? "Y" : "N",
              print: check_type == "Print" ? "Y" : "N",
            },
          ],
        };
    axios.post(SERVER_URL + `/saveRight`, postBody).then((res) => {
      if (res.status === 200) {
      }
    });

    if (check_type === "Modify" && checkTypeValue === true) {
      setChecks((prev) => {
        return {
          ...prev,
          View: true,
        };
      });
    }
    if (check_type === "View" && checkTypeValue === false) {
      setChecks((prev) => {
        return {
          ...prev,
          Modify: false,
        };
      });
    }

    let newState = { ...docData };
    newState.DocumentTypeList.map((docType) => {
      docType.Activities.map((activity) => {
        if (+activity.ActivityId === +activity_id) {
          activity[check_type] = checkTypeValue;
          if (check_type === "View" && checkTypeValue === false) {
            activity["Modify"] = checkTypeValue;
          }
          if (check_type === "Modify" && checkTypeValue === true) {
            activity["View"] = checkTypeValue;
          }
        }
      });
    });

    // set-all check
    let arr = [...fullRightCheckOneDocArr];
    newState.DocumentTypeList.map((docType, doc_idx) => {
      let setAllCheck = {
        Add: true,
        View: true,
        Modify: true,
        Delete: true,
        Download: true,
        Print: true,
      };
      docType?.Activities?.forEach((activity) => {
        let actType = getActType(activity.ActivityId);
        if (+actType !== 2 && +actType !== 3) {
          if (!activity.View) {
            setAllCheck["View"] = false;
          }
          if (!activity.Add) {
            setAllCheck["Add"] = false;
          }
          rightTypes.forEach((actRight) => {
            if (!activity[actRight]) {
              setAllCheck[actRight] = false;
            }
          });
        } else if (+actType === 2 || +actType === 3) {
          if (!activity.View) {
            setAllCheck["View"] = false;
          }
        }
      });
      newState.DocumentTypeList[doc_idx].SetAllChecks = setAllCheck;

      let allChecked = true;
      for (let prop in setAllCheck) {
        if (!setAllCheck[prop]) {
          allChecked = false;
          break;
        }
      }
      arr[doc_idx] = allChecked;
    });
    setFullRightCheckOneDocArr(arr);

    fullRights_oneActivity_allDocs(activity_id, newState);
    setDocData(newState);
  };

  const updateSetAllChecks = (check_type, doc_idx, checkvalue) => {
    // CASE:3 - Giving a particular right (eg: Modify) for a Single Doc, for all Activities
    let localActivity;

    localActivity = {
      Add: docData.DocumentTypeList[doc_idx].SetAllChecks["Add"] ? "Y" : "N",
      Print: docData.DocumentTypeList[doc_idx].SetAllChecks["Print"]
        ? "Y"
        : "N",
      Delete: docData.DocumentTypeList[doc_idx].SetAllChecks["Delete"]
        ? "Y"
        : "N",
      Modify:
        check_type === "View" && checkvalue
          ? "N"
          : docData.DocumentTypeList[doc_idx].SetAllChecks["Modify"]
          ? "Y"
          : "N",
      View:
        check_type === "Modify" && !checkvalue
          ? "Y"
          : docData.DocumentTypeList[doc_idx].SetAllChecks["View"]
          ? "Y"
          : "N",
      Download: docData.DocumentTypeList[doc_idx].SetAllChecks["Download"]
        ? "Y"
        : "N",
    };

    let postBody = !checkvalue
      ? {
          processDefId: props.openProcessID,
          check: true,
          pMDocRightsInfoList: [
            {
              docTypeName: docData.DocumentTypeList[doc_idx].DocName,
              docTypeId: docData.DocumentTypeList[doc_idx].DocTypeId,
              pMActRightsList: [
                {
                  actId: 0,
                  add: check_type == "Add" ? "Y" : localActivity.Add,
                  delete: check_type == "Delete" ? "Y" : localActivity.Delete,
                  view: check_type == "View" ? "Y" : localActivity.View,
                  modify: check_type == "Modify" ? "Y" : localActivity.Modify,
                  download:
                    check_type == "Download" ? "Y" : localActivity.Download,
                  print: check_type == "Print" ? "Y" : localActivity.Print,
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          check: false,
          pMDocRightsInfoList: [
            {
              docTypeName: docData.DocumentTypeList[doc_idx].DocName,
              docTypeId: docData.DocumentTypeList[doc_idx].DocTypeId,
              pMActRightsList: [
                {
                  actId: 0,
                  add: check_type == "Add" ? "N" : localActivity.Add,
                  delete: check_type == "Delete" ? "N" : localActivity.Delete,
                  view: check_type == "View" ? "N" : localActivity.View,
                  modify: check_type == "Modify" ? "N" : localActivity.Modify,
                  download:
                    check_type == "Download" ? "N" : localActivity.Download,
                  print: check_type == "Print" ? "N" : localActivity.Print,
                },
              ],
              add: check_type == "Add" ? "Y" : "N",
              delete: check_type == "Delete" ? "Y" : "N",
              view: check_type == "View" ? "Y" : "N",
              modify: check_type == "Modify" ? "Y" : "N",
              download: check_type == "Download" ? "Y" : "N",
              print: check_type == "Print" ? "Y" : "N",
            },
          ],
        };
    axios.post(SERVER_URL + `/saveRight`, postBody).then((res) => {
      if (res.data.Status === 0) {
      }
    });

    let newState = { ...docData };
    //set-all
    newState.DocumentTypeList[doc_idx].SetAllChecks[check_type] = !checkvalue;

    if (check_type === "Modify" && !checkvalue) {
      newState.DocumentTypeList[doc_idx].Activities.map((activity) => {
        activity["View"] = !checkvalue;
      });
      newState.DocumentTypeList[doc_idx].SetAllChecks["View"] = !checkvalue;
    } else if (check_type === "View" && checkvalue) {
      newState.DocumentTypeList[doc_idx].Activities.map((activity) => {
        activity["Modify"] = false;
      });
      newState.DocumentTypeList[doc_idx].SetAllChecks["Modify"] = false;
    }

    //-----
    let localActArr = new Map();
    newState?.DocumentTypeList?.map((docType, index) => {
      docType.Activities?.map((activity) => {
        if (+doc_idx === +index) {
          activity[check_type] = !checkvalue;
        }
        let localActivityArrVal = true;
        let actType = getActType(activity.ActivityId);
        // modified on 29/10/23 for BugId 138883
        if (+actType !== 2 && +actType !== 3 && docType.DocType !== "C") {
          if (Object.values(activity).includes(false)) {
            localActivityArrVal = false;
          } else {
            if (localActArr.get(activity.ActivityId) !== false) {
              localActivityArrVal = true;
            } else {
              localActivityArrVal = false;
            }
          }
        } else {
          if (!activity["View"] && localActArr.get(activity.ActivityId)) {
            localActivityArrVal = false;
          } else {
            if (localActArr.get(activity.ActivityId) === undefined) {
              localActivityArrVal = activity["View"];
            } else if (localActArr.get(activity.ActivityId) !== false) {
              localActivityArrVal = true;
            } else {
              localActivityArrVal = false;
            }
          }
        }
        localActArr.set(activity.ActivityId, localActivityArrVal);
      });
    });
    let fullRightArr = [...fullRightCheckOneActivityArr];
    localActArr?.forEach((act, actVal) => {
      fullRightArr[actVal] = act;
    });
    setFullRightCheckOneActivityArr(fullRightArr);

    //------
    let allChecked = true;
    for (let prop in newState.DocumentTypeList[doc_idx].SetAllChecks) {
      if (!newState.DocumentTypeList[doc_idx].SetAllChecks[prop]) {
        allChecked = false;
        break;
      }
    }
    let arr = [...fullRightCheckOneDocArr];
    arr[doc_idx] = allChecked;
    setFullRightCheckOneDocArr(arr);
    setDocData(newState);
  };

  const GiveCompleteRights = (index) => {
    // CASE:2 - Giving all rights to one Doc for all Activities
    let postBody = fullRightCheckOneDocArr[index]
      ? {
          processDefId: props.openProcessID,
          check: false,
          pMDocRightsInfoList: [
            {
              docTypeName: docData.DocumentTypeList[index].DocName,
              docTypeId: docData.DocumentTypeList[index].DocTypeId,
              pMActRightsList: [
                {
                  actId: 0,
                  add: "N",
                  delete: "N",
                  view: "N",
                  modify: "N",
                  download: "N",
                  print: "N",
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          check: true,
          pMDocRightsInfoList: [
            {
              docTypeName: docData.DocumentTypeList[index].DocName,
              docTypeId: docData.DocumentTypeList[index].DocTypeId,
              pMActRightsList: [
                {
                  actId: 0,
                  add: "Y",
                  delete: "Y",
                  view: "Y",
                  modify: "Y",
                  download: "Y",
                  print: "Y",
                },
              ],
            },
          ],
        };
    axios.post(SERVER_URL + `/saveRight`, postBody).then((res) => {
      if (res.data.Status === 0) {
      }
    });
    let fullRightCheck = !fullRightCheckOneDocArr[index];
    let newState = { ...docData };
    newState.DocumentTypeList[index].SetAllChecks = {
      Add: fullRightCheck,
      View: fullRightCheck,
      Modify: fullRightCheck,
      Delete: fullRightCheck,
      Download: fullRightCheck,
      Print: fullRightCheck,
    };
    newState.DocumentTypeList[index].Activities.map((activity) => {
      giveCompleteRights(fullRightCheck, activity);
    });

    let arr = [...fullRightCheckOneDocArr];
    arr[index] = fullRightCheck;
    setFullRightCheckOneDocArr(arr);

    let localActArr = new Map();
    newState.DocumentTypeList?.forEach((docType) => {
      docType.Activities?.forEach((activity) => {
        let localActivityArrVal = true;
        let actType = getActType(activity.ActivityId);
        // modified on 29/10/23 for BugId 138883
        if (+actType !== 2 && +actType !== 3 && docType.DocType !== "C") {
          if (Object.values(activity).includes(false)) {
            localActivityArrVal = false;
          } else {
            if (localActArr.get(activity.ActivityId) !== false) {
              localActivityArrVal = true;
            } else {
              localActivityArrVal = false;
            }
          }
        } else {
          if (!activity["View"] && localActArr.get(activity.ActivityId)) {
            localActivityArrVal = false;
          } else {
            if (localActArr.get(activity.ActivityId) === undefined) {
              localActivityArrVal = activity["View"];
            } else if (localActArr.get(activity.ActivityId) !== false) {
              localActivityArrVal = true;
            } else {
              localActivityArrVal = false;
            }
          }
        }
        localActArr.set(activity.ActivityId, localActivityArrVal);
      });
    });

    let fullRightArr = [...fullRightCheckOneActivityArr];
    localActArr?.forEach((act, actVal) => {
      fullRightArr[actVal] = act;
    });
    setFullRightCheckOneActivityArr(fullRightArr);

    setDocData(newState);
  };

  const GiveCompleteRightsToOneActivity = (activityId) => {
    // CASE:4 - Giving full Rights to one Activity in all Docs
    let postBody = !fullRightCheckOneActivityArr[activityId]
      ? {
          processDefId: props.openProcessID,
          check: true,
          pMDocRightsInfoList: [
            {
              docTypeName: "",
              docTypeId: "0",
              pMActRightsList: [
                {
                  actId: activityId,
                  add: "Y",
                  delete: "Y",
                  view: "Y",
                  modify: "Y",
                  download: "Y",
                  print: "Y",
                },
              ],
            },
          ],
        }
      : {
          processDefId: props.openProcessID,
          check: false,
          pMDocRightsInfoList: [
            {
              docTypeName: "",
              docTypeId: "0",
              pMActRightsList: [
                {
                  actId: activityId,
                  add: "N",
                  delete: "N",
                  view: "N",
                  modify: "N",
                  download: "N",
                  print: "N",
                },
              ],
            },
          ],
        };
    axios.post(SERVER_URL + `/saveRight`, postBody).then((res) => {
      if (res.status === 0) {
      }
    });

    let fullRightCheck = !fullRightCheckOneActivityArr[activityId];
    let docArr = [...fullRightCheckOneDocArr];
    let newState = { ...docData };
    newState.DocumentTypeList.map((type, doc_idx) => {
      let setAllCheck = {
        Add: true,
        View: true,
        Modify: true,
        Delete: true,
        Download: true,
        Print: true,
      };
      let allChecked = true;
      type.Activities.map((activity) => {
        if (+activity.ActivityId === +activityId) {
          giveCompleteRights(fullRightCheck, activity);
        }
        let actType = getActType(activity.ActivityId);
        if (+actType !== 2 && +actType !== 3) {
          if (!activity.View) {
            setAllCheck["View"] = false;
          }
          if (!activity.Add) {
            setAllCheck["Add"] = false;
          }
          rightTypes.forEach((actRight) => {
            if (!activity[actRight]) {
              setAllCheck[actRight] = false;
            }
          });
        } else if (+actType === 2 || +actType === 3) {
          if (!activity.View) {
            setAllCheck["View"] = false;
          }
        }
      });
      type.SetAllChecks = setAllCheck;
      for (let prop in setAllCheck) {
        if (!setAllCheck[prop]) {
          allChecked = false;
          break;
        }
      }
      docArr[doc_idx] = allChecked;
    });
    setFullRightCheckOneDocArr(docArr);

    let arr = [...fullRightCheckOneActivityArr];
    arr[activityId] = fullRightCheck;
    setFullRightCheckOneActivityArr(arr);
    setDocData(newState);
  };

  let filteredDocTypes =
    docData.DocumentTypeList &&
    docData.DocumentTypeList.filter((docType) => {
      if (docSearchTerm.trim() === "") {
        return docData.DocumentTypeList;
      } else if (
        docType.DocName.toLowerCase().includes(
          docSearchTerm.toLowerCase().trim()
        )
      ) {
        return docData.DocumentTypeList;
      }
    });

  let filteredActivities = splicedColumns.filter((act) => {
    if (activitySearchTerm.trim() === "") {
      return act;
    } else if (
      act.ActivityName.toLowerCase().includes(
        activitySearchTerm.toLowerCase().trim()
      )
    ) {
      return act;
    }
  });

  const GetActivities = () => {
    let display = [];
    filteredActivities.length === 0
      ? display.push(
          // <div
          //   style={{
          //     display: "flex",
          //     justifyContent: "center",
          //     flexDirection: "column",
          //     alignItems: "center",
          //     marginTop: "8%",
          //   }}
          // >
          //   <img
          //     src={NoResultFound}
          //     // className="noSearchResultImage" // Commented for Bug 127582
          //     style={{ height: "18rem" }}
          //     alt={t("noResultsFound")}
          //   />
          //   <p
          //     style={{
          //       // top: "70%", // Commented for Bug 127582
          //       marginTop: "-25px",
          //       marginLeft: "28px",
          //       fontSize: "var(--base_text_font_size)",
          //       // left: "56%", // Commented for Bug 127582
          //       // position: "absolute", // Commented for Bug 127582
          //       // textAlign: "center", // Commented for Bug 127582
          //     }}
          //   >
          //     {t("noSearchResult")}
          //   </p>
          // </div>
          <Grid
            container
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              <Grid
                container
                // direction="column"
                justifyContent="center"
                alignItems="center"
                // style={{ paddingLeft: "25vw" }}
              >
                <Grid item>
                  <img
                    src={NoResultFound}
                    alt={t("noResultsFound")}
                    style={{
                      height: "30vh",
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <span>{t("noSearchResult")}</span>
            </Grid>
          </Grid>
          //Till here for bug 139544
        )
      : filteredActivities.map((activity, index) => {
          display.push(
            <div
              className="activities"
              // style={{ width: compact ? "14rem" : "14.5rem" }}
            >
              <div
                style={{
                  backgroundColor: "white",
                  height: "3.56rem",
                  //width: "17rem", // code edited on 27 Dec 2022 for BugId 120743
                  // Bug 121588 - Safari browser>>Todo/exception/document>>outline of rights are little distorted
                  //[25-03-2023] Removed the width:17rem and added minWidth: 17rem
                  minWidth: "17rem",
                  borderBottom: "1px solid rgb(218, 208, 194)",
                  display: "flex",
                  fontSize: "var(--base_text_font_size)",
                  padding: "0px 10px",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* code edited on 27 Dec 2022 for BugId 120743 */}
                {/* <span className="actHeaderName">{activity.ActivityName}</span> */}
                <FormControlLabel
                  style={{ flexDirection: "row-reverse" }}
                  label={activity.ActivityName}
                  control={<Checkbox tabIndex={0} />}
                  id={`pmweb_masterCheck_oneActivity_docTypes_${
                    activity.ActivityName
                  }_${uuidv4()}`}
                  checked={
                    fullRightCheckOneActivityArr[activity.ActivityId]
                      ? true
                      : false
                  }
                  disabled={isReadOnly || processType !== "L" ? true : false}
                  onChange={() =>
                    GiveCompleteRightsToOneActivity(activity.ActivityId)
                  }
                  tabIndex={-1}
                  // ref={allRightstoActivityRef}
                  ref={(item) => (allRightstoActivityRef.current[index] = item)}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") {
                      allRightstoActivityRef.current[index].click();
                      e.stopPropagation();
                    }
                  }}
                />
                {isReadOnly || processType !== "L" ? null : (
                  <React.Fragment>
                    <IconButton
                      id={`oneActivity_particularRight_docTypes_${
                        activity.ActivityName
                      }__${uuidv4()}`}
                      className="iconButton"
                      onClick={() =>
                        handleActivityModalOpen(activity.ActivityId)
                      }
                      tabIndex={0}
                      onKeyUp={(e) => {
                        if (e.key === "Enter") {
                          handleActivityModalOpen(activity.ActivityId);
                          e.stopPropagation();
                        }
                      }}
                      aria-label={`${activity?.ActivityName} Manage Rights`}
                      disableFocusRipple
                      disableTouchRipple
                    >
                      <img
                        src={manageRights}
                        alt="ManageRights"
                        style={{ height: "10px", width: "10px" }}
                      />
                    </IconButton>
                    {openActivityModal === activity.ActivityId && (
                      <FocusTrap
                        open={openActivityModal === activity.ActivityId}
                      >
                        <div className="relative">
                          <Backdrop
                            show={openActivityModal === activity.ActivityId}
                            clicked={handleActivityModalClose}
                          />
                          <ActivityModal
                            compact={compact}
                            fullRightCheckOneActivity={
                              fullRightCheckOneActivityArr[activity.ActivityId]
                            }
                            activityType={activity.ActivityType}
                            activityIndex={index}
                            activityId={activity.ActivityId}
                            updateActivitySetAllChecks={
                              updateActivitySetAllChecks
                            }
                            type={"set-all"}
                            docTypeList={docData}
                            handleClose={handleActivityModalClose} //Need for Escape
                          />
                        </div>
                      </FocusTrap>
                    )}
                  </React.Fragment>
                )}
              </div>

              {filteredDocTypes &&
                filteredDocTypes?.map((type, index) => {
                  return (
                    <div
                      className="oneActivityColumn"
                      style={{
                        backgroundColor: index % 2 == 0 ? "#F2F2F2" : "white",
                        padding:
                          "27.25px 0 5px" /*code changes on 3 August 2022 for BugId 112560*/,
                        paddingInlineStart: "1vw",
                        borderBottom: "1px solid #C2B8A3",
                        // width: compact ? "12rem" : "12.51875rem",
                        height: "9rem", //added on 24-01-2024 for bug_id: 141903
                      }}
                    >
                      <CheckBoxes //activity CheckBoxes
                        processType={processType}
                        compact={compact}
                        title={activity?.ActivityName}
                        activityIndex={index}
                        DocType={type.DocType}
                        activityId={activity.ActivityId}
                        docTypeList={docData}
                        activityType={activity.ActivityType}
                        subActivity={activity.ActivitySubType}
                        toggleSingleChecks={toggleSingleChecks}
                        disabled={isReadOnly}
                        ariaDescription={`Doc Name: ${type.DocName} Activity Name: ${activity?.ActivityName}`}
                      />
                    </div>
                  );
                })}
            </div>
          );
        });
    return display;
  };

  if (isLoading) {
    return <CircularProgress className="circular-progress" />;
  } else
    return docData?.DocumentTypeList &&
      docData?.DocumentTypeList?.length > 0 ? (
      <>
        <div
          className="DocTypes"
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            height: `calc(${windowInnerHeight}px - ${headerHeight})`,
          }}
        >
          {/*Code updated on 15 December 2022 for BugId 116647*/}
          <div className="oneDocDiv">
            <div className="docNameDiv" role="tablist">
              <p
                className={
                  selectedTab === "screenHeading"
                    ? "selectedBottomBorder screenHeading"
                    : "screenHeading"
                }
                style={{
                  margin:
                    direction !== RTL_DIRECTION ? "0 0.5vw 0 0" : "0 0 0 0.5vw",
                  padding: "1px 0.5vw",
                }}
                onClick={(e) => tabChangeHandler(e, "screenHeading")}
                tabIndex={0}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    tabChangeHandler(e, "screenHeading");
                    e.stopPropagation();
                  }
                }}
                id={`pmweb_docTypes_tab_${t("docTypes")}`}
                role="tab"
                aria-selected={selectedTab === "screenHeading"}
              >
                {t("docTypes")}
              </p>
              <p
                className={
                  selectedTab === "rules"
                    ? "selectedBottomBorder Rules"
                    : "Rules"
                }
                style={{
                  padding: "1px 1vw",
                }}
                onClick={(e) => tabChangeHandler(e, "rules")}
                tabIndex={0}
                onKeyUp={(e) => {
                  if (e.key === "Enter") {
                    tabChangeHandler(e, "rules");
                    e.stopPropagation();
                  }
                }}
                id={`pmweb_docTypes_tab_${t("rules")}`}
                role="tab"
                aria-selected={selectedTab === "rules"}
              >
                {t("rules")}
              </p>
            </div>
            {selectedTab == "screenHeading" ? (
              <React.Fragment>
                <div
                  className="docSearchDiv"
                  style={{
                    // modified on 24/1/2024 for bug_id: 141903
                    // margin: "7px 0 4.5px",
                    margin: "8px 0 4.5px",
                    // till here for bug_id: 141903
                  }}
                >
                  <div
                    className="searchBarNFilterInterface"
                    style={{ width: "100%" }}
                  >
                    <div className="docSearchBar" style={{ flex: "2.5" }}>
                      <SearchProject
                        title={"docTypes"}
                        setSearchTerm={setDocSearchTerm}
                        placeholder={t("search")}
                        // width="240px"
                        width="100%"
                        ariaDescription={"Document List"}
                      />
                    </div>
                    {isReadOnly || processType !== "L" ? null : (
                      <p
                        id="pmweb_docTypes_tab_addBtN"
                        style={{ flex: "1" }}
                        className="addGroupButton"
                        onClick={() => {
                          setDocNameToModify(null);
                          setDocDescToModify(null);
                          setDocIdToModify(null);
                          handleOpen();
                        }}
                        tabIndex={0}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            setDocNameToModify(null);
                            setDocDescToModify(null);
                            setDocIdToModify(null);
                            handleOpen();
                            e.stopPropagation();
                          }
                        }}
                        aria-description="Add a Document"
                      >
                        {t("addDataObject")}
                      </p>
                    )}
                    <Modal
                      open={addDocModal}
                      // onClose={handleClose}  //Changes made to solve Bug 114592
                      aria-label="simple-modal-title"
                      aria-description="simple-modal-description"
                    >
                      <AddDocType
                        addDocToList={addDocToList}
                        handleClose={handleClose}
                        bDocExists={bDocExists}
                        setbDocExists={setbDocExists}
                        showDocNameError={showDocNameError}
                        setShowDocNameError={setShowDocNameError}
                        docData={docData}
                        modifyDescription={modifyDescription}
                        docDescToModify={docDescToModify}
                        docNameToModify={docNameToModify}
                        docIdToModify={docIdToModify}
                        addAnotherDoc={addAnotherDoc}
                        setAddAnotherDoc={setAddAnotherDoc}
                        isMandatory={isMandatory}
                        spinner={spinner}
                        isReadOnly={isReadOnly}
                      />
                    </Modal>
                  </div>
                </div>
                {filteredDocTypes &&
                  filteredDocTypes.map((type, index) => {
                    return (
                      <div
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#F2F2F2" : "white",
                          padding: "10px",
                          paddingBottom: "5px",
                          paddingInlineEnd: "14px",
                          borderBottom: "1px solid #C2B8A3",
                          height: "9rem", //added on 24-01-2024 for bug_id: 141903
                        }}
                      >
                        <div
                          className="activityNameDivDocs"
                          style={{
                            justifyContent: "space-between",
                            display: "flex",
                            textAlign:
                              direction === RTL_DIRECTION ? "right" : "left",
                            position: "relative",
                          }}
                        >
                          <div className="docName">
                            <LightTooltip
                              id="pmweb_docType_doc_Tooltip"
                              arrow={true}
                              enterDelay={500}
                              placement="bottom-start"
                              title={type.DocName}
                            >
                              <span
                                style={{
                                  flex: "0.75",
                                  // overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  // textOverflow: "ellipsis",
                                }}
                              >
                                {shortenRuleStatement(type?.DocName, 10)}
                              </span>
                            </LightTooltip>
                            <FormControlLabel
                              style={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                              id={`pmweb_docType_masterCheck_oneDoc_allRightsText_${uuidv4()}`}
                              tabIndex={-1}
                              ref={(item) =>
                                (allRightRef.current[index] = item)
                              }
                              onKeyUp={(e) => {
                                if (e.key === "Enter") {
                                  allRightRef.current[index].click();
                                  e.stopPropagation();
                                }
                              }}
                              control={
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                  }}
                                >
                                  <Checkbox
                                    id={`pmweb_docType_masterCheck_oneDoc_checkbox_${uuidv4()}`}
                                    name="checkedF"
                                    style={{
                                      marginTop: "0.125rem",
                                      marginLeft: "1vw",
                                    }}
                                    checked={
                                      fullRightCheckOneDocArr[index]
                                        ? true
                                        : false
                                    }
                                    disabled={
                                      isReadOnly ||
                                      processType !== "L" ||
                                      type.DocType === "C"
                                        ? true
                                        : false
                                    }
                                    onChange={() => GiveCompleteRights(index)}
                                    tabIndex={0}
                                    aria-description={`Doc Name: ${type?.DocName}`}
                                  />
                                  <p
                                    className="allRightsText"
                                    disabled={isReadOnly}
                                  >
                                    {/* Changes on 12-09-23 to resolve the bug Id 136555 */}
                                    {t("allRights")}
                                  </p>
                                </div>
                              }
                            />
                          </div>
                          {compact && processType === "L" ? (
                            <div className="relative">
                              <ArrowUpwardIcon
                                style={{ cursor: "pointer", flex: "1" }}
                                type="button"
                                onClick={() =>
                                  handleActivityModalOpen(type.DocTypeId)
                                }
                                tabIndex={0}
                                onKeyUp={(e) => {
                                  if (e.key === "Enter") {
                                    handleActivityModalOpen(type.DocTypeId);
                                    e.stopPropagation();
                                  }
                                }}
                                id={`pmweb_docTypes_arrorIcon_${uuidv4()}`}
                                disabled={isReadOnly}
                              />
                              {openActivityModal === type.DocTypeId && (
                                <React.Fragment>
                                  <Backdrop
                                    show={openActivityModal === type.DocTypeId}
                                    clicked={handleActivityModalClose}
                                  />
                                  <div
                                    style={{
                                      position: "absolute",
                                      backgroundColor: "white",
                                      top: "0px",
                                      left: "50%",
                                      zIndex: "700",
                                      padding: "5px",
                                      height: "36px",
                                      width: "256px",
                                    }}
                                  >
                                    <CheckBoxes //setAll CheckBoxes
                                      processType={processType}
                                      docIdx={index}
                                      docData={docData}
                                      id={type.ActivityId}
                                      type={"set-all"}
                                      compact={compact}
                                      title={index}
                                      DocType={type.DocType}
                                      updateSetAllChecks={updateSetAllChecks}
                                      disabled={isReadOnly}
                                      ariaDescription={`Doc Name: ${type?.DocName}`}
                                    />
                                  </div>
                                </React.Fragment>
                              )}
                            </div>
                          ) : null}
                          {/*code edited on 29 July 2022 for BugId 112401 and BugId 112404*/}
                          {processType === "L" && !isReadOnly ? (
                            <DeleteDocModal
                              disabled={isReadOnly}
                              backDrop={false}
                              modalPaper="modalPaperActivity"
                              sortByDiv="sortByDivActivity"
                              oneSortOption="oneSortOptionActivity"
                              docIndex={index}
                              isArabic={
                                direction === RTL_DIRECTION ? true : false
                              }
                              closeOnClick={true}
                              hideRelative={true}
                              style={{
                                position: "absolute",
                                right:
                                  direction === RTL_DIRECTION
                                    ? "unset"
                                    : "-11px",
                                left:
                                  direction === RTL_DIRECTION
                                    ? "-11px"
                                    : "unset",
                                top: "-8.5px",
                              }}
                              // tabIndex={0} // code added on 2 Dec 2022 for BugId 109970
                              buttonToOpenModal={
                                <IconButton
                                  className="threeDotsButton"
                                  style={{ marginTop: "0.25rem" }}
                                  disabled={isReadOnly}
                                  id={`pmweb_docTypes_threeDotBtn_${uuidv4()}`}
                                  aria-label={`Doc Name: ${type?.DocName} Menu Popper`}
                                  disableFocusRipple
                                  disableTouchRipple
                                >
                                  <MoreVertIcon
                                    style={{
                                      color: "#606060",
                                      height: "16px",
                                      width: "16px",
                                    }}
                                  />
                                </IconButton>
                              }
                              modalWidth="180"
                              sortSectionOne={[
                                <p
                                  id={`pmweb_docType_deleteDocOption_${uuidv4()}`}
                                  onClick={() =>
                                    deleteDocType(type.DocName, type.DocTypeId)
                                  }
                                  style={{ width: "100%" }}
                                  tabIndex={0}
                                  onKeyUp={(e) => {
                                    if (e.key === "Enter") {
                                      deleteDocType(
                                        type.DocName,
                                        type.DocTypeId
                                      );
                                      e.stopPropagation();
                                    }
                                  }}
                                >
                                  {t("delete")}
                                </p>,
                                <p
                                  id={`pmweb_docType_viewyDocOption_${uuidv4()}`}
                                  onClick={() =>
                                    editDescription(
                                      type.DocTypeId,
                                      type.DocName,
                                      type.Description,
                                      type.Mandatory
                                    )
                                  }
                                  style={{ width: "100%" }}
                                  tabIndex={0}
                                  onKeyUp={(e) => {
                                    if (e.key === "Enter") {
                                      editDescription(
                                        type.DocTypeId,
                                        type.DocName,
                                        type.Description,
                                        type.Mandatory
                                      );
                                      e.stopPropagation();
                                    }
                                  }}
                                >
                                  {t("view")}
                                </p>,
                              ]}
                            />
                          ) : null}
                        </div>
                        <div style={{ display: "flex" }}>
                          <div className="docDescription">
                            <LightTooltip
                              id="pmweb_doctType_doc_Tooltip"
                              arrow={true}
                              enterDelay={500}
                              placement="bottom-start"
                              title={decode_utf8(type?.Description)}
                            >
                              <span>
                                {shortenRuleStatement(
                                  decode_utf8(type?.Description),
                                  13
                                )}
                              </span>
                            </LightTooltip>
                          </div>
                          {compact ? null : (
                            <CheckBoxes //setAll CheckBoxes
                              processType={processType}
                              compact={compact}
                              title={index}
                              docIdx={index}
                              docData={docData}
                              id={type.ActivityId}
                              type={"set-all"}
                              DocType={type.DocType}
                              updateSetAllChecks={updateSetAllChecks}
                              disabled={isReadOnly}
                              ariaDescription={`Doc Name: ${type?.DocName}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
              </React.Fragment>
            ) : null}
          </div>
          {/*code added on 8 June 2022 for BugId 110212*/}
          {selectedTab == "screenHeading" ? (
            <div className="activitySideDiv">
              <div className="activityHeadingDiv" style={{ width: "100%" }}>
                <p className="activitySideHeading" style={{ flex: "1" }}>
                  {t("rightsOnActivities")}
                </p>
                <div className="actvitySearchDiv">
                  <SearchProject
                    setSearchTerm={setActivitySearchTerm}
                    placeholder={t("search")}
                    width="100%"
                    title={"docType_activitySearch"}
                    ariaDescription={"Activity List"}
                  />
                </div>
              </div>
              {/* ----------------------------------------------------------- */}
              <div>
                {filteredDocTypes?.length > 0 ? (
                  <div
                    className="oneDocBox"
                    id="oneBoxMatrix"
                    style={{
                      display: "flex",
                      // flexDirection: "row", code commented on 16-10-23 for bug 139544
                      alignItems:
                        filteredActivities.length === 0 ? "center" : "start",
                      marginTop: filteredActivities.length === 0 ? "8%" : "0%",
                    }}
                  >
                    {/**code added for bugid 138347 */}
                    {/* code modified on 29-10-23 for bug 139544 added condition in min-width to handle scroller no result found image  */}
                    <div
                      style={{
                        display: "flex",
                        minWidth: filteredActivities.length === 0 ? "" : "101%",
                      }}
                    >
                      {GetActivities()}
                    </div>
                  </div>
                ) : (
                  //code modified on 16-10-23 added Grid component for bug 139544
                  // <div
                  //   style={{
                  //     display: "flex",
                  //     justifyContent: "center",
                  //     flexDirection: "column",
                  //     alignItems: "center",
                  //     marginTop: "8%",
                  //   }}
                  // >
                  //   <img
                  //     src={NoResultFound}
                  //     style={{ height: "18rem" }}
                  //     alt={t("noResultsFound")}
                  //   />
                  //   <p
                  //     style={{
                  //       fontSize: "var(--base_text_font_size)",
                  //     }}
                  //   >
                  //     {t("noSearchResult")}
                  //   </p>
                  // </div>
                  <Grid
                    container
                    direction="column"
                    justifyContent="center"
                    alignItems="center"
                    spacing={2}
                  >
                    <Grid item>
                      <Grid
                        container
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                        style={{ paddingTop: "20vh" }}
                      >
                        <Grid item>
                          <img
                            src={NoResultFound}
                            alt={t("noResultsFound")}
                            style={{
                              height: "23vh",
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item>
                      <span>{t("noSearchResult")}</span>
                    </Grid>
                  </Grid>
                  //Till here for bug 139544
                )}
              </div>
              {/* ------------------------------------------------------------------- */}
            </div>
          ) : (
            <Rules
              ruleDataType={docArray}
              interfaceRules={docAllRules}
              setInterfaceRules={setDocAllRules}
              ruleType="D"
              ruleDataTableStatement={t("doctypeRemoveRecords")}
              addRuleDataTableStatement={t("doctypeAddRecords")}
              ruleDataTableHeading={t("docList")}
              addRuleDataTableHeading={t("availableDoc")}
              bShowRuleData={true}
              hideGroup={true}
              listName={t("docList")}
              availableList={t("availableDoc")}
              openProcessType={processType}
              isReadOnly={isReadOnly}
              calledFrom="doc"
            />
          )}
        </div>
        {showDependencyModal ? (
          <DefaultModal
            show={showDependencyModal}
            style={{
              width: "45vw",
              left: "28%",
              top: "21.5%",
              padding: "0",
            }}
            modalClosed={() => setShowDependencyModal(false)}
            children={
              <ObjectDependencies
                {...props}
                processAssociation={taskAssociation}
                cancelFunc={() => setShowDependencyModal(false)}
              />
            }
          />
        ) : null}
      </>
    ) : (
      <div className="noDocTypesScreen">
        {/*code edited on 17 Dec 2022 for BugId 120527 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={EmptyStateIcon}
            alt={t("emptyState")}
            style={{
              width: "9rem",
              height: "9rem",
              marginBottom: "0.5rem",
            }}
          />
          <p
            style={{
              fontSize: "var(--base_text_font_size)",
            }}
          >
            {t("noDocMessage")}
          </p>
          {!isReadOnly && (
            <p
              style={{
                fontSize: "var(--base_text_font_size)",
                marginTop: "0.25rem",
              }}
            >
              {t("pleaseCreateDocType")}
            </p>
          )}
          {!isReadOnly && (
            <div
              className="alignCenter"
              style={{ justifyContent: "center", marginTop: "1rem" }}
            >
              <button className="createDocBtn" onClick={handleOpen}>
                {t("createDocTypes")}
              </button>
            </div>
          )}
        </div>
        <Modal
          open={addDocModal}
          onClose={handleClose}
          aria-label="simple-modal-title"
          aria-description="simple-modal-description"
        >
          <AddDocType
            addDocToList={addDocToList}
            handleClose={handleClose}
            bDocExists={bDocExists}
            showDocNameError={showDocNameError}
            setShowDocNameError={setShowDocNameError}
            spinner={spinner}
            isReadOnly={isReadOnly}
          />
        </Modal>
      </div>
    );
}

const mapStateToProps = (state) => {
  return {
    openProcessID: state.openProcessClick.selectedId,
    openProcessName: state.openProcessClick.selectedProcessName,
    openProcessType: state.openProcessClick.selectedType,
  };
};

export default connect(mapStateToProps, null)(DocType);
