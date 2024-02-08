// Changes made to solve Bug 115562 - Requiremnt & Attachments: in attachment tab attachment are getting saved without adding any attachment
import axios from "axios";
import React, { useState } from "react";
import { store, useGlobalState } from "state-pool";
import {
  ENDPOINT_SAVE_ATTACHMENT,
  SERVER_URL,
} from "../../../Constants/appConstants";
import { setToastDataFunc } from "../../../redux-store/slices/ToastDataHandlerSlice";
import AttachmentReq from "../../Properties/PropetiesTab/Attachment/AttachmentReq";
import { useDispatch } from "react-redux";
import { Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";

function AttachmentRequirement(props) {
  const { isReadOnly } = props;
  const dispatch = useDispatch();
  let { t } = useTranslation();
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData, setLocalLoadedProcessData] =
    useGlobalState(loadedProcessData);

  const [attachList, setAttachList] = useState(null);

  const saveData = () => {
    const postData = {
      processDefId: localLoadedProcessData?.ProcessDefId,
      processState: localLoadedProcessData?.ProcessType,
      attachmentList: attachList?.map((item) => {
        if (item.status === "T") {
          item.status = "S";
        }
        return item;
      }),
    };

    postData?.attachmentList?.filter((element) => element.status !== "D")
      ?.length > 0
      ? axios
          .post(SERVER_URL + ENDPOINT_SAVE_ATTACHMENT, postData)
          .then((res) => {
            if (
              res?.data?.Status === 0 &&
              res.data.Message === "Attachment saved"
            ) {
              dispatch(
                setToastDataFunc({
                  // changes to resolve the bug Id 136966
                  message: t("AttachmentHasBeenSuccessfullySaved"),
                  severity: "success",
                  open: true,
                })
              );
            }
          })
          .catch((err) => {
            console.log("AXIOS ERROR: ", err);
          })
      : dispatch(
          setToastDataFunc({
            // changes to resolve the bug Id 136966
            message: t("AddAtleastOneAttachmentToSave"),
            severity: "warning",
            open: true,
          })
        );
  };

  const getPayload = (data) => {
    const newArr = data.map((item) => {
      return {
        docId: item.docId,
        docName: item.docName,
        requirementId: item.reqId,
        sAttachName: item.sAttachName,
        sAttachType: item.sAttachType,
        status: item.status,
      };
    });
    setAttachList(data);
  };
  return (
    <>
      <AttachmentReq
        ignoreSpinner={true}
        RAPayload={getPayload}
        isReadOnly={isReadOnly}
      />
      <div style={{ float: "right", margin: "1rem" }}>
        {!isReadOnly && (
          <Button
            id="pmweb_AttachmentRequirement_SaveAttachmentBtn"
            style={{ background: "var(--button_color)", color: "#ffffff" }}
            variant="contained"
            onClick={saveData}
          >
            {t("saveAttachment")}
          </Button>
        )}
      </div>
    </>
  );
}

export default AttachmentRequirement;
