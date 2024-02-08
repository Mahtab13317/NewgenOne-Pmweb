import React from "react";
import Modal from "@material-ui/core/Modal";
import { Box, Button } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { RTL_DIRECTION } from "../../../Constants/appConstants";
import { useTranslation } from "react-i18next";

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  bgcolor: "background.paper",
  borderRadius: "2px",
  border: "1px solid #F5F5F5",
  boxShadow: 24,
};

function DeletePopup(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;

  return (
    <>
      <Modal
        open={props.isDeleteModalOpen}
        onClose={props.closeDeleteModal}
        id="deleteModal"
      >
        <Box sx={styleModal}>
          <div
            className={
              direction == RTL_DIRECTION ? "modalHeaderRTL" : "modalHeader"
            }
          >
            <div
              className={
                direction == RTL_DIRECTION
                  ? "labels modalLabelRTL"
                  : "labels modalLabel"
              }
            >
              <h4> {t("objectDependencies")}</h4>
            </div>
            <div
              className={
                direction == RTL_DIRECTION ? "modalCloseRTL" : "modalClose"
              }
            >
              <CloseIcon
                onClick={props.closeDeleteModal}
                className="closeIcon"
                style={{
                  cursor: "pointer",
                  height: "100%",
                  color: "#707070",
                  marginTop: "0.25rem",
                  marginLeft: "6rem",

                  // display: props.disabled ? "none": ""
                }}
              />
            </div>
          </div>
          <div className="modalBody">
            <p className="warningMsg">{t("pleaseRemoveBelowDependencies")}</p>
            <Box>
              <table
                className={
                  direction == RTL_DIRECTION ? "modalTableRTL" : "modalTable"
                }
              >
                <thead>
                  <tr>
                    <th>{t("objectName")}</th>
                    <th>{t("objectType")}</th>
                    <th>{t("objectAssoc")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Webservice_test1</td>
                    <td>exception</td>
                    <td>RuleFlow</td>
                  </tr>
                  <tr>
                    <td>Webservice_test1</td>
                    <td>exception</td>
                    <td>RuleFlow</td>
                  </tr>
                  <tr>
                    <td>Webservice_test1</td>
                    <td>exception</td>
                    <td>RuleFlow</td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </div>
          <div
            className={
              direction == RTL_DIRECTION ? "modalFooterRTL" : "modalFooter"
            }
          >
            <div
              className={
                direction == RTL_DIRECTION
                  ? "modalFooterInnerRTL"
                  : "modalFooterInner"
              }
            >
              <Button
                id="cancelMap"
                className="cancelMap"
                color="primary"
                variant="outlined"
                size="small"
                onClick={props.closeDeleteModal}
              >
                {t("toolbox.sharePointArchive.cancel")}
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
}

export default DeletePopup;
