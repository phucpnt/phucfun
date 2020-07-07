import React from "react";
import { action } from "@storybook/addon-actions";
import { Button } from "@storybook/react/demo";
import * as d3 from "d3";
import * as d3s from "d3-shape";
import { events as demoEvents } from "./sample-data";

export default {
  title: "D3",
  component: Button,
};

export const Text = () => (
  <Button onClick={action("clicked")}>Hello Button</Button>
);

export const Emoji = () => (
  <Button onClick={action("clicked")}>
    <span role="img" aria-label="so cool">
      😀 😎 👍 💯
    </span>
  </Button>
);

const colors = [
  "#114559",
  "#a1bfca",
  "#8f6b8b",
  "#de8543",
  "#bfc491",
  "#9ea99f",
  "#bc827b",
  "#d8b441",
  "#2180a6",
  "#cbb5a5",
  "#656d78",
];

function RadiusChart({
  events = demoEvents,
  options = { xAxisMargin: 100 },
  style = { height: 600, width: 600, fontFamily: "Roboto, sans-serif" },
}) {
  const bw = 600;
  const hbw = 300;

  const cc = React.useRef();
  React.useEffect(() => {
    if (cc && cc.current) {
      const scaleAngle = d3
        .scaleLinear()
        .domain([
          0,
          Math.ceil(d3.max(events, (e) => 100 * Math.abs(e.period.value)) / 4) *
            4,
        ])
        .range([0, Math.PI * (3 / 2)]);

      const svg = d3
        .create("svg")
        .attr("viewBox", [-hbw, -hbw, bw, bw])
        .attr("style", "width: 100%; height: 100%;");
      svg
        .append("defs")
        .selectAll("pattern")
        .data(colors)
        .enter()
        .append("pattern")
        .attr("id", (c, index) => "negative-color-" + index)
        .attr("fill", (c) => c)
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 7)
        .attr("height", 7)
        .call(function (patt) {
          patt
            .append("rect")
            .attr("width", 5)
            .attr("height", 2)
            .attr("fill", (c) => c);
        });

      let gutter = 8;
      let thinkness = 28;

      const grid = svg.append("g").attr("transform", "scale(-1)");
      const gridLineAngle = [0, 45, 90, 135, 180, 225, 270];
      const gridLength = hbw - options.xAxisMargin / 2.5;

      gridLineAngle.forEach((angle) => {
        grid
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", gridLength)
          .attr("stroke-dasharray", "4 2")
          .attr("stroke", "#E1DFDF")
          .attr("transform", `rotate(${angle})`);
      });

      const axis = svg.append("g");
      const fmtAttBuzz = d3.format(".1~f");
      gridLineAngle.forEach((angle) => {
        const x = (10 + gridLength) * Math.sin(Math.PI * (1 - angle / 180));
        const y = (10 + gridLength) * Math.cos(Math.PI * (1 - angle / 180));
        axis
          .append("text")
          .attr("x", x)
          .attr("y", y)
          .attr("style", "font-size: 1em; fill: #333")
          .attr("text-anchor", "middle")
          .attr("alignment-baseline", "middle")
          .text(fmtAttBuzz(scaleAngle.invert((Math.PI * angle) / 180)));
      });

      const chart = svg
        .append("svg")
        .attr("width", bw - options.xAxisMargin)
        .attr("height", bw - options.xAxisMargin)
        .attr("style", "overflow: visible")
        .attr("viewBox", [0, 0, bw, bw]);
      chart
        .selectAll("g")
        .data(events)
        .join("g")
        .call((g) => {
          const p = g.append("path");
          const text = g.append("text");
          text
            .text((e) => e.eventInfo.name)
            .attr("text-anchor", "end")
            .attr("alignment-baseline", "middle")
            .attr("style", "font-family: inherit; font-size: 1.2em")
            .attr("dy", thinkness / 2)
            .attr("dx", gutter)
            .attr("y", (e, index) => -hbw + (thinkness + gutter) * index)
            .transition()
            .duration(750)
            .attrTween("dx", () => d3.interpolate(gutter, -gutter));

          p.transition()
            .duration(750)
            .ease(d3.easeQuadIn)
            .attrTween("d", (e, index) => {
              const arc = d3s
                .arc()
                .innerRadius(hbw - thinkness - (thinkness + gutter) * index)
                .outerRadius(hbw - (thinkness + gutter) * index)
                .startAngle(0);
              const interpolate = d3.interpolate(
                0,
                scaleAngle(100 * Math.abs(e.period.value))
              );
              return (t) => {
                return arc({ endAngle: interpolate(t) });
              };
            })
            .attr("stroke", (e, index) => colors[index])
            .attr("fill", (e, index) =>
              e.period.value < 0
                ? `url(#negative-color-${index})`
                : colors[index]
            );
        });

      if (cc.current.lastChild) {
        cc.current.removeChild(cc.current.lastChild);
      }
      cc.current.append(svg.node());
    }
  });
  return (
    <div
      ref={cc}
      style={style}
    ></div>
  );
}

export function DemoRadiusChart() {
  return (
    <div style={{display: 'flex'}}>
      <RadiusChart />
      <RadiusChart
        style={{ height: 380, width: 380, fontFamily: "Roboto, sans-serif" }}
      />
    </div>
  );
}
