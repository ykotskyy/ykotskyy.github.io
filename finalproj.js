d3.select("body")
  .style("background-color", "black")
  .transition()
  .duration(1000)
  .style("background-color", "white");

var width = 1000,
	height = 800,
	zoomleft = -width,
	zoomdown = -(height/4),
	zoomscale = 2,
	zoomtime = 10000;

//select & resize
var svg1 = d3.select("#firstgraph")
	.attr("width", width)
	.attr("height", height);

var svg2 = d3.select("#secondgraph")
	.attr("width", width)
	.attr("height", height);

var path1 = d3.geoPath();
var path2 = d3.geoPath();

d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
  if (error) throw error;

	svg1.append("g")
		.attr("class", "states")
		.selectAll("path")
		.data(topojson.feature(us, us.objects.states).features)
		.enter().append("path")
		.attr("d", path1)
		.transition()
		.duration(zoomtime)
		.attr("transform", "translate(" + zoomleft+ "," + zoomdown + ")scale(" + zoomscale + ")");

	svg1.append("path")
		.attr("class", "state-borders")
		.attr("d", path1(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })))
		.transition()
		.duration(zoomtime)
		.attr("transform", "translate(" + zoomleft+ "," + zoomdown + ")scale(" + zoomscale + ")");
});


d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
  if (error) throw error;

  svg2.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
      .attr("d", path2);

  svg2.append("path")
      .attr("class", "county-borders")
      .attr("d", path2(topojson.mesh(us, us.objects.counties, function(a, b) { return a !== b; })));
});
