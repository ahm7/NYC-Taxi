var fs = require('fs');
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();
var hash = new Object(); // date hash table
var month_hash = new Object(); // 
var vehcles_hash = new Object();
let vehicles_number = 0;
let num_of_days = 0;
let num_of_records = 0;
var yellow_taxi = new taxiProperties(0, 0, 0, 0, 0, 0);
var green_taxi = new taxiProperties(0, 0, 0, 0, 0, 0);
var fhv_taxi = new taxiProperties(0, 0, 0, 0, 0, 0);

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            num_of_records++;

            //console.log(Object.values(hash));
            // console.log("Received: '" + message.utf8Data + "'");
            const records = JSON.parse(message.utf8Data);
            if (records.pickupDateTime.charAt(0) === '"') {
                records.pickupDateTime = records.pickupDateTime.substring(1, records.pickupDateTime.length - 1);
            }
            if (records.vendorId.charAt(0) === '"') {
                records.records = records.vendorId.substring(1, records.vendorId.length - 1);
            }
            if (records.dropOffLocationId.charAt(0) === '"') {
                records.dropOffLocationId = records.dropOffLocationId.substring(1, records.dropOffLocationId.length - 1);
            }
            if (records.pickupLocationId.charAt(0) === '"') {
                records.pickupLocationId = records.pickupLocationId.substring(1, records.pickupLocationId.length - 1);
            }
            if (records.dropOffDatetime.charAt(0) === '"') {
                records.dropOffDatetime = records.dropOffDatetime.substring(1, records.dropOffDatetime.length - 1);
            }


            Number_of_Trips_per_day(records);
            var average_num_of_cares = average_vehicles_per_day(records);
            update_taxi_properties(records);
            update_num_of_trips_for_given_month(records);



        }

    });


});

client.connect('ws://localhost:9000/ws', null, 'http://localhost:9000');


function Number_of_Trips_per_day(records) {
    var date = records.pickupDateTime.split(" ");

    // implement hash for dates 

    // show the values stored
    // use hasOwnProperty to filter out keys from the Object.prototype
    if (hash.hasOwnProperty(date[0])) {
        hash[date[0]]++;

        //console.log('key is: ' + date[0] + ', value is: ' + hash[date[0]]);
    } else {

        hash[date[0]] = 1;
        //console.log('key is: ' + date[0] + ', value is: ' + hash[date[0]]);

        num_of_days++;
    }
}

function average_vehicles_per_day(records) {

    if (!vehcles_hash.hasOwnProperty(records.vendorId)) {
        vehcles_hash[records.vendorId] = 1
        vehicles_number++;
    }

    //console.log(records.vendorId) + ' ' + "car id";
    return vehicles_number / num_of_days;
}



function taxiProperties(num_of_trips, total_minutes, Minutes_per_trip,
    Num_of_trips_without_drop_off_location, NUM_of_madison_trips, NUM_of_woodside_trips) {

    this.num_of_trips = num_of_trips;
    this.total_minutes = total_minutes;
    this.Num_of_trips_without_drop_off_location = Num_of_trips_without_drop_off_location;
    this.Minutes_per_trip = Minutes_per_trip;
    this.NUM_of_madison_trips = NUM_of_madison_trips;
    this.NUM_of_woodside_trips = NUM_of_woodside_trips;
}


function update_taxi_properties(records) {

    // calculate the tiem of the trip 



    let trip_time = 0;
    const pickupDateTime = new Date(records.pickupDateTime)
    const dropOffDatetime = new Date(records.dropOffDatetime)


    trip_time = Math.abs(dropOffDatetime.getTime() - pickupDateTime.getTime()) / 60000;

    if (records.taxiType === "yellow") {

        let Object = records.dropOffLocationId;

        // first calcualte Num_of_trips_without_drop_off_location
        if (Object.length === 0) {
            yellow_taxi.Num_of_trips_without_drop_off_location = yellow_taxi.Num_of_trips_without_drop_off_location + 1;

        }
        // calculate average minutes per trip for this type of taxis

        yellow_taxi.total_minutes = yellow_taxi.total_minutes + trip_time;
        yellow_taxi.num_of_trips++;
        yellow_taxi.Minutes_per_trip = yellow_taxi.total_minutes / yellow_taxi.num_of_trips;

        // increase num of madison,brooklyn  or woodside,QUEENS
        // madison id is 149 &&  WOODSIDE ID IS 260
        if (records.pickupLocationId === '149') {

            yellow_taxi.NUM_of_madison_trips = yellow_taxi.NUM_of_madison_trips + 1;
        } else if (records.pickupLocationId === '260') {
            yellow_taxi.NUM_of_woodside_trips = yellow_taxi.NUM_of_woodside_trips + 1;


        }








    } else if (records.taxiType === "green") {


        let Object = records.dropOffLocationId;

        // first calcualte Num_of_trips_without_drop_off_location
        if (Object.length === 0) {
            green_taxi.Num_of_trips_without_drop_off_location = green_taxi.Num_of_trips_without_drop_off_location + 1;

        }
        // calculate average minutes per trip for this type of taxis

        green_taxi.total_minutes = green_taxi.total_minutes + trip_time;
        green_taxi.num_of_trips++;
        green_taxi.Minutes_per_trip = green_taxi.total_minutes / green_taxi.num_of_trips;

        // increase num of madison,brooklyn  
        // madison id is 149 
        if (records.pickupLocationId = "149") {

            green_taxi.NUM_of_madison_trips = green_taxi.NUM_of_madison_trips + 1;
        } else if (records.pickupLocationId === '260') {
            green_taxi.NUM_of_woodside_trips = green_taxi.NUM_of_woodside_trips + 1;


        }





    } else if (records.taxiType === "fhv") {



        let Object = records.dropOffLocationId;


        // first calcualte Num_of_trips_without_drop_off_location
        if (Object.length === 0) {
            fhv_taxi.Num_of_trips_without_drop_off_location = fhv_taxi.Num_of_trips_without_drop_off_location + 1;

        }
        // calculate average minutes per trip for this type of taxis

        fhv_taxi.total_minutes = fhv_taxi.total_minutes + trip_time;
        fhv_taxi.num_of_trips++;
        fhv_taxi.Minutes_per_trip = fhv_taxi.total_minutes / fhv_taxi.num_of_trips;

        // increase num of madison,brooklyn  
        // madison id is 149 
        if (records.pickupLocationId = "149") {

            fhv_taxi.NUM_of_madison_trips = fhv_taxi.NUM_of_madison_trips + 1;
        } else if (records.pickupLocationId === '260') {
            fhv_taxi.NUM_of_woodside_trips = fhv_taxi.NUM_of_woodside_trips + 1;


        }



    }
}


