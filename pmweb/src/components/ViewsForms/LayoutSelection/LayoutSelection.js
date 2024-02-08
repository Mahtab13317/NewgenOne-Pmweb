import React, { useState, useEffect } from "react";
import {
  Button,
  Modal,
  useTheme,
  useMediaQuery,
  IconButton,
} from "@material-ui/core";
import styles from "./LayoutSelection.module.css";
import { useTranslation } from "react-i18next";
import FormAssociationType from "../FormAssociationType/FormAssociationType";
import FormsListWithWorkstep from "../FormsListWithWorkstep/FormsListWithWorkstep";
import RuleListForm from "../RuleListForm/RuleListForm";
import {
  BASE_URL,
  ENDPOINT_GET_FORMASSOCIATIONS,
  SERVER_URL,
} from "../../../Constants/appConstants";
import axios from "axios";
import { store, useGlobalState } from "state-pool";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";

function LayoutSelection(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}​​​​​​​​`;
  const steps = ["Layout Selection", "Form Association"];
  const loadedProcessData = store.getState("loadedProcessData"); //current processdata clicked
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const formsList = store.getState("allFormsList");
  const [allFormsList, setallFormsList] = useGlobalState(formsList);
  const [formAssociationData, setformAssociationData] = useGlobalState(
    "allFormAssociationData"
  );
  const [formAssociationType, setformAssociationType] = useState("single");
  const [modifiedAssociationJson, setmodifiedAssociationJson] = useState();
  const [activeStep, setActiveStep] = useState(0);
  const [templateData, settemplateData] = useState({});
  const [formsOtherProcessObj, setformsOtherProcessObj] = useState({});
  const [rulesModalOpen, setrulesModalOpen] = useState(false);
  const [allActivities, setallActivities] = useState([]);

  const theme = useTheme();
  const matchesTab = useMediaQuery(theme.breakpoints.down("md"));

  //Function that runs when the user goes to the previous step using the previous button.
  const handlePreviousStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Function that runs when the user goes to the next step using the next button.
  const handleNextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const getFormAssociationType = (val) => {
    setformAssociationType(val);
  };

  const getFormDetailsById = (id, allFormsList) => {
    let temp = {};
    allFormsList.some((form) => {
      if (form.formId + "" === id) {
        temp = form;
        return true;
      }
    });
    return temp;
  };

  useEffect(() => {
    localLoadedProcessData?.MileStones?.forEach((mileStone) => {
      mileStone.Activities.forEach((activity, index) => {
        if (
          activity.ActivityType === 1 ||
          activity.ActivityType === 2 ||
          activity.ActivityType === 32 ||
          activity.ActivityType === 4 ||
          (activity.ActivityType === 10 &&
            (activity.ActivitySubType === 3 ||
              activity.ActivitySubType === 10 ||
              activity.ActivitySubType === 7 ||
              activity.ActivitySubType === 6))
        )
          setallActivities((prevState) => [...prevState, activity]);
      });
    });
  }, []);

  const handleSaveChanges = async () => {
    let temp = JSON.parse(JSON.stringify(formAssociationData));
    let temp2 = JSON.parse(JSON.stringify(allFormsList));
    if (Object.keys(formsOtherProcessObj).length > 0) {
      const res = await axios.post(
        BASE_URL +
          `/process/local/${localLoadedProcessData.ProcessDefId}/${formsOtherProcessObj?.processDefId}/${formsOtherProcessObj?.formId}`
      );
      if (res.status === 200) {
        temp2.push(res?.data);
        setallFormsList(temp2);

        temp?.forEach((assocData) => {
          assocData.formId = res?.data?.formId + "";
        });

        setformAssociationData(temp);
      }
    }
    if (Object.keys(templateData).length > 0) {
      const res = await axios.post(
        BASE_URL +
          `/process/template/${templateData.templateid}/${localLoadedProcessData.ProcessDefId}`
      );
      if (res.status === 200) {
        temp2.push(res?.data);
        setallFormsList(temp2);
        temp?.forEach((assocData) => {
          assocData.formId = res?.data?.formId + "";
        });
        setformAssociationData(temp);
      }
    }

    if (temp !== undefined) {
      let formAssocArr = [];
      temp.forEach((assocData) => {
        formAssocArr.push({
          formId: assocData.formId + "",
          formName: getFormDetailsById(assocData.formId + "", temp2).formName,
          activity: {
            actId: assocData.activity.actId + "",
            actName: assocData.activity.actName,
            operationType: !!assocData.activity.operationType
              ? assocData.activity.operationType
              : "A",
          },
        });
      });
      let payload = {
        processDefId: localLoadedProcessData.ProcessDefId,
        registeredMode: localLoadedProcessData.ProcessType,
        formInfos: formAssocArr,
      };
      const result = formAssociationData?.every((assocData) => {
        if (+assocData.formId === +formAssociationData[0].formId) {
          return true;
        }
      });
      if (result) {
        props.setisSingleFormAttached(true);
        props.setformIdtoDisplay(+temp[0].formId);
        props.handleViewForm(+temp[0].formId);
        props.setSelectedFormBox(0);
      } else {
        props.setisSingleFormAttached(false);
        props.setformIdtoDisplay(+temp[0].formId);
        props.handleViewForm(+temp[0].formId);
        props.setSelectedFormBox(0);
      }
      const res = await axios.post(
        SERVER_URL + ENDPOINT_GET_FORMASSOCIATIONS,
        payload
      );
      if (res.status === 200) {
        props.closeModal();
        if (formAssociationType === "single") {
          props.handleViewForm(+temp[0].formId);
        }
        setformAssociationData(temp);
      } else {
        cancelHandler();
      }

      // setformAssociationData(modifiedAssociationJson);
    } else props.closeModal();
    // props.getFormId();
  };
  const getProcessType = (processType) => {
    let temp;
    switch (processType) {
      case "L":
        temp = "L";
        break;
      case "R":
        temp = "R";
        break;
      case "LC":
        temp = "L";
        break;
      default:
        temp = "R";
    }
    return temp;
  };
  const cancelHandler = async () => {
    const res = await axios.get(
      SERVER_URL +
        `${ENDPOINT_GET_FORMASSOCIATIONS}/${
          localLoadedProcessData.ProcessDefId
        }/${getProcessType(localLoadedProcessData.ProcessType)}`
    );

    if (res.status === 200) {
      const result = res?.data?.FormAssociations?.formsInfos?.every(
        (assocData) => {
          if (+assocData.formId === +formAssociationData[0].formId) {
            return true;
          }
        }
      );
      if (result) {
        props.setisSingleFormAttached(true);
        /*   props.setformIdtoDisplay(
          +res?.data?.FormAssociations?.formsInfos[0].formId
        );*/
        /*  props.handleViewForm(
          +res?.data?.FormAssociations?.formsInfos[0].formId
        );*/
      } else {
        props.setisSingleFormAttached(false);
        /*code modified for bug id 139687

        props.setformIdtoDisplay(1);*/
        /*  props.setformIdtoDisplay(
          +res?.data?.FormAssociations?.formsInfos[0].formId
        );*/

        /*  props.handleViewForm(
          +res?.data?.FormAssociations?.formsInfos[0].formId
        );*/
      }
      // props.setSelectedFormBox(0);

      setformAssociationData(
        JSON.parse(JSON.stringify(res?.data?.FormAssociations?.formsInfos))
      );
      /*  props.handleViewForm(
        +res?.data?.FormAssociations?.formsInfos[0].formId
      )*/
    }

    props.closeModal();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        direction: direction,
      }}
    >
      {rulesModalOpen ? (
        <Modal open={rulesModalOpen}>
          <RuleListForm
            closeModal={() => setrulesModalOpen(false)}
            direction={direction}
          />
        </Modal>
      ) : null}
      <div
        style={{
          width: "100%",
          height: "10%",

          display: "flex",
          alignItems: "center",
          paddingInline: "1.4rem",
          direction: direction,
          justifyContent: "space-between",
        }}
      >
        <p
          style={{
            fontSize: "var(--title_text_font_size)",
            fontWeight: "bold",
          }}
        >
          {t("settingUpYourWorkitemView")}
        </p>
        <IconButton
          onClick={() => props.closeModal()}
          id="pmweb_viewForm_LayoutSelection_CloseModal"
          tabindex={0}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              props.closeModal();
            }
          }}
          classes={{
            root: styles.deleteIcon,
          }}
          aria-label="Close"
        >
          <ClearOutlinedIcon className={styles.deleteIconsvg} />
        </IconButton>
      </div>

      <div
        style={{
          width: "100%",
          height: matchesTab ? "70%" : "80%",
          overflowY: "auto",
        }}
      >
        {activeStep === 0 ? (
          <FormAssociationType
            getFormAssociationType={getFormAssociationType}
            formAssociationType={formAssociationType}
          />
        ) : (
          <FormsListWithWorkstep
            modifiedAssociationJson={(val) => setmodifiedAssociationJson(val)}
            setformAssociationType={setformAssociationType}
            formAssociationType={formAssociationType}
            showOtherOptions={true}
            showswappingHeader={true}
            settemplateData={settemplateData}
            setformsOtherProcessObj={setformsOtherProcessObj}
          />
        )}
      </div>

      <div
        style={{
          width: "100%",
          height: "10%",
          justifyContent: "space-between",
          display: "flex",
          alignItems: "center",
          flexDirection: "row-reverse",
          padding: "0.6rem",
          marginBlockStart: "1rem",
        }}
      >
        <div>
          <Button
            id="pmweb_LayoutSelection_cancel"
            variant="outlined"
            className={styles.pmwebcancelButton}
            onClick={() => cancelHandler()}
            //   style={{ background: "#0072c6" }}
          >
            {t("cancel")}
          </Button>
          <Button
            id="pmweb_LayoutSelection_Proceed"
            variant="outlined"
            className={styles.pmwebbuttons}
            onClick={() =>
              activeStep === 1 ? handleSaveChanges() : handleNextStep()
            }
          >
            {activeStep === 1 ? t("proceed") : t("next")}
          </Button>
        </div>

        {activeStep === 1 ? (
          <Button
            id="pmweb_LayoutSelection_Previous"
            variant="outlined"
            className={styles.pmwebcancelButton}
            onClick={() => handlePreviousStep()}
            style={{ background: "#0072c6", marginLeft: "10px !important" }}
          >
            {t("previous")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default LayoutSelection;
