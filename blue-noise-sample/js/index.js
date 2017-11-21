//read point data
d3.csv("point.csv",function(error,csvdata){  
    if(error){  
        console.log(error);  
    }
    var x = new Array();
    for (var i = 0,j=0; i < csvdata.length; i++) {
        if (csvdata[i].x != "") {
            x[j] = {};
            x[j].x = parseInt(csvdata[i].x);
            x[j].y = parseInt(csvdata[i].y);
            x[j].color = "";
            j++;
        }       
    }
    console.log(x);
    var sampler = new PoissonDiskSampler(x,500,500, 20, 200);
    var y = sampler.sampleUntilSolution();
    console.log(y);
    for (var i = 0; i < x.length; i++) {
        for (var j = 0; j < y.length; j++) {
            if (x[i].x == y[j].x && x[i].y == y[j].y) {
                x[i].color = "red";
                console.log("red");
            }
        }
    }
    var mux = 0, muy = 0, dx = 0,dy = 0;
    for (var i = 0; i < x.length; i++) {
        mux += x[i].x / x.length;
        muy += x[i].y / x.length;
    }
    for (var i = 0; i < x.length; i++) {
        dx += Math.pow((x[i].x - mux), 2)/x.length;
        dy += Math.pow((x[i].y - muy), 2)/x.length;
    }
    console.log("mean" + mux + " " + muy);
    console.log("dev" + dx + " " + dy);
    console.log("-----------------------------");
    mux = 0, muy = 0, dx = 0, dy = 0;
    for (var i = 0; i < y.length; i++) {
        mux += y[i].x / y.length;
        muy += y[i].y / y.length;
    }
    for (var i = 0; i < y.length; i++) {
        dx += Math.pow((y[i].x - mux), 2)/y.length;
        dy += Math.pow((y[i].y - muy), 2)/y.length;
    }
    console.log("mean" + mux + " " + muy);
    console.log("dev" + dx + " " + dy);


    d3.select("body").select("#pointsvg").selectAll("#points")
				.data(x).enter().append("circle")
				.attr("id", "ori_points")
				.attr("cx", function (d) { return d.x; })
				.attr("cy", function (d) { return d.y; })
				.attr("r", 2).attr("fill", function (d) { return d.color; });
    d3.select("body").select("#pointsvg1").selectAll("#points1")
               .data(y).enter().append("circle")
               .attr("id", "sample_points")
               .attr("cx", function (d) { return d.x; })
               .attr("cy", function (d) { return d.y; })
               .attr("r", 2).attr("fill","red" );
});  





