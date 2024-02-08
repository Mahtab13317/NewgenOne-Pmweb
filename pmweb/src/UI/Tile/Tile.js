import { React } from "react";
import "./Tile.css";
import { Card, CardContent, Grid } from "@material-ui/core";
import { tileProcess } from "../../utility/HomeProcessView/tileProcess";
import { useTranslation } from "react-i18next";
import c_Names from "classnames";

function Tile(props) {
  let { t } = useTranslation();
  var src = tileProcess(props.type)[0]; // 0 is used for the icon
  var processType = t(tileProcess(props.type)[1]); //1 is for process type
  var pending = t(tileProcess(props.type)[2]); //2 is for pending word
  var bgcolor = t(tileProcess(props.type)[3]); //3 is used for background color
  var borderColor = t(tileProcess(props.type)[6]); //6 is for border color
  var addBorder = (evt) => {
    evt.currentTarget.style.border = "2px solid " + borderColor;
  };
  const removeBorder = (evt) => {
    evt.currentTarget.style.border = "";
  };
  return (
    <div>
      <Card
        variant="outlined"
        className={"cardTile"}
        onMouseOver={addBorder}
        onMouseLeave={removeBorder}
      >
        <CardContent style={{ padding: "0" }}>
          <Grid className="row">
            <Grid
              item
              className="processTypeIcon"
              style={{ backgroundColor: bgcolor }}
            >
              <img
                src={src}
                alt={t("img")}
                className={c_Names({ icon: true, pendingIcon: pending !== "" })}
              />
            </Grid>
            <Grid item>
              <p className="countLabel">{props.count}</p>
              <p className="countText">{processType}</p>
              <p className="pendingLabel">{pending}</p>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
}

export default Tile;
