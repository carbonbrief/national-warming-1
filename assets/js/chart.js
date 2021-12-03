var margin = {
    top: 10, 
    right: 25, 
    bottom: 28, 
    left: 37
},
    // calculate the width of the chart from the width of the line-wrapper
    width = parseInt(d3.select("#historical-chart").style("width")) - margin.left - margin.right,
    height = parseInt(d3.select("#historical-chart").style("height")) - margin.top - margin.bottom;

var parseDate = d3.timeParse("%Y");
var timeFormat = d3.timeFormat("%Y");

var x = d3.scaleTime()
    .range([0, width]);

var y = d3.scaleLinear()
    .range([height, 0]);

var initialCsv = "./assets/data/charts/warming/country_" + "United Kingdom" + ".csv";


// define the line
var valueLine = d3.line()
    //.defined(function(d) { return d.anomaly != 0; }) // remove values with exactly 0, since these are the nulls
    .defined(function(d) { return d.anomaly })
    .curve(d3.curveCardinal)
    .x(function(d) { return x(d.year);})
    .y(function(d) { return y(d.anomaly); });


var zeroLine = d3.line()
    .y(function(d) { return y(0); })
    .x(function(d) { return x(d.year); })


// for the first chart
var color1 = d3.scaleOrdinal()
    .domain(["obs_anoms", "smoothed_anoms"])
    .range(["#f4f4f4", "#Ca4a78"]);

// for the second chart
var color2 = d3.scaleOrdinal()
    .domain(["obs_anoms", "ssp126", "ssp245", "ssp370", "ssp585"])
    .range(["#f4f4f4", "#efc530", "#DD8A3E", "#c7432b", "#A14A7B"]);

var lineWidth = {
    "obs_anoms": 1,
    "smoothed_anoms": 2.5
}

var xAxis = d3.axisBottom(x).tickFormat(timeFormat);

var yAxis = d3.axisLeft(y);

var div1 = d3.select("#historical-chart").append("div")
    .attr("id", "tooltip1")
    .attr("class", "tooltip")
    .style("opacity", 0);

var div2 = d3.select("#future-chart").append("div")
    .attr("id", "tooltip2")
    .attr("class", "tooltip")
    .style("opacity", 0);

var t = d3.transition()
    .duration(2000) //shortened duration to avoid issues if second square is clicked before first transition completes
    .ease(d3.easeQuad);

var yearFormat = d3.timeFormat("%Y");

var decimalFormat = d3.format(".2f");

var svg1 = d3.select("#historical-chart").append("svg")
    .attr("id", "svg-1")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var svg2 = d3.select("#future-chart").append("svg")
    .attr("id", "svg-2")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var filterData1 = {"obs_anoms":true,"smoothed_anoms":true};

// columns to show in the multiline chart
var filterData2 = {"obs_anoms":true,"ssp126":true,"ssp245":true, "ssp370": true, "ssp585":true};

// array to get column names in better format
var getName = {
    "obs_anoms": "Observed",
    "smoothed_anoms": "Smoothed average",
    "ssp126": "SSP126",
    "ssp245": "SSP245", 
    "ssp370": "SSP370", 
    "ssp585": "SSP585"
}

