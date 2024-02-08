import {
  gridSize,
  graphMinDimension,
  gridBackgroundColor,
  showGrid,
  graphGridSize,
} from "../../Constants/bpmnView";

const mxgraphobj = require("mxgraph")({
  mxImageBasePath: "mxgraph/javascript/src/images",
  mxBasePath: "mxgraph/javascript/src",
});

const mxGraphView = mxgraphobj.mxGraphView;
const mxLog = mxgraphobj.mxLog;
const mxEvent = mxgraphobj.mxEvent;
const mxPoint = mxgraphobj.mxPoint;

var repaintGrid;

// Create grid dynamically (requires canvas)
export function paintGrid(graph) {
  try {
    var canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = "0px";
    canvas.style.left = "0px";
    canvas.style.zIndex = "0";
    canvas.style.opacity = "0.4";
    canvas.style.backgroundColor = gridBackgroundColor;
    //Bug 121585 - Safari browser>>BPMN view>>unnecessary white spacing in BPMN view
    //added min-height and min-width
    canvas.style.minHeight = "100vh";
    canvas.style.minWidth = "100vw";
    graph.container.appendChild(canvas);

    let ctx = canvas.getContext("2d");

    // Modify event filtering to accept canvas as container
    let mxGraphViewIsContainerEvent = mxGraphView.prototype.isContainerEvent;
    mxGraphView.prototype.isContainerEvent = function (evt) {
      return (
        mxGraphViewIsContainerEvent.apply(this, arguments) ||
        mxEvent.getSource(evt) === canvas
      );
    };

    var s = 0;
    var gs = 0;
    var tr = new mxPoint();
    var w = 0;
    var h = 0;

    repaintGrid = () => {
      if (ctx !== null) {
        var bounds = graph.getGraphBounds();
        //extra gridSize is added so that the milestone and swimlane buttons which are
        //over the canvas seem to be inside the canvas area
        // modified on 17/10/23 for BugId 138903
        var width =
          Math.max(
            bounds.x + bounds.width,
            graph.container.clientWidth,
            graphMinDimension.w
          ) +
          // gridSize
          2 * gridSize;
        // till here BugId 138903
        var height =
          Math.max(
            bounds.y + bounds.height,
            graph.container.clientHeight,
            graphMinDimension.h
          ) + gridSize;
        var sizeChanged = width !== w || height !== h;
        graph.gridSize = graphGridSize;

        if (
          graph.view.scale !== s ||
          graph.view.translate.x !== tr.x ||
          graph.view.translate.y !== tr.y ||
          gs !== graph.gridSize ||
          sizeChanged
        ) {
          tr = graph.view.translate.clone();
          s = graph.view.scale;
          gs = graph.gridSize;
          w = width;
          h = height;

          // Clears the background if required
          if (!sizeChanged) {
            ctx.clearRect(0, 0, w, h);
          } else {
            canvas.setAttribute("width", w);
            canvas.setAttribute("height", h);
          }

          var tx = tr.x * s;
          var ty = tr.y * s;

          // Sets the distance of the grid lines in pixels
          if (showGrid) {
            var minStepping = graph.gridSize;
            var stepping = minStepping * s;
            if (stepping < minStepping) {
              var count = Math.round(Math.ceil(minStepping / stepping) / 2) * 2;
              stepping = count * stepping;
            }

            var xs = Math.floor((0 - tx) / stepping) * stepping + tx;
            var xe = Math.ceil(w / stepping) * stepping;
            var ys = Math.floor((0 - ty) / stepping) * stepping + ty;
            var ye = Math.ceil(h / stepping) * stepping;

            xe += Math.ceil(stepping);
            ye += Math.ceil(stepping);

            var ixs = Math.round(xs);
            var ixe = Math.round(xe);
            var iys = Math.round(ys);
            var iye = Math.round(ye);

            ctx.strokeStyle = "#d0d0d0";
            ctx.beginPath();
            for (var x = xs; x <= xe; x += stepping) {
              x = Math.round((x - tx) / stepping) * stepping + tx;
              var ix = Math.round(x);
              ctx.moveTo(ix + 0.5, iys + 0.5);
              ctx.lineTo(ix + 0.5, iye + 0.5);
            }

            for (var y = ys; y <= ye; y += stepping) {
              y = Math.round((y - ty) / stepping) * stepping + ty;
              var iy = Math.round(y);
              ctx.moveTo(ixs + 0.5, iy + 0.5);
              ctx.lineTo(ixe + 0.5, iy + 0.5);
            }
            ctx.closePath();
            ctx.stroke();

            minStepping = graph.gridSize * 2;
            stepping = minStepping * s;
            if (stepping < minStepping) {
              count = Math.round(Math.ceil(minStepping / stepping) / 2) * 2;
              stepping = count * stepping;
            }

            xs = Math.floor((0 - tx) / stepping) * stepping + tx;
            xe = Math.ceil(w / stepping) * stepping;
            ys = Math.floor((0 - ty) / stepping) * stepping + ty;
            ye = Math.ceil(h / stepping) * stepping;

            xe += Math.ceil(stepping);
            ye += Math.ceil(stepping);

            ixs = Math.round(xs);
            ixe = Math.round(xe);
            iys = Math.round(ys);
            iye = Math.round(ye);
            // Draws the actual grid
            ctx.strokeStyle = "#71717175";
            ctx.beginPath();
            for (let x = xs; x <= xe; x += stepping) {
              x = Math.round((x - tx) / stepping) * stepping + tx;
              ix = Math.round(x);
              ctx.moveTo(ix + 0.5, iys + 0.5);
              ctx.lineTo(ix + 0.5, iye + 0.5);
            }

            for (let y = ys; y <= ye; y += stepping) {
              y = Math.round((y - ty) / stepping) * stepping + ty;
              iy = Math.round(y);
              ctx.moveTo(ixs + 0.5, iy + 0.5);
              ctx.lineTo(ixe + 0.5, iy + 0.5);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }
      }
    };
  } catch (e) {
    mxLog.show();
    mxLog.debug("Using background image");
    //container.style.backgroundImage = 'url(\'./images/grid.gif\')';
  }

  var mxGraphViewValidateBackground = graph.view.validateBackground;
  graph.view.validateBackground = function () {
    mxGraphViewValidateBackground.apply(this, arguments);
    repaintGrid();
  };

  return repaintGrid;
}
