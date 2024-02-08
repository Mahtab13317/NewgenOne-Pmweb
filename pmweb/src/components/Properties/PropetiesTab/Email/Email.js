import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "./index.css";
import Tabs from "../../../../UI/Tab/Tab.js";
import EmailTab from "./EmailTab.js";
import Fax from "./Fax.js";
import Print from "./Print.js";
import TabsHeading from "../../../../UI/TabsHeading";
import axios from "axios";
import {
  ENDPOINT_GET_REGISTER_TEMPLATE,
  SERVER_URL,
  propertiesLabel,
} from "../../../../Constants/appConstants";
import { CircularProgress } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { setActivityPropertyChange } from "../../../../redux-store/slices/ActivityPropertyChangeSlice";
import {
  ActivityPropertySaveCancelValue,
  setSave,
} from "../../../../redux-store/slices/ActivityPropertySaveCancelClicked";
import { store, useGlobalState } from "state-pool";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import _ from "lodash";
import { PMWEB_REGEX, validateRegex } from "../../../../validators/validator";

function Email(props) {
  let { t } = useTranslation();
  const [templateDoc, setTemplateDoc] = useState([]);
  const [spinner, setSpinner] = useState(true);
  const [currOpenTab, setCurrOpenTab] = useState(0); //Bug 123919 :state to set the Tab value
  const saveCancelStatus = useSelector(ActivityPropertySaveCancelValue); //Bug 123919
  const globalActivityData = store.getState("activityPropertyData"); //Bug 123919
  const [localActivityPropertyData, setLocalActivityPropertyData] =
    useGlobalState(globalActivityData); //Bug 123919: State that stores the local activity property data.
  const dispatch = useDispatch();

  // code added on 13 Jan 2023 for BugId 122384
  useEffect(() => {
    axios
      .get(SERVER_URL + ENDPOINT_GET_REGISTER_TEMPLATE)
      .then((res) => {
        let docArr = [];
        res.data?.forEach((element) => {
          if (!docArr.includes(element.docName)) {
            docArr.push(element.docName);
          }
        });
        setTemplateDoc(docArr);
        setSpinner(false);
      })
      .catch((err) => {
        console.log(err);
        setSpinner(false);
      });
  }, []);

  /*Bug 123919 - safari>>email>>getting error in saving email property
  [27-03-2023] Added the function to validateEmail */
  const validateEmail = (name) => {
    // modified on 21/10/23 for BugId 139644
    if (!validateRegex(name, PMWEB_REGEX.EmailId)) {
      return false;
    } else {
      return true;
    }
  };

  /*Bug 123919 - safari>>email>>getting error in saving email property
  [27-03-2023] Added the function to handle Invalid Email*/
  const handleInvalidEmailToast = () => {
    dispatch(
      setToastDataFunc({
        message: t("pleaseEnterAValidEmail"),
        severity: "error",
        open: true,
      })
    );
  };

  /*Bug 123919 - safari>>email>>getting error in saving email property
  [27-03-2023] Added the function to handle error*/
  const handleToast = () => {
    dispatch(
      setToastDataFunc({
        message: t("mandatoryErrorStatement"), // Added translations for arabic on 21-09-2023 for BugId:137213
        severity: "error",
        open: true,
      })
    );
  };

  /*Bug 123919 - safari>>email>>getting error in saving email property
  [27-03-2023] Added the function to validate if all the emails are in correct format*/
  const validateEmailForValues = () => {
    //already have check if the EmailDataIsVaild
    if (currOpenTab === 0) {
      return true;
    }
    let mailInfo =
      localActivityPropertyData?.ActivityProperty?.sendInfo?.emailInfo
        ?.mailInfo;
    if (mailInfo?.m_bFromConst) {
      if (mailInfo?.fromConstant?.trim()?.length > 0) {
        if (!validateEmail(mailInfo?.fromConstant?.trim())) {
          return false;
        }
      }
    }

    if (mailInfo?.m_bToConst) {
      if (mailInfo?.toConstant?.trim()?.length > 0) {
        if (!validateEmail(mailInfo?.toConstant?.trim())) {
          return false;
        }
      }
    }
    if (mailInfo?.m_bCcConst) {
      if (mailInfo?.ccConstant?.trim()?.length > 0) {
        if (!validateEmail(mailInfo?.ccConstant?.trim())) {
          return false;
        }
      }
    }
    if (mailInfo?.m_bBCcConst) {
      if (mailInfo?.bccConstant?.trim()?.length > 0) {
        if (!validateEmail(mailInfo?.bccConstant?.trim())) {
          return false;
        }
      }
    }

    return true;
  };

  /*Bug 123919 - safari>>email>>getting error in saving email property
  [27-03-2023] Added the function to check if the EmailTab data is valid*/
  const isEmailTabDataValid = () => {
    let isValid = true;
    let mailInfo =
      localActivityPropertyData?.ActivityProperty?.sendInfo?.emailInfo
        ?.mailInfo;
    if (mailInfo?.m_bFromConst) {
      if (
        // Added on 09-10-23 for Bug 139177
        !mailInfo?.fromConstant ||
        mailInfo?.fromConstant?.trim() === undefined
      ) {
        isValid = false;
      }
    } else {
      if (mailInfo?.fromUser?.trim() === undefined) {
        isValid = false;
      }
    }
    if (mailInfo?.m_bToConst) {
      if (!mailInfo?.toConstant || mailInfo?.toConstant?.trim() === undefined) {
        isValid = false;
      }
    } else {
      if (mailInfo?.toUser?.trim() === undefined) {
        isValid = false;
      }
    }
    // Till here for Bug 139177
    if (mailInfo?.subject.trim() === "") {
      isValid = false;
    }

    //check if fields are not filled && user are in another tab -> user doesn't want to use this service.
    if (
      !mailInfo?.m_bFromConst &&
      !mailInfo?.m_bToConst &&
      mailInfo?.fromUser?.trim() === "" &&
      mailInfo?.toUser?.trim() === "" &&
      mailInfo?.subject.trim() === "" &&
      currOpenTab !== 2
    ) {
      isValid = true;
    }
    return isValid;
  };

  /*Bug 123919 - safari>>email>>getting error in saving email property
  [27-03-2023] Added the function to check if the FaxTab data is valid*/
  const isFaxDataValid = () => {
    let isValid = true;
    let faxInfo =
      localActivityPropertyData?.ActivityProperty?.sendInfo?.faxInfo;
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
    //Case when no data is filled and user is in other tab -> user does not want to use that service.
    if (
      !faxInfo?.m_bConstFaxFlag &&
      faxInfo?.m_strConstantFaxNumber?.trim() === "" &&
      _.isEmpty(faxInfo?.mapselectedfaxDocList) &&
      currOpenTab !== 1
    ) {
      isValid = true;
    }

    return isValid;
  };

  /*Bug 123919 - safari>>email>>getting error in saving email property
  [27-03-2023] Added the function to update the PropertyChange*/
  useEffect(() => {
    let isValidObj =
      isEmailTabDataValid() && validateEmailForValues() && isFaxDataValid();
    if (!isValidObj) {
      dispatch(
        setActivityPropertyChange({
          [propertiesLabel.send]: { isModified: true, hasError: true },
        })
      );
    }
  }, [localActivityPropertyData]);

  /*Bug 123919 - safari>>email>>getting error in saving email property
  [27-03-2023] Added the function which gets called on SaveChanges click*/
  useEffect(() => {
    if (saveCancelStatus.SaveClicked) {
      //If Print Tab is in Opened State
      if (currOpenTab === 0) {
        if (!isFaxDataValid()) {
          setCurrOpenTab(1);
          handleToast();
        } else if (!isEmailTabDataValid()) {
          setCurrOpenTab(2);
          handleToast();
        } else if (!validateEmailForValues()) {
          setCurrOpenTab(2);
          handleInvalidEmailToast();
        } else {
          dispatch(
            setActivityPropertyChange({
              [propertiesLabel.send]: { isModified: true, hasError: false },
            })
          );
        }
      }
      //If Fax Tab is in Opened State
      else if (currOpenTab === 1) {
        if (!isFaxDataValid()) {
          handleToast();
        } else if (!isEmailTabDataValid()) {
          setCurrOpenTab(2);
          handleToast();
        } else if (!validateEmailForValues()) {
          setCurrOpenTab(2);
          handleInvalidEmailToast();
        } else {
          dispatch(
            setActivityPropertyChange({
              [propertiesLabel.send]: { isModified: true, hasError: false },
            })
          );
        }
      }
      //If Email Tab is in Opened State
      else if (currOpenTab === 2) {
        if (!isEmailTabDataValid()) {
          handleToast();
        } else if (!validateEmailForValues()) {
          handleInvalidEmailToast();
        } else if (!isFaxDataValid()) {
          setCurrOpenTab(1);
          handleToast();
        } else {
          dispatch(
            setActivityPropertyChange({
              [propertiesLabel.send]: { isModified: true, hasError: false },
            })
          );
        }
      }
      dispatch(setSave({ SaveClicked: false }));
    }
  }, [saveCancelStatus.SaveClicked]);

  /*Bug 123919 - safari>>email>>getting error in saving email property
  [27-03-2023] Added the function to handle TabChange and set the CurrOpenTab*/
  const handleTabChange = (value) => {
    setCurrOpenTab(value);
  };

  /*Bug 123919 - safari>>email>>getting error in saving email property
  [27-03-2023] Added the function to update the ActivityData*/
  const UpdateActivityData = (data) => {
    setLocalActivityPropertyData(data);
  };

  return spinner ? (
    <CircularProgress style={{ marginTop: "30vh", marginLeft: "40%" }} />
  ) : (
    <>
      <TabsHeading heading={props?.heading} />
      <div style={{ background: "white", margin: "1rem 0 0" }}>
        <Tabs
          tabType="processSubTab"
          tabContentStyle="processSubTabContentStyle"
          tabBarStyle="processSubTabBarStyle"
          oneTabStyle="processSubOneTabStyle"
          tabStyling="processViewTabs"
          tabsStyle="processViewSubTabs"
          TabNames={[t("print"), t("fax"), t("email")]}
          onTabChange={handleTabChange} //Bug 123919
          defaultTabValue={currOpenTab} //Bug 123919
          TabElement={[
            <Print templateDoc={templateDoc} />, // code edited on 13 Jan 2023 for BugId 122384
            <Fax
              templateDoc={templateDoc}
              UpdateActivityData={UpdateActivityData} //Bug 123919
            />, // code edited on 13 Jan 2023 for BugId 122384
            <EmailTab
              templateDoc={templateDoc}
              UpdateActivityData={UpdateActivityData} //Bug 123919
            />, // code edited on 13 Jan 2023 for BugId 122384
          ]}
        />
      </div>
    </>
  );
}

export default Email;