function drawChart1(){
    d3.csv(initialCsv, function(error, data) {

        if (error) throw error;

        // select exact columns since there are extra columns we won't be using
        color1.domain(d3.keys(data[0]).filter(function(key) { return key == "obs_anoms" || key == "smoothed_anoms"}));
        
        // format the data
        data.forEach(function(d) {
            d.year = parseDate(d.year);
        });

        var scenarios = color1.domain().map(function(name) {
            return {
            name: name,
            values: data.map(function(d) {
                return {
                    year: d.year, 
                    anomaly: +d[name] // this is the bit that turns blanks to 0
                };
            })
            };
        });

        var scenariosFiltered = scenarios.filter(function(d){return filterData1[d.name]==true;});

        x.domain([parseDate(1800), parseDate(2020)]);
        y.domain([
            -2,
            4
        ]);

        // Add the axis label (before line so always underneath)

        svg1.append("text")
        .attr("class", "axis label")
        // .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("x", 8)
        .attr("dy", ".5em")
        .style("text-anchor", "start")
        .style('fill', '#f4f4f4')
        .style('font-size', '10px')
        .text("Temperature anomaly (C)");

        svg1.append("clipPath")
        .attr("id", "graph-clip")
        .append("rect")
        .attr("width", width) 
        .attr("height", height); 

        // Add the line at zero.
        svg1.append("path")
        .data([data])
        .attr("class", "zero-line")
        .attr("clip-path","url(#graph-clip)")
        .attr("d", zeroLine);

        // Add the X Axis
        svg1.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

        // Add the Y Axis
        svg1.append("g")
        .attr("class", "yaxis")
        .call(yAxis);

        var multilines = svg1.selectAll(".multiline")
        .data(scenariosFiltered)
        .enter().append("g");

        multilines.append("clipPath")
        .attr("id", "graph-clip")
        .append("rect")
        .attr("width", width) 
        .attr("height", height); 

        multilines.append("path")
        .data(scenariosFiltered)
        .attr("class", "line")
        .attr("clip-path","url(#graph-clip)")
        .attr("d", function(d) { return valueLine(d.values); })
        .style("stroke", function(d) { return color1(d.name); })
        .style("stroke-width", function(d) { return lineWidth[d.name]; })
        .style("fill", "none")
        // .on("mouseover", mouseover1)
        // .on("mouseout", mouseout1);


    })
}

function updateChart1(csv) {

    // get the data again
    d3.csv(csv, function(error, data) {

        if (error) throw error;

        color1.domain(d3.keys(data[0]).filter(function(key) { return key == "obs_anoms" || key == "smoothed_anoms"}));

        // format the data
        data.forEach(function(d) {
            d.year = parseDate(d.year);
        });

        var scenarios = color1.domain().map(function(name) {
            return {
            name: name,
            values: data.map(function(d) {
                return {
                    year: d.year, 
                    anomaly: +d[name] // this is the bit that turns blanks to 0
                };
            })
            };
        });

        var scenariosFiltered = scenarios.filter(function(d){return filterData1[d.name]==true;});

        var calcMax = d3.max(scenariosFiltered, function(c) { return d3.max(c.values, function(v) { return v.anomaly; }); });
        // console.log(calcMax)
        var calcMin = d3.min(scenariosFiltered, function(c) { return d3.min(c.values, function(v) { return v.anomaly; }); });


        // y axis should change if the max value is over 2.9 but otherwise remain fixed at 3

        var yMax = function () {
            if (calcMax > 4) {
                return calcMax + 1;
            } 
            else {
                return 4;
            }
        }

        var yMin = function () {
            if (calcMin < -2) {
                return calcMin - 1;
            } else {
                return -2;
            }
        }

        // Scale the range of the data again 
        x.domain([parseDate(1800), parseDate(2020)]);
        y.domain([
            yMin(),
            yMax()
        ]);

        // console.log(y.domain())

        // Make the changes
       svg1.selectAll(".line")   // change the line
       .data(scenariosFiltered)
       .transition(t)
       .attr("d", function(d) { return valueLine(d.values); })
       .style("stroke", function(d) { return color1(d.name); })
    //    .style("fill", "none")

        // change the y axis
        svg1.select(".yaxis")
        .transition(t)
        .call(yAxis);

        // change the x axis
        svg1.select(".xaxis")
        .transition(t)
        .call(xAxis);

        // update the position of the zeroline
        
        svg1.select(".zero-line")
        .transition(t)
        .attr("d", zeroLine);

        // Add hover circles

        // remove old circles before appending new ones
        svg1.selectAll(".hover-circles1").remove();

        var circles = svg1.selectAll(".hover-circles1")
        .data(scenariosFiltered)
        .enter()
        .append("g")
        .attr("class", "hover-circles1");
        
        circles.selectAll("circle")
        .data(function(d){return d.values})
        .enter()
        .append("circle")
        // .filter(function(d) { return d.anomaly != 0 })
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.year); })
        .attr("cy", function(d) { return y(d.anomaly); })
        // in order to have a the circle to be the same color as the line, you need to access the data of the parentNode
        .attr("fill", function(d){return color1(this.parentNode.__data__.name)})
        .attr("opacity", 0)
        .on("mouseover", function(d) {

            var name = this.parentNode.__data__.name;

            //show circle
            d3.select(this)
            .transition()
            .duration(100)
            .style("opacity", 0.6)
            .attr("r", 5);

            // show tooltip
            div1.transition()
            .duration(30)
            .style("opacity", .95);
            div1.html("<p style= margin-bottom:0;color:" + color1(name) + 
            ";>" + getName[name] +
            "<br><span class='label-title'>Year: </span>" + yearFormat(d.year) + 
            "<br><span class='label-title'>Anomaly: </span>" + decimalFormat(d.anomaly) + 
            "C</p>")
            // .style("left", (d3.event.pageX - 58) + "px")
            // .style("top", (d3.event.pageY - 100) + "px");
            .style("font-size", "12px")
            .style("left", "61px")
            .style("top", "120px");

            // highlight line actions
            var lines = svg1.selectAll('.line');

            lines.filter(function (d) { return d.name != name; })
            .transition()
            .duration(30)
            .style("opacity", 0.6);

            var thisLine = svg1.selectAll('.line');

            thisLine.filter(function (d) { return d.name == name; })
            .transition()
            .duration(30)
            .style("stroke-width", function(d) {
                if (d.name == "obs_anoms") {
                    return 1.5;
                } else if (d.name == "smoothed_anoms") {
                    return 3;
                }
            })
            // .style("fill", "none");


         })
        .on("mouseout", function(d) {

            // hide circles
            d3.select(this)
            .transition()
            .duration(100)
            .style("opacity", 0)
            .attr("r", 4);

            // hide tooltip
            div1.transition()
            .duration(100)
            .style("opacity", 0);

            // reset opacity of lines
            svg1.selectAll(".line")
            .transition()
            .duration(30)
            .style("opacity", 1)
            .style("stroke-width", function(d) { return lineWidth[d.name]; })
            // .style("fill", "none");

        });

    });

}

