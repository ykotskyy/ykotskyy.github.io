var areaChart={
  display: function () {
        var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 100
            },
            width = 960 - margin.left - margin.right,
            height = 600 - margin.top - margin.bottom;

        var parseDate = d3.time.format("%m/%d/%Y").parse;


        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var color = d3.scale.category20();

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        var area = d3.svg.area()
            .x(function(d) {
                return x(d.PeriodBegin);
            })
            .y0(function(d) {
                return y(d.y0);
            })
            .y1(function(d) {
                return y(d.y0 + d.y);
            });

        var x2 = d3.time.scale().range([0, width]);

        var stack = d3.layout.stack()
            .values(function(d) {
                return d.values;
            });

        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        function brushed() {
            x.domain(brush.empty() ? x2.domain() : brush.extent());
            focus.selectAll("path.focus").attr("d", function(d) {
                return area(d.values)
            });
            focus.select(".x.axis").call(xAxis);
        }
        var brush = d3.svg.brush()
            .x(x2)
            .on("brush", brushed);
        var tooltip = d3.select("#tooltip");


        d3.csv("https://github.com/ykotskyy/ykotskyy.github.io/blob/master/PropertyPrices.csv", function(error, data) {
            color.domain(d3.keys(data[0]).filter(function(key) {
                return key !== "PeriodBegin";
            }));
            data.forEach(function(d) {
                d.PeriodBegin = parseDate(d.PeriodBegin);
            });

            var layers = stack(color.domain().map(function(name) {
                var result = {
                    name: name,
                    values: data.map(function(d) {
                        return {
                            PeriodBegin: d.PeriodBegin,
                            y: parseFloat(d[name]) * 1,
                            y0: 0
                        };
                    })
                };
                return result;
            }));

            // Find the value of the day with highest total value
            var maxDateVal = d3.max(data, function(d) {
                var vals = d3.keys(d).map(function(key) {
                    return key !== "PeriodBegin" ? parseFloat(d[key]) : 0
                });
                return d3.sum(vals);
            });

            // Set domains for axes
            x.domain(d3.extent(data, function(d) {
                return d.PeriodBegin;
            }));
            y.domain([0, maxDateVal]);



            var layer = svg.selectAll(".layer")
                .data(layers)
                .enter().append("g")
                .attr("class", "layer")
                .on("mouseover", function(d, i) {
                    tooltip.style("opacity", 1)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY) + "px")
                        .html("The mean property price of " + d.name + " is $" + parseInt(d.values.map(function(a) {
                            return a.y;
                        }).reduce((a, b) => a + b, 0) / d.values.length));
                })
                .on("mouseout", function() {
                    tooltip.style("opacity", 0)
                });

            layer.append("path")
                .attr("class", "area")
                .transition()
                .delay(function(d, i) {
                    return i * 1000;
                })
                .duration(1000)
                .attr("d", function(d) {
                    return area(d.values);
                })
                .style("fill", function(d) {
                    return color(d.name);
                });

            layer.append("text")
                .datum(function(d) {
                    return {
                        name: d.name,
                        value: d.values[d.values.length - 1]
                    };
                })
                .attr("transform", function(d) {
                    return "translate(" + x(d.value.PeriodBegin) + "," + y(d.value.y0 + d.value.y / 6) + ")";
                })
                .attr("x", -6)
                .attr("dy", ".35em")
                .text(function(d) {
                    return d.name;
                });

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(d3.svg.axis()
                    .scale(y)
                    .orient("left"));
        });
		}};
