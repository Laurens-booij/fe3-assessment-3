# Interactive map with line chart
## Preview
![preview][preview]

## Description
This is an interactive visualisation that combines the geo-locations of ten different air-quality measuring stations in Amsterdam with a line chart that shows the measurements of one week.

## Background
The map shows a circle at the position of every measuring station. If a user hovers over a circle, a tooltip shows up displaying its name.

The chart shows the air quality index for the component NO2. It shows the values from one week, with two measurements being included in a day.

## Process
The line chart is based on [this chart][line chart] by [Mike Bostock][Bostock]. I got a map image of Amsterdam from [https://mapbox.com][map].

I started from scratch by writing the code to load and clean my data. After that I loaded the line chart. Then I formatted the data to make it compatible with the line chart.

From there on I loaded a map image and got circles to load in the correct positions. To these circles I added the event listeners that change the data in the line chart.

## Changes
The files that are included are listed below, along with all the changes I made:

### index.html
1. Created basic document structure.
2. Added `<head>` tag:
  ```html
  <head>
    <meta content="width=device-width,initial-scale=1" charset="utf-8">
    <link rel="stylesheet" href="index.css">
    <title>@laurens-booij</title>
    </head>
  ```

3. Added `<script>` tags:
  ```html
  <script type="text/javascript" src="https://d3js.org/d3.v4.min.js"></script> <!-- Links to d3 library -->
  <script type="text/javascript" src="index.js"></script>                      <!-- Links to `index.js` -->
  ```

4. Added `div` with nested `svg` to house the map with circles at station locations:
```html
<div class="map-container">
  <svg class="svg-map"></svg>
</div>
```

### index.js
* Loaded data from ten `.txt` files using `d3.queue`:

  ```javascript
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
      .awaitAll(function(error, files){              // Waits for all files to load and then store them in an array, accessible as parameter `files`

        // The rest of the code goes here   

      });        
  ```
  
  
* Created `parseTime` variable to later apply to the loaded date data. This creates the correct format for it to be read properly. See code below:
  ```javascript
  var parseTime = d3.timeParse("%Y-%m-%d%H:%M%Z");
  ```


* Added code to join the separate files, clean the data and map it into the right format:
  ```javascript
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
  ```


* Added code to filter the data:
  ```javascript
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
  ```
  
  
  * Added global var `stationNames`, containing an object that links the id's of the stations to their names:
    ```javascript
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
    ```


* Added code written by [Mike Bostock][Bostock] to create [line chart][line chart]:

  ```javascript
  var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var parseTime = d3.timeParse("%d-%b-%y");

  var x = d3.scaleTime()
    .rangeRound([0, width]);

  var y = d3.scaleLinear()
      .rangeRound([height, 0]);

  var line = d3.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.close); });

  d3.tsv("data.tsv", function(d) {
    d.date = parseTime(d.date);
    d.close = +d.close;
    return d;
  }, function(error, data) {
    if (error) throw error;

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain(d3.extent(data, function(d) { return d.close; }));

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
      .select(".domain")
        .remove();

    g.append("g")
        .call(d3.axisLeft(y))
      .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Price ($)");

    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
      });

  ```


 * Changed:
    ```javascript
    var svg = d3.select("svg")
    ```
    To:
    ```javascript
    var svg = d3.select("body").append("svg").attr("width", "960").attr("height", "500")
    ```
    This code creates the `svg` element for the line chart using `javascript`, instead of creating it manually using `html`



  * Changed:
    ```javascript
    d3.tsv("data.tsv", function(d) {
      d.date = parseTime(d.date);
      d.close = +d.close;
      return d;
    }, function(error, data) {
      if (error) throw error;

      //Code goes here //
    });
    ```
    To:
    ```javascript
    function loadChart(data) {

      //Code goes here //
    }
    ```
    This code changes the way the function that create the chart is called. Instead of directly invoking it after its loaded from a `tsv` file, it has to be called as a named function with the data passed on as a parameter.

  * Changed:
    ```javascript
    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);
    ```
    To:
    ```javascript
    g.append("path")
        .datum(data)
        .attr("d", lineAnimate)             // added
        .style("opacity", 0)                // added
        .transition()                       // added
        .duration(1500)                     // added
        .ease(d3.easeElastic)               // added
        .attr("fill", "none")
        .attr("stroke", "orange")           // changed
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .style("opacity", 1)                // added
        .attr("d", line);
    ```
  * Added code that creates a title for the chart:
    ```javascript
    title
      .text(stationNames[1]);            
    ```
    This code is accompanied by the content of variable `title`, which is defined globaly and looks like this:
    ```javascript
    var title =   g.append("text")
                    .attr("class", "title")
                    .attr("x", 15)
                    .attr("y", -10)
                    .style("font-family", "Helvetica");
    ```


* Added a `update()` function that updates the existing chart using new data that is passed on as a parameter:
  ```javascript
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
  ```
  A part of this code is copied from the original function from the [example][line chart].



* Added code to map values for circles in the map according to the container of the image. The map image is set as the background image for `.map-container`:

  ```javascript
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
  ```


* I had to get the correct x and y values for the circles. First, I manually created every dot using the following code for each circle:
```javascript
 d3.select(".svg-map")
      .append("circle")
      .attr("class", "circle-1")
      .attr("cx", mapX()) // x value goes inside `mapX()`
      .attr("cy", mapY()) // y value goes inside `mapY()`
      .attr("r",15);
```

 Once I got all the values, I stored them in a `csv` file. This looked as follows:

| id | x  | y  |
|----|----|----|
| 1  | 37 | 53 |
| 2  | 25 | 44 |
| 3  | 42 | 53 |
| 4  | 80 | 90 |
| 5  | 65 | 38 |
| 6  | 25 | 55 |
| 7  | 58 | 56 |
| 8  | 50 | 61 |
| 9  | 49 | 40 |
| 10 | 44 | 63 |

Then I wrote the following code to load the position of the circles from a `csv` file and load them in accordance. This code also adds the events for the tooltip an the update function.

See code below:
```javascript
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
```

For creating the tooltip, a global variable is also defined:
```javascript
var tooltip = d3.select(".map-container")
                  .append("div")
                  .attr("class", "tool-tip");
```

### index.css
All content of this file is written by me.

## Data
The data I used contains measurements from ten different stations in Amsterdam, which measure the quality of the air. It looks as follows:

| tijdstip                  | locatie               | component | waarde | LKI |
|---------------------------|-----------------------|-----------|--------|-----|
| 2017-04-03 02:00:00+02:00 | Amsterdam-Oude Schans | NO2       | 7,0    | 1   |
| 2017-04-03 02:00:00+02:00 | Amsterdam-Oude Schans | NO        | 0,3    | 1   |
| 2017-04-03 03:00:00+02:00 | Amsterdam-Oude Schans | NO2       | 6,9    | 1   |
| 2017-04-03 03:00:00+02:00 | Amsterdam-Oude Schans | NO        | 0,2    | 1   |
| 2017-04-03 04:00:00+02:00 | Amsterdam-Oude Schans | NO2       | 5,9    | 1   |
| 2017-04-03 04:00:00+02:00 | Amsterdam-Oude Schans | NO        | 0,3    | 1   |
| 2017-04-03 05:00:00+02:00 | Amsterdam-Oude Schans | NO2       | 8,6    | 1   |
| 2017-04-03 05:00:00+02:00 | Amsterdam-Oude Schans | NO        | 0,3    | 1   |

The stations took a measurement every hour. The data contains result about different components. The data i used was that of one week.

## Features
* __[D3](https://d3js.org/)__
* __[D3 queue](https://github.com/d3/d3-queue)__
* __[D3 csv](https://github.com/d3/d3/wiki/CSV)__
* __[D3 csvParseRows](https://github.com/d3/d3-dsv/blob/master/README.md#csvParseRows)__
* __[D3 transition](https://github.com/d3/d3-transition/blob/master/README.md#transition)__
* __[D3 select](https://github.com/d3/d3-selection/blob/master/README.md#select)__
* __[D3 selectAll](https://github.com/d3/d3-selection/blob/master/README.md#selectAll)__
* __[Selection append](https://github.com/d3/d3-selection/blob/master/README.md#selection_append)__
* __[Selection attr](https://github.com/d3/d3-selection/blob/master/README.md#selection_attr)__
* __[Selection enter](https://github.com/d3/d3-selection/blob/master/README.md#selection_enter)__

## Sources
The sources I used are the following:
* [data.amsterdam.nl][source] linked to [luchtmeetnet.nl][source-2], where I got my data from.
* [line chart][line chart] by [Mike Bostock][Bostock].
* Map from [www.mapbox.com][map].
* Tooltip inspired by: [link][tooltip]

## License
GNU General Public License version 3 © Laurens Booij

[source-1]: https://data.amsterdam.nl/#?dte=catalogus%2Fapi%2F3%2Faction%2Fpackage_show%3Fid%3D53430644-845b-4fbc-a7ee-bbff89741449&dtfs=T&mpb=topografie&mpz=11&mpv=52.3731081:4.8932945
[source-2]: https://www.luchtmeetnet.nl/download
[line chart]:https://bl.ocks.org/mbostock/3883245
[tooltip]: https://gist.github.com/d3noob/257c360b3650b9f0a52dd8257d7a2d73
[map]: https://www.mapbox.com
[Bostock]:https://bl.ocks.org/mbostock
[preview]: preview.png