function drawChart2() {
    d3.csv(initialCsv, function(error, data) {

        if (error) throw error;

        // select exact columns since there are extra columns we won't be using
        color2.domain(d3.keys(data[0]).filter(function(key) { return key == "obs_anoms" || key == "ssp126" || key == "ssp245" || key == "ssp370" || key == "ssp585" ; }));

        data.forEach(function(d) {
            d.year = parseDate(d.year);
        });

        var scenarios = color2.domain().map(function(name) {
            return {
            name: name,
            values: data.map(function(d) {
                return {
                    year: d.year, 
                    anomaly: +d[name]
                };
            })
            };
        });

        var scenariosFiltered = scenarios.filter(function(d){return filterData2[d.name]==true;});

        // console.log(scenariosFiltered);

        x.domain([parseDate(2000), parseDate(2100)]);
        y.domain([
            -1,
            (d3.max(scenariosFiltered, function(c) { return d3.max(c.values, function(v) { return v.anomaly; }); })*1.2)
        ]);

        svg2.append("text")
        .attr("class", "axis label")
        // .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("x", 8)
        .attr("dy", ".5em")
        .style("text-anchor", "start")
        .style('fill', '#f4f4f4')
        .style('font-size', '10px')
        .text("Temperature anomaly (C)");

        // svg2.append("clipPath")
        // .attr("id", "graph-clip")
        // .append("rect")
        // .attr("width", width) 
        // .attr("height", height);

        // Add the line at zero.
        svg2.append("path")
        .data([data])
        .attr("class", "zero-line")
        .attr("clip-path","url(#graph-clip)")
        .attr("d", zeroLine);

        // Add the X Axis
        svg2.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

        // Add the Y Axis
        svg2.append("g")
        .attr("class", "yaxis")
        .call(yAxis);

        var multilines = svg2.selectAll(".multiline")
        .data(scenariosFiltered)
        .enter().append("g");

        multilines.append("clipPath")
        .attr("id", "graph-clip")
        .append("rect")
        .attr("width", width) 
        .attr("height", height); 

        multilines.append("path")
        .data(scenariosFiltered)
        .attr("class", "line")
        .attr("clip-path","url(#graph-clip)")
        .attr("d", function(d) { return valueLine(d.values); })
        .style("stroke", function(d) { return color2(d.name); })
        .style("stroke-width", "1.5")
        .style("fill", "none");


    })
}

