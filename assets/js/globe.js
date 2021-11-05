// GLOBE
var marginGlobe = {
    top: 50, 
    right: 0, 
    bottom: 0, 
    left: 0
},

widthGlobe = parseInt(d3.select("#globe").style("max-width")) - marginGlobe.left - marginGlobe.right;
heightGlobe = parseInt(d3.select("#globe").style("max-height")) - marginGlobe.top - marginGlobe.bottom;
const config = {
    speed: 0.005,
    verticalTilt: -25,
    horizontalTilt: -10
}

var projection = d3.geoOrthographic()
    .scale(450)
    .clipAngle(90);

var path = d3.geoPath()
    .projection(projection);

var graticule = d3.geoGraticule()
    .extent([[-180, -90], [180 - .1, 90 - .1]]);

var svg = d3.select("#globe").append("svg")
    .attr("width", widthGlobe)
    .attr("height", heightGlobe)
    .attr("class", "globeContainer");

// svg.append("circle")
//     .attr("class", "graticule-outline")
//     .attr("cx", width / 2)
//     .attr("cy", height / 2)
//     .attr("r", projection.scale());

var line = svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

// svg.append("circle")
//     .attr("class", "graticule-outline")
//     .attr("cx", width / 2)
//     .attr("cy", height / 2)
//     .attr("r", projection.scale())
//     .style("fill", "none");

d3.queue()
    .defer(d3.json, "https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-110m.json")
    .defer(d3.tsv, "https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/world-country-names.tsv")
    .defer(d3.tsv, "assets/data/world-country-flags.tsv")
    .await(ready);   
    

            function ready(error, world, names, flags) {
//   var globe = {type: "Sphere"},
    //   land = topojson.feature(world, world.objects.land),
      globeCountries = topojson.feature(world, world.objects.countries).features;
                    // topojson.feature(worldData, worldData.objects.countries).features
      borders = topojson.mesh(world,
                              world.objects.countries,
                              function(a, b) { return a.id !== b.id; }),
      i = -1,
      n = 0;

    globeCountries = globeCountries.filter(function(d) {
    return names.some(function(n) {
      if (d.id == n.id) return d.name = n.name;
    });
  });
  n = globeCountries.length; // total countries after filtering

  flags.sort(function(a,b) {return +a.id < +b.id ? -1 : +a.id > +b.id ? +1 : 0;});

  var countryAni = svg.selectAll(".country")
      .data(globeCountries)
    .enter().insert("path", ".graticule")
      .attr("class", "country")
      .attr("d", path);
      // .style("fill", "#c7432b")
      // .attr("fill-opacity","0.8")
      // .style("fill-opacity", "1");

      enableRotation();    

      function enableRotation() {
          d3.timer(function (elapsed) {
              projection.rotate([config.speed * elapsed - 120, config.verticalTilt, config.horizontalTilt]);
              svg.selectAll("path").attr("d", path)
          });
      }

    //   function disableRotation() {
    //     d3.timer(function (elapsed) {
    //         projection.rotate([config.speed - config.speed]);
    //         svg.selectAll("path").attr("d", path)
    //     });
    // }

      

  (function transition() {
    d3.transition()
        .delay(500)
        .duration(350)
        .ease(d3.easeLinear)
        .on("start", function() { // listen for the transition's start event
          i = Math.floor(n * Math.random());
        })
        .tween("rotate", function countryRotate() {
          // var p = d3.geoCentroid(globeCountries[i]);
          return function(t) {
            countryAni.attr("d", path)
                   .style("fill", function(d, j) { return j === i ? "gold" : "#c7432b"; });
          };
        })
      .transition()
        .on("end", transition)
        // .on("interrupt", countryAni);

        d3.select("#country").on("change",function(){
          $('#globe').remove();
          });
   
    }
   
  
  )();
}

    