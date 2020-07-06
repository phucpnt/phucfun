import React from "react";
import { action } from "@storybook/addon-actions";
import { Button } from "@storybook/react/demo";
import * as d3 from "d3";
import * as d3s from "d3-shape";
import { events } from "./sample-data";

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

export function RadiusChart() {
  const cc = React.useRef();
  React.useEffect(() => {
    if (cc && cc.current) {
      const scaleAngle = d3
        .scaleLinear()
        .domain([
          0,
          Math.ceil(d3.max(events, (e) => 100 * e.period.value) / 4) * 4,
        ])
        .range([0, Math.PI * (3 / 2)]);

      const svg = d3
        .create("svg")
        .attr("viewBox", [-300, -300, 600, 600])
        .attr("style", "width: 100%; height: 100%;");
      let gutter = 5;
      let thinkness = 20;

      const grid = svg.append("g")
        .attr("transform", "scale(1, -1)");
      const gridLineAngle = [0, 45, 90, 135, 180, 225, 270];
      // gridLineAngle.forEach((angle) => {
        grid
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 0)
          .attr("y2", 280)
          .attr("stroke-dasharray", "4 1")
          .attr("stroke", "black")
        grid
          .append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", 280)
          .attr("y2", 0)
          .attr("stroke-dasharray", "4 1")
          .attr("stroke", "black")
          // .attr("transform", `rotate(${angle})`);
      // });
      grid.append('text').attr('x', Math.sqrt(45000)).attr('y', Math.sqrt(45000)).text('AAA')

      const chart = svg.append("g").attr("transform", "scale(0.9)");
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
            .attr("style", "font-family: inherit;")
            .attr("dy", thinkness / 2)
            .attr("dx", gutter)
            .attr("y", (e, index) => -300 + (thinkness + gutter) * index)
            .transition()
            .duration(750)
            .attrTween("dx", () => d3.interpolate(gutter, -gutter));

          p.transition()
            .duration(750)
            .ease(d3.easeQuadIn)
            .attrTween("d", (e, index) => {
              const arc = d3s
                .arc()
                .innerRadius(280 - (thinkness + gutter) * index)
                .outerRadius(300 - (thinkness + gutter) * index)
                .startAngle(0);
              const interpolate = d3.interpolate(
                0,
                scaleAngle(100 * e.period.value)
              );
              return (t) => {
                return arc({ endAngle: interpolate(t) });
              };
            })
            .attr("fill", (e, index) => colors[index]);
        });


      // g.append('path').attr('d', )

      if (cc.current.lastChild) {
        cc.current.removeChild(cc.current.lastChild);
      }
      cc.current.append(svg.node());
    }
  });
  return <div ref={cc} style={{ height: 600, width: 600 }}></div>;
}