function updateChart2 (csv) {

    // get the data again
    d3.csv(csv, function(error, data) {

        if (error) throw error;

        color2.domain(d3.keys(data[0]).filter(function(key) { return key == "obs_anoms" || key == "ssp126" || key == "ssp245" || key == "ssp370" || key == "ssp585" ; }));

        data.forEach(function(d) {
            d.year = parseDate(d.year);
        });

        var scenarios = color2.domain().map(function(name) {
            return {
            name: name,
            values: data.map(function(d) {
                return {
                    year: d.year, 
                    anomaly: +d[name]
                };
            })
            };
        });

        var scenariosFiltered = scenarios.filter(function(d){return filterData2[d.name]==true;});

        var calcMax = d3.max(scenariosFiltered, function(c) { return d3.max(c.values, function(v) { return v.anomaly; }); });

        var yMax = function () {
            if (calcMax > 7) {
                return calcMax + 1;
            } else {
                return 7;
            }
        }

        // scale the range of y domain
        x.domain([parseDate(2000), parseDate(2100)]);
        y.domain([
            -1, // keep fixed, otherwise min comes out too low since including all of obs_anoms
            yMax()
        ]);

        // Make the changes
       svg2.selectAll(".line")   // change the line
       .data(scenariosFiltered)
       .transition(t)
       .attr("d", function(d) { return valueLine(d.values); })
       .style("stroke", function(d) { return color2(d.name); })
       .style("fill", "none");

        svg2.select(".yaxis") // change the y axis
        .transition(t)
        .call(yAxis);

        // update the position of the zeroline
        svg2.select(".zero-line")
        .transition(t)
        .attr("d", zeroLine);

        // Add hover circles

        // remove old circles before appending new ones
        // make sure that 'selectAll' rather than select is use since it is a multiline chart
        svg2.selectAll(".hover-circles2").remove();

        var circles2 = svg2.selectAll(".hover-circles2")
        .data(scenariosFiltered)
        .enter()
        .append("g")
        .attr("class", "hover-circles2");
        
        circles2.selectAll("circle")
        .data(function(d){return d.values})
        .enter()
        .append("circle")
        // .filter(function(d) { return values[d.anomaly] != 0 })
        .attr("r", 4)
        .attr("cx", function(d) { return x(d.year) })
        .attr("cy", function(d) { return y(d.anomaly) })
        // in order to have a the circle to be the same color as the line, you need to access the data of the parentNode
        .attr("fill", function(d){return color2(this.parentNode.__data__.name)})
        .attr("opacity", 0)
        .on("mouseover", function(d) {

            var name = this.parentNode.__data__.name;

            //show circle
            d3.select(this)
            .transition()
            .duration(100)
            .style("opacity", 0.6)
            .attr("r", 5);

            // show tooltip
            div2.transition()
            .duration(30)
            .style("opacity", .95);
            div2.html("<p style= margin-bottom:0;color:" + color2(name) + 
            ";>" + getName[name] +
            "<br><span class='label-title'>Year: </span>" + yearFormat(d.year) + 
            "<br><span class='label-title'>Anomaly: </span>" + decimalFormat(d.anomaly) + 
            "C</p>")
            // .style("left", (d3.event.pageX - 55) + "px")
            // .style("top", (d3.event.pageY - 100) + "px");
            .style("font-size", "12px")
            .style("left", "61px")
            .style("top", "120px");

            // highlight line actions
            var lines = svg2.selectAll('.line');

            lines.filter(function (d) { return d.name != name; })
            .transition()
            .duration(30)
            .style("opacity", 0.6);

            var thisLine = svg2.selectAll('.line');

            thisLine.filter(function (d) { return d.name == name; })
            .transition()
            .duration(30)
            .style("stroke-width", "2")
            .style("fill", "none");


        })
        .on("mouseout", function(d) {

            // hide circles
            d3.select(this)
            .transition()
            .duration(100)
            .style("opacity", 0)
            .attr("r", 4);

            // hide tooltip
            div2.transition()
            .duration(100)
            .style("opacity", 0);

            // reset opacity of lines
            svg2.selectAll(".line")
            .transition()
            .duration(30)
            .style("opacity", 1)
            .style("stroke-width", "1.5")
            .style("fill", "none");
        });

    });

}

drawChart1();
drawChart2();




