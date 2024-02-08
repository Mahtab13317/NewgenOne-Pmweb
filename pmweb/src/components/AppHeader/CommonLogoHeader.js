import React, { useEffect, useState } from "react";
import { Grid } from "@material-ui/core";
import { NewgenOneLogo } from "../../utility/AllImages/AllImages";
import { getBrandInfos } from "../../utility/CommonFunctionCall/CommonFunctionCall";
import { useSelector, useDispatch } from "react-redux";

import { brandDetailsValue } from "../../redux-store/slices/brandDetails/brandDetailsSlice";
const CommonLogoHeader = () => {
  const brandDetails = useSelector(brandDetailsValue);
  const dispatch = useDispatch();

  useEffect(() => {
    getBrandInfos({ dispatch });
  }, []);

  return (
    <Grid container>
      {brandDetails?.commonLogo ? (
        <Grid item>
          <img
            src={brandDetails?.commonLogo}
            style={{
              // width: "11rem",
              height: "3rem",
              // maxWidth: "270px",
              //  minWidth: "196px",
              maxHeight: "32px",
            }}
          />
        </Grid>
      ) : (
        !brandDetails?.isLoadingDetails && (
          <Grid item>
            <NewgenOneLogo
              style={{
                // width: "11rem",
                height: "3rem",
                maxWidth: "270px",
                minWidth: "196px",
                maxHeight: "32px",
              }}
            />
          </Grid>
        )
      )}
    </Grid>
  );
};

export default CommonLogoHeader;