setInterval(updateStatisticsInFile, 1000)

function updateStatisticsInFile() {
    var fileText = num_of_records + ',' + num_of_records + ',' + '\n';
    console.log(Object.entries(month_hash).length);

    for (let i = 0; i < Object.entries(month_hash).length; i++) {
        console.log(Object.keys(month_hash)[i]);
        fileText += Object.keys(month_hash)[i] + ',' + Object.values(month_hash)[i] / 30 + ',' + '\n';
    }
    fileText += Object.entries(vehcles_hash).length + ',' + '\n';
    fileText += yellow_taxi.NUM_of_woodside_trips + ',';
    fileText += green_taxi.NUM_of_woodside_trips + ',';
    fileText += fhv_taxi.NUM_of_woodside_trips;

    fs.writeFile('results/results.txt', fileText, (err) => {
        if (err)
            console.log(err)
    });
}

function update_num_of_trips_for_given_month(records) {

    let temp = records.pickupDateTime.split(" ");
    let the_date = temp[0];
    the_date = the_date.substring(0, 7);

    if (month_hash.hasOwnProperty(the_date)) {
        month_hash[the_date]++;

    } else {

        month_hash[the_date] = 1;

    }

}
setInterval(makeCharts, 1000);

function makeCharts() {

    chart_of_trips_per_day()
    chart_of_madison_pickup();
    chart_of_minutes_per_trip();
    chart_of_vehicles_per_day();
    chart_of_no_dropOffLocationId();

}

function chart_of_trips_per_day() {
    var temp = [
        []
    ];
    temp[0] = Object.values(hash);
    var data = new Chartist.Bar('#trips_per_day', {
        // A labels array that can contain any sort of values
        labels: Object.keys(hash),
        // Our series array that contains series objects or in this case series data arrays
        series: temp
    });

}

function chart_of_vehicles_per_day() {

    let vehicles_per_day = vehicles_number / num_of_days;
    var data = new Chartist.Bar('#vehiclesperday', {
        // A labels array that can contain any sort of values
        labels: ['average num of vehicles per day '],
        // Our series array that contains series objects or in this case series data arrays
        series: [
            [vehicles_per_day]
        ]
    });


}


function chart_of_minutes_per_trip() {


    var data = new Chartist.Bar('#minutes_per_trip', {
        // A labels array that can contain any sort of values
        labels: ['yellow', 'green', 'fhv'],
        // Our series array that contains series objects or in this case series data arrays
        series: [
            [yellow_taxi.Minutes_per_trip, green_taxi.Minutes_per_trip, fhv_taxi.Minutes_per_trip]
        ]
    });

}

function chart_of_no_dropOffLocationId() {
    var data = new Chartist.Bar('#Nodroppoff', {
        // A labels array that can contain any sort of values
        labels: ['yellow', 'green', 'fhv'],
        // Our series array that contains series objects or in this case series data arrays
        series: [
            [yellow_taxi.Num_of_trips_without_drop_off_location, green_taxi.Num_of_trips_without_drop_off_location, fhv_taxi.Num_of_trips_without_drop_off_location]
        ]
    });

}

function chart_of_madison_pickup() {
    var data = new Chartist.Bar('#madison_chart', {
        // A labels array that can contain any sort of values
        labels: ['yellow', 'green', 'fhv'],
        // Our series array that contains series objects or in this case series data arrays
        series: [
            [yellow_taxi.NUM_of_madison_trips, green_taxi.NUM_of_madison_trips, fhv_taxi.NUM_of_madison_trips]
        ]
    });


}