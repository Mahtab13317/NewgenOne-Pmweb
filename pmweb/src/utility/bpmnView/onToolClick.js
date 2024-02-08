const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxEvent = mxgraphobj.mxEvent;

//functiom executed when a tool is clicked
//adds event listenr for click on graph, so a cell is dropped on graph
//if consecutive tool are clicked then , previous event is removed
export function onToolClick(evt, graph, prototype, setToolboxEventList, funct) {
  console.log("mouse click on toolbox");
  let listenerFunc = (evt) => {
    var pt = graph.getPointForEvent(evt);
    console.log("graph clicked");
    let ifDropped = funct(graph, evt, null, pt.x, pt.y, prototype);
    if (ifDropped) {
      mxEvent.removeListener(graph.container, "click", listenerFunc);
    }
  };

  //to remove previous eventlistner when consecutive toolbar icon are clicked
  setToolboxEventList((prevListOfEventFunctions) => {
    mxEvent.removeListener(
      graph.container,
      "click",
      prevListOfEventFunctions[0]
    );
    return [listenerFunc];
  });
  mxEvent.addListener(graph.container, "click", listenerFunc);
}
