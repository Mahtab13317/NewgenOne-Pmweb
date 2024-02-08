import React from "react";
import "./index.css";

export default function GenAILoader(props) {
  const { outerCircleColor, innerCircleColor, lineColor } = props;
  return (
    <div id="pmweb_genAI_loader_container">
      <svg
        id="pmweb_genAI_loader"
        viewBox="0 0 232 232"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <g id="Circle_1" fill="#0cf">
            <circle
              id="Circle_1_outer"
              cx="170"
              cy="50"
              r="40"
              fill={outerCircleColor || "url(#gradient)"}
            />
            <circle
              id="Circle_1_inner"
              cx="170"
              cy="50"
              r="15"
              fill={innerCircleColor || "white"}
            />
          </g>

          <g id="Circle_2" fill="#0cf">
            <circle
              id="Circle_2_outer"
              cx="50"
              cy="120"
              r="40"
              fill={outerCircleColor || "url(#gradient)"}
            />
            <circle
              id="Circle_2_inner"
              cx="50"
              cy="120"
              r="15"
              fill={innerCircleColor || "white"}
            />
          </g>

          <g id="Circle_3" fill="#0cf">
            <circle
              id="Circle_3_outer"
              cx="170"
              cy="190"
              r="40"
              fill={outerCircleColor || "url(#gradient)"}
            />
            <circle
              id="Circle_3_inner"
              cx="170"
              cy="190"
              r="15"
              fill={innerCircleColor || "white"}
            />
          </g>

          <line
            id="Line_1"
            x2="40"
            y2="120"
            x1="180"
            y1="200"
            style={{ stroke: lineColor || "url(#gradient)", strokeWidth: "20" }}
          />
          <line
            id="Line_2"
            x1="40"
            y1="120"
            x2="180"
            y2="40"
            style={{ stroke: lineColor || "url(#gradient)", strokeWidth: "20" }}
          />
          <line
            id="Line_3"
            x2="180"
            y2="200"
            x1="180"
            y1="40"
            style={{ stroke: lineColor || "url(#gradient)", strokeWidth: "20" }}
          />

          <linearGradient
            id="gradient"
            x1="-181.898"
            y1="-26.2736"
            x2="24.9698"
            y2="409.138"
            gradientUnits="userSpaceOnUse"
          >
            <stop stop-color="#51087E" />
            <stop offset="0.609375" stop-color="#B95846" />
            <stop offset="0.992477" stop-color="#FB8B23" />
          </linearGradient>
        </defs>
        <use href="#Line_1" fill="url(#gradient)" />
        <use href="#Line_2" />
        <use href="#Line_3" />
        <use href="#Circle_1" />
        <use href="#Circle_2" />
        <use href="#Circle_3" />
      </svg>
    </div>
  );
}
