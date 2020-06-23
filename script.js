// all the code will be ready to run when the page is rendered. 
$(document).ready(function() {
  $("#search-button").on("click", function() {
  //  gets the value for the search value in the search-value id 
    var searchValue = $("#search-value").val();

    // clear input box when te search button is clicked
    $("#search-value").val("");

    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  //  takes note of your previous searches and makes a row. line 35 calls this function and displays
  // your searchValue within the new row
  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }
// pulls all of the data from the openweathermap API. 
  function searchWeather(searchValue) {
    // ajax call to pull the data from the local var data (local var data in parentheses line 29)
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=b5cabee6478652cc1e41dd82289f9529&units=imperial",
      dataType: "json",
      success: function(data) {
        console.log(data);
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
    
          makeRow(searchValue);
        }
        
        // clear any old content
        $("#today").empty();

        // create html content for current weather
        var title = $("<h3>").addClass("card-title").text(data.name + " (" + new Date().toLocaleDateString() + ")");
        var card = $("<div>").addClass("card");
        var wind = $("<p>").addClass("card-text").text("Wind Speed: " + data.wind.speed + " MPH");
        var humid = $("<p>").addClass("card-text").text("Humidity: " + data.main.humidity + "%");
        var temp = $("<p>").addClass("card-text").text("Temperature: " + data.main.temp + " °F");
        var cardBody = $("<div>").addClass("card-body");
        var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.weather[0].icon + ".png");

        // merge and add to page
        title.append(img);
        cardBody.append(title, temp, humid, wind);
        card.append(cardBody);
        $("#today").append(card);

        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
        getHourlyForecast(data.coord.lat, data.coord.lon);

        console.log(data);
      }
    });
  }
  
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=b5cabee6478652cc1e41dd82289f9529&units=imperial",
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
        $("#forecast").html("<h4 class=\"mt-3\">5-Day Forecast:</h4>").append("<div class=\"row\">");

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
         
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            // create html elements for a bootstrap card
            var col = $("<div>").addClass("col-md-2");
            var card = $("<div>").addClass("card bg-primary text-white");
            var body = $("<div>").addClass("card-body p-2");

            var title = $("<h5>").addClass("card-title").text(new Date(data.list[i].dt_txt).toLocaleDateString());

            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");

            var p1 = $("<p>").addClass("card-text").text("Temp: " + data.list[i].main.temp_max + " °F");
            var p2 = $("<p>").addClass("card-text").text("Humidity: " + data.list[i].main.humidity + "%");

            // merge together and put on page
            col.append(card.append(body.append(title, img, p1, p2)));
            $("#forecast .row").append(col);
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi?appid=b5cabee6478652cc1e41dd82289f9529&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        if (data.value < 3) {
          btn.addClass("btn-success");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning");
        }
        else {
          btn.addClass("btn-danger");
        }
        
        $("#today .card-body").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  // looks up the last searched item on page load. 
  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }
// creates another value for search history
  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
function getHourlyForecast(lat, lon){
  $.ajax({
    type: "GET",
    url: "https://api.openweathermap.org/data/2.5/onecall?lat="+lat+"&lon="+lon+"&appid=b5cabee6478652cc1e41dd82289f9529&units=imperial",
    dataType: "json",
    success: function(data) {
      $('#hourlyForecast').html("<h4 class=\"mt-3\">5-Hour Forecast:</h4>").append("<div class=\"row\">");
      var hour = moment().startOf("hour");
      console.log(hour);
      // gives us all 5 temps
      for (let i = 0; i < 5; i++) {
        var currentHourTemp = data.hourly[i].temp;
        
       
      //  card body
        var col = $("<div>").addClass("col-md-2");
        var card = $("<div>").addClass("card bg-primary text-white");
        var body = $("<div>").addClass("card-body p-2");

      //  values to append to card
      var time = $("<div>").text(hour.add(1,"h").format("h a"));
        console.log(time);
        var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.hourly[i].weather[0].icon + ".png");
        console.log(img);
        var temp = $("<p>").addClass("card-text").text("Temp: " + currentHourTemp + " °F");
        console.log(temp);

        // merge together and put on page
        col.append(card.append(body.append(time, img, temp)));
        $("#hourlyForecast .row").append(col);

      }
     
    
    }
});

}
