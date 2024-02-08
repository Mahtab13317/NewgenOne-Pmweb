// Changes made to solve Bug with ID ===> 114834 (Create New Project button not working)

// #BugID - 125171
// #BugDescription -  Fixed the issue Without for assignment of pmweb menu rights the user is getting all the access for the same and able to peroform operation

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./noProcessOrProjects.css";
import CreateProcessButton from "../../../../../UI/Buttons/CreateProcessButton";
import emptyStatePic from "../../../../../assets/NoSearchResult.svg";
import ProjectCreation from "../../Projects/ProjectCreation.js";
import Modal from "../../../../../UI/Modal/Modal.js";
import { getMenuNameFlag } from "../../../../../utility/UserRightsFunctions";
import { useSelector } from "react-redux";
import {
  RTL_DIRECTION,
  userRightsMenuNames,
} from "../../../../../Constants/appConstants";
import { UserRightsValue } from "../../../../../redux-store/slices/UserRightsSlice";

function NoProjectScreen(props) {
  const [showModal, setShowModal] = useState(null);
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  const userRightsValue = useSelector(UserRightsValue);

  // Boolean that decides whether create project button will be visible or not.
  const createProjectRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.createProject
  );

  // Boolean that decides whether create process button will be visible or not.
  const createProcessRightsFlag = getMenuNameFlag(
    userRightsValue?.menuRightsList,
    userRightsMenuNames.createProcess
  );

  return (
    <div className="noProjectsScreen">
      <img
        alt={t("emptyState")}
        src={emptyStatePic}
        style={{
          width: "40%",
          transform: direction === RTL_DIRECTION ? "scaleX(-1)" : null,
        }}
      />
      <h2 className="noProjectsScreenHeading">
        {t("projectList.NoProjectsToShow")}
      </h2>
      <p className="noProjectScreenPTag">{t("projectList.UseOfProjects")}</p>
      {createProjectRightsFlag && createProcessRightsFlag ? (
        <CreateProcessButton
          onClick={() => setShowModal(true)}
          id="pmweb_create_Project"
          buttonContent={t("CreateNewProject")}
          buttonStyle={{
            backgroundColor: "var(--button_color)",
            color: "white",
            minWidth: "10vw",
            margin: "var(--spacing_v) 0 !important",
          }}
          role="CreateProject"
          aria-label="Create Project Button"
          aria-description="Create Project Button"
        ></CreateProcessButton>
      ) : null}

      {showModal ? (
        <Modal
          show={showModal !== null}
          style={{
            // width: "30vw",
            left: "50%",
            top: "50%",
            padding: "0",
            transform: "translate(-50%, -50%)",
          }}
          modalClosed={() => setShowModal(null)}
          children={<ProjectCreation setShowModal={setShowModal} />}
        />
      ) : null}
    </div>
  );
}

export default NoProjectScreen;
