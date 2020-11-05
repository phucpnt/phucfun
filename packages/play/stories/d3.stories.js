import React from "react";
import * as ReactDOM from "react-dom";
import { action } from "@storybook/addon-actions";
import { Button } from "@storybook/react/demo";
import * as d3 from "d3";
import * as d3s from "d3-shape";
import { events as demoEvents } from "./sample-data";
import { createUseStyles } from "react-jss";
import { RadiusChart as RadiusCanvas } from "../components/radius-canvas";
import { RadiusChart as RadiusSvg } from "../components/radius-svg";
import { RadiusPairProgressChart } from "../components/radius-pair-progress";
import flagVN from "./Vietnam-24px.svg";
import flagSG from "./Singapore-24px.svg";
import flagID from "./Indonesia-24px.svg";
import flagMY from "./Malaysia-24px.svg";
import flagPH from "./Philippines-24px.svg";
import flagTH from "./Thailand-24px.svg";

export default {
  title: "D3",
  component: Button,
};

export function DemoRadiusChart() {
  return (
    <div style={{ display: "flex" }}>
      <RadiusSvg events={demoEvents} />
      <RadiusCanvas events={demoEvents} />
    </div>
  );
}

export function RadiusPairProgress() {
  return (
    <div style={{ display: "flex", width:'100%', flexWrap: 'wrap' }}>
      {[flagVN, flagSG, flagTH, flagID, flagPH, flagMY].map((flagSrc) => {
        return (
          <div key={flagSrc} style={{ width: "50%", marginBottom: '20px' }}>
            <RadiusPairProgressChart
              events={demoEvents}
              centerImg={
                <img style={{ height: "100%", width: "100%" }} src={flagSrc} />
              }
            />
          </div>
        );
      })}
    </div>
  );
}
