import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  MuiAccordionroot: {
    "&.MuiAccordion-root:before": {
      backgroundColor: "white",
      height: "20px",
    },
  },
}));

export default useStyles;
