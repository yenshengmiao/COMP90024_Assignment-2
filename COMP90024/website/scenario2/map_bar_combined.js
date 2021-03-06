var margin = {top: 50, right: 50, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var formatPercent = d3.format();

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1, 1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(formatPercent);

var svg = d3.select("#temp").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.tsv("data.tsv", function(error, data) {

    data.forEach(function(d) {
        d.frequency = +d.frequency;
    });

    x.domain(data.map(function(d) { return d.letter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Frequency");

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.letter); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.frequency); })
        .attr("height", function(d) { return height - y(d.frequency); });

    d3.select("input").on("change", change);

    var sortTimeout = setTimeout(function() {
        d3.select("input").property("checked", true).each(change);
    }, 2000);

    function change() {
        clearTimeout(sortTimeout);

        // Copy-on-write since tweens are evaluated after a delay.
        var x0 = x.domain(data.sort(this.checked
            ? function(a, b) { return b.frequency - a.frequency; }
            : function(a, b) { return d3.ascending(a.letter, b.letter); })
            .map(function(d) { return d.letter; }))
            .copy();

        svg.selectAll(".bar")
            .sort(function(a, b) { return x0(a.letter) - x0(b.letter); });

        var transition = svg.transition().duration(750),
            delay = function(d, i) { return i * 50; };

        transition.selectAll(".bar")
            .delay(delay)
            .attr("x", function(d) { return x0(d.letter); });

        transition.select(".x.axis")
            .call(xAxis)
            .selectAll("g")
            .delay(delay);
    }
});

var json_mel = (function() {
    var json = null;
    $.ajax({
        'async': false,
        'url': "vic.json",
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();


var sentiment = (function() {
    var sentiment = null;
    $.ajax({
        'async': false,
        'url': "sentiment.json",
        'dataType': "json",
        'success': function (data) {
            sentiment = data;
        }
    });
    return sentiment;
})();


var scenario = (function() {
    var sentiment = null;
    $.ajax({
        'async': false,
        'url': "scenario_2.json",
        'dataType': "json",
        'success': function (data) {
            sentiment = data;
        }
    });
    return sentiment;
})();


var suburb_name = [];


var senti = new Array();
for(var i = 0; i < sentiment.length; i++){
    senti[sentiment[i]["suberb"]] = "Sentiment: " + "<br>Negative: "+ String(sentiment[i]["negative"]) + " " +
        "<br>Neutral: " + String(sentiment[i]["neutral"]) + " " +"<br>Positive: "+ String(sentiment[i]["postive"]);
}


var scene = new Array();
for(var i = 0; i < scenario.length; i++){
    scene[scenario[i]["suberb"]] = "Scenario 2: " + "<br>Negative: "+ String(scenario[i]["negative"]) + "<br>Neutral: " + String(scenario[i]["neutral"]) + "<br>Positive: " + String(scenario[i]["positive"]) + "<br>Total Count: " + String(scenario[i]["total_count"]);
}


var scene_map = new Array();

for(var i = 0; i < scenario.length; i++){

    scene_map[String(scenario[i]["suberb"])] = {
        "negative":scenario[i]["negative"],
        "neutral":scenario[i]["neutral"],
        "positive":scenario[i]["positive"],
    };
}

console.log(scene_map["Melbourne"]["negative"]);
console.log(scene_map["Melbourne"]["positive"]);
console.log(scene_map["Melbourne"]["neutral"]);



var addListenersOnPolygon = function(polygon) {
    google.maps.event.addListener(polygon, 'mousemove', function (event) {
        document.getElementById("suburb_info").innerHTML = "Suburb: <br>" + String(suburb_name[polygon.indexID]);
        var str = String(suburb_name[polygon.indexID]).trim();
        document.getElementById("sentiment_info").innerHTML = senti[str];
        document.getElementById("scenario_info").innerHTML = scene[str];
    });
};



function myMap (){

    var i;
    var j;
    var polygons = [];

    var melbourne = {lat: -37.813628, lng: 144.963058};

    var map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: melbourne
    });


    for(i = 0; i < json_mel.length; i++) {

        var coordinates = [];

        var suburb_name_temp = json_mel[i]["properties"]["Suburb_Name"].trim();

        suburb_name.push(suburb_name_temp);

        for (j = 0; j < json_mel[i]["geometry"]["coordinates"][0].length; j++) {
            var lng = json_mel[i]["geometry"]["coordinates"][0][j][0];
            var lat = json_mel[i]["geometry"]["coordinates"][0][j][1];
            coordinates.push(new google.maps.LatLng(lat, lng));
        }


        if(suburb_name_temp in scene_map) {


            if (scene_map[suburb_name_temp]["negative"] >= scene_map[suburb_name_temp]["neutral"] && scene_map[suburb_name_temp]["negative"] >= scene_map[suburb_name_temp]["positive"]) {
                var polygon = new google.maps.Polygon({
                    paths: coordinates,
                    strokeColor: 'red',
                    strokeOpacity: 0.3,
                    strokeWeight: 1,
                    fillColor: 'blue',
                    fillOpacity: '.3',
                    indexID: i
                })
            } else if (scene_map[suburb_name_temp]["neutral"] >= scene_map[suburb_name_temp]["negative"] && scene_map[suburb_name_temp]["neutral"] >= scene_map[suburb_name_temp]["positive"]) {
                var polygon = new google.maps.Polygon({
                    paths: coordinates,
                    strokeColor: 'red',
                    strokeOpacity: 0.6,
                    strokeWeight: 1,
                    fillColor: 'blue',
                    fillOpacity: '.6',
                    indexID: i
                })
            } else if (scene_map[suburb_name_temp]["positive"] >= scene_map[suburb_name_temp]["neutral"] && scene_map[suburb_name_temp]["positive"] >= scene_map[suburb_name_temp]["negative"]) {
                var polygon = new google.maps.Polygon({
                    paths: coordinates,
                    strokeColor: 'red',
                    strokeOpacity: 0.9,
                    strokeWeight: 1,
                    fillColor: 'blue',
                    fillOpacity: '.9',
                    indexID: i
                })
            }

        }

        polygon.setMap(map);
        addListenersOnPolygon(polygon);
    }

    // google.maps.event.addListener(map,'click',function(event){
    //     for(i = 0; i < polygons.length; i++){
    //         if(google.maps.geometry.poly.containsLocation(event.latLng, polygons[i])){
    //             document.getElementById("suburb_info").innerHTML = suburb_name[i];
    //             polygons[i].setOption({strokeColor:'green'});
    //         }else{
    //             polygons[i].setOption({strokeColor:'red'});
    //         }
    //
    //     }
    // });

}

var toggle = function() {
    var on = false;
    return function() {
        if(!on) {
            on = true;
            document.getElementById('mydiv').style.visibility='hidden';
            return;
        }
        //Do stuff if OFF
        document.getElementById('mydiv').style.visibility='visible';
        on = false;
    }
}();

toggle(); //Set OFF as default

document.addEventListener('keydown',function(e) {
    var key = e.keyCode || e.which;
    if(key > 0) {
        toggle();
    }
}, false);

dragElement(document.getElementById("mydiv"));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


