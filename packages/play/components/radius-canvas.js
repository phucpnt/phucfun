import React from "react";
import * as d3 from "d3";
import * as d3s from "d3-shape";
import { createUseStyles } from "react-jss";

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

const useStyle = createUseStyles({
  tooltip: {
    background: "#fff",
    transitionProperty: "left, top",
    transitionDuration: ".3s",
    transitionTimingFunction: "ease-out",
    boxShadow: "0 2px 4px 0 rgba(162,162,162,0.50)",
  },
});

function RadiusChart({
  events = [],
  options = { xAxisMargin: 100 },
  style = {
    height: 600,
    width: 600,
    fontFamily: "Roboto, sans-serif",
    position: "relative",
  },
  tooltipRender = () => null,
}) {
  const classes = useStyle();
  const cc = React.useRef();
  const ttc = React.useRef();
  const [eventFocus, setEventFocus] = React.useState(null);

  const bw = 600;
  const hbw = 300;
  React.useEffect(() => {
    if (cc && cc.current) {
      cc.current.style.position = "relative";

      const scaleAngle = d3
        .scaleLinear()
        .domain([
          0,
          Math.ceil(d3.max(events, (e) => 100 * Math.abs(e.period.value)) / 4) *
            4,
        ])
        .range([0, Math.PI * (3 / 2)]);

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
      let thinkness = 24;

      // draw the chart's grid
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

      // draw the chart's axis labels
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

      function setupCanvas(canvas) {
        // Get the device pixel ratio, falling back to 1.
        var dpr = window.devicePixelRatio || 1;
        // Get the size of the canvas in CSS pixels.
        var rect = canvas.getBoundingClientRect();
        // Give the canvas pixel dimensions of their CSS
        // size * the device pixel ratio.
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        var ctx = canvas.getContext('2d');
        // Scale all drawing operations by the dpr, so you
        // don't have to worry about the difference.
        ctx.scale(dpr, dpr);
        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width / (2 * dpr), canvas.height / (2 * dpr));
        return ctx;
      }
      


      function drawChartBar() {
        const canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.zIndex = -1;
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        cc.current.append(canvas);

        const context = setupCanvas(canvas)
        const actualRaidusLength = hbw - options.xAxisMargin / 2;

        context.beginPath();
        const memChart = d3.create("memchart");
        memChart
          .selectAll("memchart.bar")
          .data(events)
          .join("memchart:bar")
          .call((g) => {
            // draw the single curve chart: include the label and curve bar
            function noAnimation() {
              const p = g
                .append("memchart.bar.stick")
                .attr("class", "bar")
                .attr("data-event-index", (e, index) => index);
              p.attr("d", (e, index) => {
                context.beginPath();
                const arc = d3s
                  .arc()
                  .context(context)
                  .innerRadius(
                    actualRaidusLength -
                      thinkness -
                      (thinkness + gutter) * index
                  )
                  .outerRadius(
                    actualRaidusLength - (thinkness + gutter) * index
                  )
                  .startAngle(0)
                  .endAngle(scaleAngle(100 * e.period.value));
                arc(e);
                context.fillStyle = colors[index];
                context.fill();
              });
            }

            function withAnimation() {
              const p = g
                .append("memchart.bar.stick")
                .attr("class", "bar")
                .attr("data-event-index", (e, index) => index);
              p.transition()
                .duration(750)
                .ease(d3.easeQuadIn)
                .attrTween("d", (e, index) => {
                  const arc = d3s
                    .arc()
                    .context(context)
                    .innerRadius(
                      actualRaidusLength -
                        thinkness -
                        (thinkness + gutter) * index
                    )
                    .outerRadius(
                      actualRaidusLength - (thinkness + gutter) * index
                    )
                    .startAngle(0);
                  const interpolate = d3.interpolate(
                    0,
                    scaleAngle(100 * e.period.value)
                  );

                  return (t) => {
                    context.save();
                    context.beginPath();
                    arc({
                      endAngle: interpolate(t),
                    });
                    context.strokeStyle = "#fff";
                    context.stroke();
                    context.fillStyle = colors[index];
                    context.fill();
                    context.restore();
                  };
                });
            }

            // noAnimation();
            withAnimation();

            // p.transition()
            //   .duration(750)
            //   .ease(d3.easeQuadIn)
            //   .attrTween("d", (e, index) => {
            //     const arc = d3s
            //       .arc()
            //       .context(context)
            //       .innerRadius(hbw - thinkness - (thinkness + gutter) * index)
            //       .outerRadius(hbw - (thinkness + gutter) * index)
            //       .startAngle(0);
            //     const interpolate = d3.interpolate(
            //       0,
            //       scaleAngle(100 * e.period.value)
            //     );
            //     return (t) => {
            //       console.info(t);
            //       return arc({ endAngle: interpolate(t) });
            //     };
            //   })
          });
      }

      if (cc.current.lastChild) {
        cc.current.removeChild(cc.current.lastChild);
      }
      cc.current.append(svg.node());
      drawChartBar();

      // tooltip
      const tooltip = d3
        .select(ttc.current)
        .datum({ tid: 0, eventId: 0 })
        .style("position", "absolute");

      const preventHide = () => {
        let { tid } = tooltip.datum();
        window.clearTimeout(tid);
      };
      const hideTooltip = () => {
        let tid = window.setTimeout(() => {
          tooltip.style("display", "none");
          tooltip.datum({ tid: 0, eventId: 0 });
        }, 500);
        tooltip.datum((d) => ({ ...d, tid }));
      };

      d3.selectAll(".bar")
        .on("mouseover", (e) => {
          const { eventId: ttEventId } = tooltip.datum();
          console.info("eventId...", ttEventId, e.eventInfo.id);
          if (ttEventId !== e.eventInfo.id) {
            setEventFocus(e);
            tooltip
              .style("display", "block")
              .style("left", d3.event.pageX + 5 + "px")
              .style("top", d3.event.pageY + 5 + "px")
              .datum((d) => ({ ...d, eventId: e.eventInfo.id }));
          }
          preventHide();
        })
        .on("mouseout", hideTooltip);

      tooltip
        .on("mouseover", () => {
          preventHide();
        })
        .on("mouseout", hideTooltip);

      cc.current.append(tooltip.node());
    }
  }, []);

  return (
    <div>
      <div ref={ttc} className={classes.tooltip}>
        {eventFocus ? tooltipRender(eventFocus) : null}
      </div>
      <div ref={cc} style={style}></div>
    </div>
  );
}

export { RadiusChart };
