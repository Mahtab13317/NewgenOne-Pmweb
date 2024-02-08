import React, { useState, useEffect } from "react";
import CloseIcon from "@material-ui/icons/Close";
import "./index.css";
import Button from "@material-ui/core/Button";
import {
  ENDPOINT_VALIDATE_QUERY,
  SERVER_URL,
} from "../../../../Constants/appConstants";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { useDispatch } from "react-redux";

function FilterScreen(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  const { isReadOnly } = props;
  const [queryFilter, setQueryFilter] = useState("");

  useEffect(() => {
    setQueryFilter(props.query[props.selectedGroupId]);
  }, [props.query]);

  //Added on 27/09/2023, bug_id:135582
  const validateQuery = async () => {
    let isValid;
    const postData = {
      query: queryFilter,
    };

    await axios
      .post(`${SERVER_URL}${ENDPOINT_VALIDATE_QUERY}`, postData)
      .then((res) => {
        isValid = res?.data?.valid;
      });

    return isValid;
  };

  const handleSave = async () => {
    const validData = await validateQuery();
    if (validData) {
      props.setShowFilterScreen(null);
      props.setQuery({
        ...props.query,
        [props.selectedGroupId]: queryFilter,
      });
    } else {
      dispatch(
        setToastDataFunc({
          message: t("EnterValidQueryError"),
          severity: "error",
          open: true,
        })
      );
    }
  };
  //till here for bugid:135582

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px",
          borderBottom: "1px solid #DADADA",
        }}
      >
        <p style={{ fontSize: "16px", fontWeight: "700" }}>{t("addFilters")}</p>
        <CloseIcon
          style={{ height: "16px", width: "16px", cursor: "pointer" }}
          // code edited on 22 April 2023 for BugId 127404 - queue>>group>>filter>>cross button is not working
          onClick={() => props.setShowFilterScreen(null)}
        />
      </div>
      <div style={{ paddingLeft: "10px" }}>
        <div
          style={{
            width: "475px",
            height: "36px",
            backgroundColor: "#F0F0F0",
            padding: "10px",
            marginTop: "10px",
          }}
        >
          <p style={{ color: "#000000", fontSize: "12px" }}>
            {t("typeYourQuery")}
          </p>
          <textarea
            style={{
              width: "474px",
              height: "165px",
              border: "1px solid #C4C4C4",
              margin: "22px 0px 0px -10px",
              padding: "10px",
            }}
            value={queryFilter}
            onChange={(e) => setQueryFilter(e.target.value)}
            // modified on 23/01/24 for BugId 141169
            // disabled={isReadOnly}
            disabled={
              isReadOnly ||
              (+props.queueType === 0 && props.queueFrom !== "graph")
            }
            // till here BugId 141169
            id="pmweb_workstepqueue_filterquery"
          />
        </div>
      </div>
      {/* // )} */}
      <div className="buttons_add buttonsAddToDo_FilterScreen">
        <Button
          variant="outlined"
          onClick={() => props.setShowFilterScreen(null)}
          id="close_addQueueFilter_Button"
        >
          {t("cancel")}
        </Button>
        {!isReadOnly && (
          <Button
            id="addQueueFilter_Button"
            variant="contained"
            color="primary"
            onClick={() => {
              handleSave(); //Modified on 27/09/2023, bug_id:135582
              /*props.setShowFilterScreen(null);
              props.setQuery({
                ...props.query,
                [props.selectedGroupId]: queryFilter,
              });*/
            }}
            disabled={!queryFilter ? true : false} //Modified on 27/09/2023, bug_id:135582
          >
            {t("save")}
          </Button>
        )}
      </div>
    </div>
  );
}

export default FilterScreen;
