// Sources used
// data: https://www.luchtmeetnet.nl/download
// Line chart: https://bl.ocks.org/mbostock/3883245
// tooltip: https://gist.github.com/d3noob/257c360b3650b9f0a52dd8257d7a2d73




// Get all files using a callback //
d3.queue()
    .defer(d3.text, "data/einsteinweg.txt")
    .defer(d3.text, "data/haarlemmerweg.txt")
    .defer(d3.text, "data/JanVanGalenstraat.txt")
    .defer(d3.text, "data/kantershof.txt")
    .defer(d3.text, "data/nieuwendammerdijk.txt")
    .defer(d3.text, "data/ookmeer.txt")
    .defer(d3.text, "data/oudeSchans.txt")
    .defer(d3.text, "data/stadhouderskade.txt")
    .defer(d3.text, "data/vanDiemenstraat.txt")
    .defer(d3.text, "data/vondelpark.txt")
    .awaitAll(function(error, files){               // Waits for all files to load and then store them in an array, accesible as parameter `files`

      if (error) throw error; // if there's an error throw it

      // Declare variables for line chart//
      var svg = d3.select("body").append("svg").attr("width", "1000").attr("height", "500").attr("class", "linechart"),  // append an `svg` with a width, height  and class attribute to `.map-container` and store in `var svg`
          margin = {top: 50, right: 20, bottom: 150, left: 50},                                         // Define margins
          width = +svg.attr("width") - margin.left - margin.right,                                     // define var width
          height = +svg.attr("height") - margin.top - margin.bottom,                                   // define var height
          g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");  // append a group to `svg` and add transform attribute

      var parseTime = d3.timeParse("%Y-%m-%d%H:%M%Z");         // Create correct time format for the date to be stored

      var x = d3.scaleTime()                                  // define scale for the x-axis
          .rangeRound([0, width]);

      var y = d3.scaleLinear()                               // define scale for the y-axis
          .rangeRound([height, 10]);

      // code that creates the positions for the line
      var line = d3.line()
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.lki); });

      // code used for animation that creates the line with al points having a `y` value of 500 (bottom of the chart)
      var lineAnimate = d3.line()
          .x(function(d) { return x(d.date); })
          .y(500);

      var mapWidth = document.querySelector(".map-container").offsetWidth;   // get actual width of `.map-container`
      var mapHeight = document.querySelector(".map-container").offsetHeight; // get actual height of `.map-container`

      // map value between 0 and 100 to a value between 0 and `bodyWidth`
      var mapX = d3.scaleLinear()
                     .domain([0, 100 ])
                     .range([0, mapWidth]);

      // map value between 0 and 100 to a value between 0 and `bodyHeight`
      var mapY = d3.scaleLinear()
                     .domain([0, 100 ])
                     .range([0, mapHeight]);

      // create div to house tooltip
      var tooltip = d3.select(".map-container")
                        .append("div")
                        .attr("class", "tool-tip");

      // create base for text element to be added
      var title =   g.append("text")
                      .attr("class", "title")
                      .attr("x", 15)
                      .attr("y", -10)
                      .style("font-family", "Helvetica");


      // creates an object with all the names of the measuring stations
      // linked to keys that correspond to station id
      var stationNames = {1:"Einsteinweg",
                          2:"Haarlemmerweg",
                          3:"Jan van Gaalenstraat",
                          4:"Kantershof",
                          5:"Nieuwendammerdijk",
                          6:"Ookmeer",
                          7:"Oude Schans",
                          8:"Stadhouderskade",
                          9:"Van Diemenstraat",
                          10:"Vondelpark"};

      // Create an empty array `station`
      var station = [];

      // CLEANING THE CODE //
      var doc = files.join();                                  // joins the elements from array `files` together to form a string
          doc = doc.replace(/;/g, ",");
      var header = doc.indexOf("tijdstip");                    // get index of "tijdstip" and store it in var `header`
      var headerEnd = doc.indexOf("\n", header);               // get index of "\n", starting at index of `header`, and store it in var `headerEnd`
          header = doc.slice(header, headerEnd);               // slice the header from the text stored in `doc` and store it in var `header`
          doc = doc.slice(headerEnd + 1);                      // slice the top header from the rest of the data and store the data
          doc = doc.replace(/ /g,"");                          // remove al blank spaces
          doc = doc.replace(/:00:00/g,":00");                  // Change time notation from `20:00:00` to `20:00`

          // Replace station names with id numbers
          doc = doc.replace(/Amsterdam-Einsteinweg/g,"1");
          doc = doc.replace(/Amsterdam-Haarlemmerweg/g,"2");
          doc = doc.replace(/Amsterdam-JanvanGalenstraat/g,"3");
          doc = doc.replace(/Amsterdam-Kantershof/g,"4");
          doc = doc.replace(/Amsterdam-Nieuwendammerdijk/g,"5");
          doc = doc.replace(/Amsterdam-Ookmeer/g,"6");
          doc = doc.replace(/Amsterdam-OudeSchans/g,"7");
          doc = doc.replace(/Amsterdam-Stadhouderskade/g,"8");
          doc = doc.replace(/Amsterdam-VanDiemenstraat/g,"9");
          doc = doc.replace(/Amsterdam-Vondelpark/g,"10");

          cleanHeaders();                                      // run function `cleanHeaders`
          function cleanHeaders(){
            var headerCheck = doc.indexOf(header);             // Check if there is an instance of header, if not return -1

            if(headerCheck !== -1){                            // if there is an instance of value stored in `header` run code
              doc = doc.replace("\n" + "," + header, "");      //replace first instance of `"\n" + "," + header` with ""
              cleanHeaders();                                  // run function `cleanHeaders()` again
              return doc;                                      // return doc
            }
          }

          data = d3.csvParseRows(doc, map);                   // parse `doc` as csv and map the values using function `map()`

          // create objects from data, linking the values to the correct key
          function map(d) {
            return{
              date: parseTime(d[0]),
              station: d[1],
              component: d[2],
              waarde: d[3],
              lki: d[4]
            };
          }


          // separate measurements from each stations and store in array `station`
          for(i = 0; i < 12; i++){
            station[i] = data.filter(function(d){
              return d.station == i + 1;
            });
          }

          // reduce data to two measurements a day, instead of every hour
          for(i = 0; i < 12; i++){
            station[i] = station[i].filter(function(d){
              return d.date.getHours() == 14 || d.date.getHours() == 2;
            });
          }

          // filter measurements of component "NO2" from data
          for(i = 0; i < 12; i++){
            station[i] = station[i].filter(function(d){
              return d.component == "NO2";
            });
          }

          loadChart(station[0]); // load initial chart

          function loadChart(data) {

            x.domain(d3.extent(data, function(d) { return d.date; }));
            y.domain(d3.extent(data, function(d) { return d.lki; }));

            // add title to chart
            title
              .text(stationNames[1]);

            g.append("g")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
              .select(".domain")
                .remove();

            g.append("g")
                .call(d3.axisLeft(y))
              .append("text")
                .attr("fill", "#009999")
                .style("font-size", "2em")
                .attr("transform", "rotate(-90)")
                .attr("y", -45)
                .attr("dy", "1em")
                .attr("text-anchor", "end")
                .text("Lucht Kwaliteitsindex (NO2)");

            g.append("path")
                .datum(data)
                .attr("d", lineAnimate)
                .transition()
                .duration(2500)
                .ease(d3.easeSin)
                .attr("fill", "none")
                .attr("stroke", "orange")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 3)
                .style("opacity", 1)
                .attr("d", line);
            }

          function update(data) {

            x.domain(d3.extent(data, function(d) { return d.date; }));
            y.domain(d3.extent(data, function(d) { return d.lki; }));

            // add title to chart
            title
                .text(stationNames[data[0].station]);

            // update line
            g.selectAll("path")
                .datum(data)
                .transition()                       // create transition
                .duration(1500)                     // which takes 1500 ms to complete
                .ease(d3.easeSin)                   // add easing
                .attr("fill", "none")
                .attr("stroke", "orange")
                .attr("stroke-linejoin", "round")
                .attr("stroke-linecap", "round")
                .attr("stroke-width", 3)
                .attr("d", line);                 // update line
          }

          d3.csv("data/map-positions.csv", function(data) { // Load data containing `x` and `y` of circles, as well as an `id`

          // Create circles on map
          d3.select(".svg-map")       // Select `svg` element that ends up containing the circles
                .selectAll("circle")  // select all `circle` elements
                .data(data)           // define data
                .enter()              // for every element in the array `data`: do the following
                .append("circle")     // appends a `circle`
                .attr("class",  function(d) {return "circle-" + d.id;}) // gives the circle a unique class
                .attr("cx", function(d) {return mapX(d.x);}) //define `cx` according to `x` from `data`
                .attr("cy", function(d) {return mapY(d.y);}) //define `cy` according to `y` from `data`
                .attr("r",15)         // give `circle` radius of 15

                // on mouseover shows tooltip with name of the station
                .on("mouseover", function(d) {
                  tooltip.text(stationNames[d.id]);
                  tooltip.style("visibility", "visible");
                })
                //Folows cursor
                .on("mousemove", function() {
                  return tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
                })
                //Hides tool-tip on mouse out
                .on("mouseout", function() {
                  return tooltip.style("visibility", "hidden");})

                // on click run `update()` function that updates the chart to the clicked station's data
                .on("click", function(d){ update(station[d.id - 1]);});
            });

    });
