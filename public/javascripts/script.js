(function worker() {
  $.get('/api/getCurrentMetrics', function(data) {
        // Now that we've completed the request schedule the next one.
        //$('.result').html(data);
        console.log(data);
        //$("#temperature").html(data.temperature);
        $("#colevels").html(data.air_quality);
        //$("#gps").html(data.gps);
        setTimeout(worker, 1000);
  });
})();


