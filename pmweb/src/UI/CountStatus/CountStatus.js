import React from "react";
import "./CountStatus.css";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";
import Tooltip from "@material-ui/core/Tooltip";

function ProcessCount(props) {
  const { tabs } = props;
  //   const [toolContent, setToolContent] = useState(null);
  //   const [dotcolor, setDotColor] = useState(null);
  //   const [toolcount, setToolCount] = useState(null);
  //const[shifting, setShifting]= useState(null);
  let widthsize = 0;
  let tabsLength = tabs.length;
  tabs.map((tab) => {
    widthsize = widthsize + +tab.toolCount;
  });

  // const mouseEnterHandler=(e, i)=>{
  //     if(widthsize){
  //     setToolCount(`${tabs[i].toolCount}`);
  //     setToolContent(`${tabs[i].toolContent}`);
  //     setDotColor(`${e.target.className}`);
  //  }
  //     // if(i!==0){
  //     //     let j, test=0;
  //     //     for(j=0; j<=i-1; j++){
  //     //        test=test+parseInt(tabs[j].toolCount);
  //     //     }
  //     //     setShifting((100*(tabs[i].toolCount)/(2*widthsize) + 100*(test)/(widthsize)));
  //     //     //console.log(shifting);
  //     // }
  //     // if(i==0){
  //     //     setShifting(100*(tabs[i].toolCount)/(2*widthsize));
  //     // }
  // }

  const displayTab = () => {
    return tabs.map((tab, index) => {
      let styling = null;
      if (index == 0) {
        styling = "250px 0 0 250px";
      } else if (index == tabsLength - 1) {
        styling = "0 250px 250px 0";
      } else {
        styling = "0px";
      }
      //console.log(widthsize==0?'100px': `${100*(tab.toolCount)/widthsize}`+ 'px');
      return (
        <Tooltip
          arrow
          title={
            <div className="tootTipTitle">
              {" "}
              <span>
                <FiberManualRecordIcon
                  style={{
                    color: `${tab.tabColor}`,
                    height: "15px",
                    width: "15px",
                    paddingTop: "2px",
                  }}
                />
              </span>
              {" " + `${tab.toolCount}` + " " + `${tab.toolContent}`}{" "}
            </div>
          }
          placement="top"
        >
          <div className="bar">
            <div
              className={tab.tabColor}
              /* onMouseEnter={(event)=>mouseEnterHandler(event, index)} onMouseLeave={()=>setToolContent(null)} */ style={{
                backgroundColor: widthsize == 0 ? "#c7cfb7" : `${tab.tabColor}`,
                height: "8px",
                borderRadius: `${styling}`,
                color: "transparent",
                width:
                  widthsize == 0
                    ? "100px"
                    : `${(100 * tab.toolCount) / widthsize}` + "px",
              }}
            ></div>
          </div>
        </Tooltip>
      );
    });
  };

  return (
    <div className="parentDiv">
      {/* <div className='tagPart' style={{ display: `${toolContent?'block': 'none'}` , transform: `translate(${shifting}px, 0px)` }}>
                    <div className='toolTip'><span><FiberManualRecordIcon style={{color:`${dotcolor}`, height: '15px', width: '15px', paddingTop: '5px'}}/></span>{' '+ `${toolcount}`+ ' ' + `${toolContent}`}</div>
                    <div className='tip'></div>
            </div>         */}
      <div className="progressBar">
        <p>{widthsize}</p>
        {displayTab()}
      </div>
    </div>
  );
}

export default ProcessCount;
