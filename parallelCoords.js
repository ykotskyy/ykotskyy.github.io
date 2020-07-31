var multiDimantional={

	  display: function () {
        var tooltip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden")
            .text("a simple tooltip")
            .attr("class", "tooltip");

        var m = [30, 10, 10, 10],
            w = 1060 - m[1] - m[3],
            h = 600 - m[0] - m[2];

        var x = d3.scale.ordinal().rangePoints([0, w], 1),
            y = {},
            dragging = {};

        var line = d3.svg.line(),
            axis = d3.svg.axis().orient("left"),
            background,
            foreground;

        var svg = d3.select("body").append("svg")
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
            .append("g")
            .attr("transform", "translate(" + m[3] + "," + m[0] + ")");


        d3.csv("https://github.com/ykotskyy/ykotskyy.github.io/blob/master/PropertySales.csv", function(error, propertySales) {

            // Extract the list of dimensions and create a scale for each different than the city.
            x.domain(dimensions = d3.keys(propertySales[0]).filter(function(d) {
                return d != "Region" && (y[d] = d3.scale.linear()
                    .domain(d3.extent(propertySales, function(p) {
                        return +p[d];
                    }))
                    .range([h, 0]));
            }));

            // Add grey background lines for context. Draw the lines based on the dimensions of the path function.
            background = svg.append("g")
                .attr("class", "background")
                .selectAll("path")
                .data(propertySales)
                .enter().append("path")
                .attr("d", path);

            // Add blue foreground lines for focus. Draw the lines based on the dimensions of the path function and add tooltip.
            foreground = svg.append("g")
                .attr("class", "foreground")
                .selectAll("path")
                .data(propertySales)
                .enter().append("path")
                .attr("d", path).on("mouseover", function(n) {
                    d3.select(this).transition().duration(100)
                        .style({
                            'stroke': '#F00'
                        });
                    tooltip.text(n.Region + " Median List Price: $" + n["Median List Price"]);
                    return tooltip.style("visibility", "visible");
                })
                .on("mousemove", function() {
                    return tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
                })
                .on("mouseout", function(d) {
                    d3.select(this).transition().duration(100)
                        .style({
                            'stroke': 'steelblue'
                        })
                        .style({
                            'stroke-width': '2'
                        });
                    return tooltip.style("visibility", "hidden");
                });

            // Add a group element for each dimension.
            var g = svg.selectAll(".dimension")
                .data(dimensions)
                .enter().append("g")
                .attr("class", "dimension")
                .attr("transform", function(d) {
                    return "translate(" + x(d) + ")";
                })
                .call(d3.behavior.drag()
                    .on("dragstart", function(d) {
                        dragging[d] = this.__origin__ = x(d);
                        background.attr("visibility", "hidden");
                    })
                    .on("drag", function(d) {
                        dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
                        foreground.attr("d", path);
                        dimensions.sort(function(a, b) {

                            return position(a) - position(b);
                        });
                        x.domain(dimensions);
                        g.attr("transform", function(d) {

                            return "translate(" + position(d) + ")";
                        })
                    })
                    .on("dragend", function(d) {
                        delete this.__origin__;
                        delete dragging[d];
                        transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                        transition(foreground)
                            .attr("d", path);
                        background
                            .attr("d", path)
                            .transition()
                            .delay(500)
                            .duration(10)
                            .attr("visibility", null);
                    })
                );

            // Add an axis and title.
            g.append("g")
                .attr("class", "axis")
                .each(function(d) {
                    d3.select(this).call(axis.scale(y[d]));
                })
                .append("text")
                .attr("text-anchor", "middle")
                .attr("y", -9)
                .text(String);

            // Add and store a brush for each axis.
            g.append("g")
                .attr("class", "brush")
                .each(function(d) {
                    d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
                })
                .selectAll("rect")
                .attr("x", -8)
                .attr("width", 16);
        });

        function position(d) {
            var v = dragging[d];
            return v == null ? x(d) : v;
        }

        function transition(g) {
            return g.transition().duration(1000);
        }

        // Returns the path for a given data point. Per every dimension get start point and endpoint for the line.
        function path(d) {
            return line(dimensions.map(function(p) {
                return [position(p), y[p](d[p])];
            }));
        }

        // When brushing, don’t trigger axis dragging.
        function brushstart() {
            d3.event.sourceEvent.stopPropagation();
        }

        // Handles a brush event, toggling the display of foreground lines.
        function brush() {
            var actives = dimensions.filter(function(p) {
                    return !y[p].brush.empty();
                }),
                extents = actives.map(function(p) {
                    return y[p].brush.extent();
                });
            foreground.style("display", function(d) {
                return actives.every(function(p, i) {
                    return extents[i][0] <= d[p] && d[p] <= extents[i][1];
                }) ? null : "none";
            });
        }
		}};
