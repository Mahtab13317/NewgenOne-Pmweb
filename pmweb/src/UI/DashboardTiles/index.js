import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import * as actionCreators from "../../redux-store/actions/processView/actions.js";
import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  root_tile: {
    width: (props) => props.width,
    maxHeight: (props) => props.height,
    marginRight: "1.05vw",
    boxShadow: "0px 3px 6px #0000001F",
    borderRadius: "4px",
    display: "flex",
    // border: "1px solid white",
    backgroundColor: theme.palette.common.white,
    "&:hover": {
      boxShadow: "0px 6px 12px #0000001F",
    },
    marginBottom: "19px",
    cursor: "pointer",
  },
  tile_container: {
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    marginTop: "5px",
    marginLeft: "1rem",
    marginRight: "0",
    justifyContent: (props) =>
      props.direction === "rtl" ? "flex-end" : "flex-start",
  },
  root_tile_left: {
    width: "40%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: (props) =>
      props.direction === "rtl" ? "0 4px 4px 0" : "4px 0px 0px 4px",
  },
  root_tile_right: {
    padding: "6px 1rem",
    display: "flex",
    width: "60%",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  tile_title: {
    textAlign: (props) => (props.direction === "rtl" ? "right" : "left"),
    font: "normal normal bold 24px/33px Open Sans",
    letterSpacing: "0px",
    color: "#000000",
    opacity: 1,
    // marginBottom: '5px'
  },
  tile_description: {
    color: "#606060",
    textAlign: (props) => (props.direction === "rtl" ? "right" : "left"),
    // fontSize: '10.5pt',
    fontWeight: 600,
    letterSpacing: "0px",
    opacity: 1,
    maxWidth: 125,
    font: "normal normal 600 14px/19px Open Sans",
    marginTop: "-3px",
  },
  tile_subDesc: {
    font: "normal normal normal 10px/14px Open Sans",
    letterSpacing: "0px",
    color: "#606060",
    opacity: "1",
  },
  pendingImg: {
    marginBottom: "12px",
  },
}));

const DashboardTile = (props) => {
  const {
    tileList = [],
    height = "72px",
    width = "176px",
    imgHeight = 30,
    imgWidth = 30,
    pendingImgWidth = 41,
    pendingImgHeight = 40,
    direction = "ltr",
    onClickHandler = null,
  } = props;

  const handleMouseEnter = (key, color) => {
    document.getElementById(
      `root_tile_right_${key}`
    ).style.background = `rgba(0, 0, 0, 0.04)`;
  };

  const handleMouseLeave = (key) => {
    document.getElementById(`root_tile_right_${key}`).style.background = `#FFF`;
  };

  const classes = useStyles({ height, width, imgHeight, imgWidth, direction });
  return (
    <div className={classes.tile_container} style={{ direction: direction }}>
      {tileList &&
        tileList.map((res, key) => {
          return (
            // <StyledTooltip title={(res.description?.label != '' && res.description?.label != undefined) ? (`${res.description?.label}: ${res.description?.value}`) : `${res.description?.value}`}>
            <div
              key={key}
              className={classes.root_tile}
              onMouseEnter={() => handleMouseEnter(key)}
              onMouseLeave={() => handleMouseLeave(key)}
              onClick={() => {
                props.clickedProcessTile(res);
                if (onClickHandler !== null) onClickHandler(res);
              }}
            >
              <div
                className={classes.root_tile_left}
                style={{ backgroundColor: res.img_info.background_color }}
                title="Helo"
              >
                {res.processTileCode === "EP" ||
                res.processTileCode === "RP" ? (
                  <img
                    src={res.img_info?.url}
                    width={pendingImgWidth}
                    height={pendingImgHeight}
                    className={classes.pendingImg}
                    alt="Helo"
                  />
                ) : (
                  <img
                    src={res.img_info?.url}
                    width={imgWidth}
                    height={imgHeight}
                    alt="Helo"
                  />
                )}
              </div>
              <div
                id={`root_tile_right_${key}`}
                className={classes.root_tile_right}
              >
                <Typography className={classes.tile_title}>
                  {res.title}
                </Typography>
                <div
                  style={{
                    direction: props.direction,
                    display: "flex",
                    font: "Open Sans",
                  }}
                >
                  {res.description?.label !== "" &&
                    res.description?.label !== undefined && (
                      <Typography
                        className={classes.tile_description}
                        style={{ fontWeight: "300" }}
                        noWrap={true}
                      >
                        {res.description.label}
                      </Typography>
                    )}
                  {/*
                                    (res.description?.value != '' && res.description?.value != undefined) &&
                                    <Typography className={classes.tile_description} noWrap={true}>{(res.description?.label ? ": " : "") + res.description.value}</Typography>
                                */}
                </div>
                {res?.description?.subLabel && (
                  <Typography className={classes.tile_subDesc}>
                    {res.description.subLabel}
                  </Typography>
                )}
              </div>
            </div>
            // </StyledTooltip>
          );
        })}
    </div>
  );
};

DashboardTile.propTypes = {
  tileList: PropTypes.array,
  width: PropTypes.string,
  height: PropTypes.string,
  imgHeight: PropTypes.number,
  imgWidth: PropTypes.number,
  direction: PropTypes.string,
  onClickHandler: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => {
  return {
    clickedProcessTile: (processTile) =>
      dispatch(actionCreators.clickedProcessTile(processTile)),
  };
};

export default connect(null, mapDispatchToProps)(DashboardTile);
