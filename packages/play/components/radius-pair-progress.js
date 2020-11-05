import React from "react";
import * as d3 from "d3";
import * as d3s from "d3-shape";
import { createUseStyles } from "react-jss";

// const colors = [
//   "#EA501F",
//   "#0017AD",
//   "#8f6b8b",
//   "#de8543",
//   "#bfc491",
//   "#9ea99f",
//   "#bc827b",
//   "#d8b441",
//   "#2180a6",
//   "#cbb5a5",
//   "#656d78",
// ];


const colors = [
  // '#DA4F95',
  // '#DA4F95',
  '#7D16AD',
  '#7D16AD',
];
const useStyle = createUseStyles({
  tooltip: {
    background: "#fff",
    transitionProperty: "left, top",
    transitionDuration: ".3s",
    transitionTimingFunction: "ease-out",
    boxShadow: "0 2px 4px 0 rgba(162,162,162,0.50)",
  },
  number: {
    fontFamily: "sans-serif",
    fontSize: "40px",
    fill: "#777",
  },
});

function RadiusPairProgressChart({
  events = [],
  options = { xAxisMargin: 100 },
  style = { height: 180, width: 180, fontFamily: "Roboto, sans-serif" },
  centerImg = null,
  tooltipRender = () => null,
}) {
  const classes = useStyle();
  const cc = React.useRef();
  const ttc = React.useRef();
  const [eventFocus, setEventFocus] = React.useState(null);

  const bw = 180;
  const hbw = 90;
  React.useEffect(() => {
    if (cc && cc.current) {
      const tooltipContainer = ttc.current;

      const scaleAngle = d3.scaleLinear().domain([0, 100]).range([0, Math.PI]);

      // define the base viewBox
      const svg = d3
        .create("svg")
        .attr("viewBox", [-hbw, -hbw, bw, bw])
        .attr("style", "width: 100%; height: 100%;");

      // define the nagative color fill
      svg
        .append("defs")
        .selectAll("pattern")
        .data(colors)
        .enter()
        .append("pattern")
        .attr("id", (c, index) => "negative-color-" + index)
        .attr("fill", "#E1DFDF")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", 7)
        .attr("height", 7)
        .call(function (patt) {
          patt.append("rect").attr("width", 5).attr("height", 2);
        });

      let gutter = 8;
      let thinkness = 20;

      // draw the radius chart
      const chart = svg
        .append("svg")
        .attr("width", bw - options.xAxisMargin)
        .attr("height", bw - options.xAxisMargin)
        .attr("style", "overflow: visible")
        .attr("viewBox", [0, 0, bw, bw]);
      chart
        .selectAll("g")
        // .data(events)
        .data([1, 2])
        .join("g")
        .call((g) => {
          // draw the single curve chart: include the label and curve bar
          g.append("path")
            .attr("class", "bar")
            .attr("data-event-index", (e, index) => index)
            .attr("id", (e, index) => "textpath-" + index)
            .attr("d", (e, index) => {
              const startAngle = (-2 * Math.PI) / 3 + index * Math.PI;
              let arc = d3s
                .arc()
                .padAngle(0.1)
                .innerRadius(bw - 2 * thinkness)
                .outerRadius(bw - thinkness + 6)
                .startAngle(startAngle)
                .endAngle(startAngle + scaleAngle(100));
              return arc();
            })
            .attr("fill", "transparent");

          const bar = g
            .append("path")
            .attr("class", "bar")
            .attr("data-event-index", (e, index) => index)
            .attr("id", (e, index) => "bar-" + index)
            .attr("d", (e, index) => {
              const startAngle = (-2 * Math.PI) / 3 + index * Math.PI;
              let arc = d3s
                .arc()
                .padAngle(0.1)
                .innerRadius(bw - 2 * thinkness)
                .outerRadius(bw - thinkness)
                .startAngle(startAngle)
                .endAngle(startAngle + scaleAngle(100));

              return arc();
            })
            .attr("stroke", (_, index) => colors[index])
            .attr("fill", "transparent");

          const p = g
            .append("path")
            .attr("class", "progress")
            .attr("data-event-index", (e, index) => index);
          p.transition()
            .duration(750)
            .ease(d3.easeQuadIn)
            .attrTween("d", (e, index) => {
              const startAngle = (-2 * Math.PI) / 3 + index * Math.PI;
              const arc = d3s
                .arc()
                .padAngle(0.1)
                .innerRadius(bw - 2 * thinkness)
                .outerRadius(bw - thinkness)
                .startAngle(startAngle);
              const interpolate = d3.interpolate(0, scaleAngle(80));

              return (t) => {
                return arc({ endAngle: startAngle + interpolate(t) });
              };
            })
            .attr("fill", (_, index) => colors[index]);

          g
            .append("text")
            .attr("class", classes.number)
            .attr("width", "100px")
            .append("textPath")
            .attr("xlink:href", "#textpath-0")
            .html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1,238 USD"),
            // .attr("stroke", (e, index) => colors[index])
            // .attr("fill", (e, index) =>
            //   e.period.value < 0
            //     ? `url(#negative-color-${index})`
            //     : colors[index]
            // );

            function appendText() {
              const text = g.append("text");
              text
                .text((e) => e.eventInfo.name)
                .attr("text-anchor", "end")
                .attr("alignment-baseline", "middle")
                .attr(
                  "style",
                  `
                font-family: inherit; font-size: 1.2em; 
                text-shadow: -2px -2px 0 #fff,  2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff;
            `
                )
                .attr("dy", thinkness / 2)
                .attr("dx", gutter)
                .attr("y", (e, index) => -hbw + (thinkness + gutter) * index)
                .transition()
                .duration(750)
                .attrTween("dx", () => d3.interpolate(gutter, -gutter));
            };
        });

      if (cc.current.lastChild) {
        cc.current.removeChild(cc.current.lastChild);
      }
      cc.current.append(svg.node());

      // // tooltip
      // const tooltip = d3
      //   .select(ttc.current)
      //   .datum({ tid: 0, eventId: 0 })
      //   .style("position", "absolute");

      // const preventHide = () => {
      //   let { tid } = tooltip.datum();
      //   window.clearTimeout(tid);
      // };
      // const hideTooltip = () => {
      //   let tid = window.setTimeout(() => {
      //     tooltip.style("display", "none");
      //     tooltip.datum({ tid: 0, eventId: 0 });
      //   }, 500);
      //   tooltip.datum((d) => ({ ...d, tid }));
      // };

      // d3.selectAll(".bar")
      //   .on("mouseover", (e) => {
      //     const { eventId: ttEventId } = tooltip.datum();
      //     console.info("eventId...", ttEventId, e.eventInfo.id);
      //     if (ttEventId !== e.eventInfo.id) {
      //       setEventFocus(e);
      //       tooltip
      //         .style("display", "block")
      //         .style("left", d3.event.pageX + 5 + "px")
      //         .style("top", d3.event.pageY + 5 + "px")
      //         .datum((d) => ({ ...d, eventId: e.eventInfo.id }));
      //     }
      //     preventHide();
      //   })
      //   .on("mouseout", hideTooltip);

      // tooltip
      //   .on("mouseover", () => {
      //     preventHide();
      //   })
      //   .on("mouseout", hideTooltip);

      // cc.current.append(tooltip.node());
    }
  }, []);

  return (
    <div style={{ ...style, position: "relative" }}>
      <div ref={ttc} className={classes.tooltip}>
        {eventFocus ? tooltipRender(eventFocus) : null}
      </div>
      <div ref={cc} style={{ width: "100%", height: "100%" }}></div>
      <div
        style={{
          height: "60%",
          width: "60%",
          left: "20%",
          top: "20%",
          position: "absolute",
        }}
      >
        {centerImg}
      </div>
    </div>
  );
}

export { RadiusPairProgressChart };
