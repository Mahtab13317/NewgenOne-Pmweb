import React from "react";
import { Grid, Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  container: {
    padding: "0.5rem 1vw",
  },
  errorNote: {
    color: "#000",
    font: "normal normal 400 var(--base_text_font_size)/17px var(--font_family) !important",
  },
  errorListDiv: {
    padding: "0.75rem 0",
    height: (props) => props.height,
    overflowY: "auto",
    width: "100%",
  },
  errorList: {
    color: "#000",
    font: "normal normal 400 var(--base_text_font_size)/17px var(--font_family) !important",
    width: "100%",
    display: "flex",
  },
}));

function InformationComponentGenAI(props) {
  const { information, height = "12rem" } = props;
  const styles = useStyles({ height });

  return (
    <Grid container className={styles.container}>
      <Grid item>
        <Typography className={styles.errorNote} data-testid="IC_Error_Note">
          Some data objects are already being used in the other processes, so we
          have renamed these objects.
        </Typography>
      </Grid>
      <Grid
        item
        className={styles.errorListDiv}
        role="grid"
        aria-label="Error List"
      >
        {information?.map((element, index) => {
          return (
            <Typography
              className={styles.errorList}
              data-testid={index + 1}
              key={index + 1}
            >
              <span style={{ flex: "0.08" }}>{index + 1}.</span>{" "}
              <span style={{ flex: "1" }}>{element.oldName}</span>{" "}
              <span style={{ flex: "2" }}>{element.name}</span>
            </Typography>
          );
        })}
      </Grid>
    </Grid>
  );
}

export default InformationComponentGenAI;
