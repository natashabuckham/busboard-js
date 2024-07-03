const readlineSync = require('readline-sync');

//get list of stop points from latitude and longitude
//return their naptanId (busStopCode)
//start with radius of 500m then if that returns no stops, try again with increased radius of 100m each time until no longer returning no stops
async function fetchStopPointsByArea(lat, lon) {
    try {
        const response = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${lon}&stopTypes=NaptanBusCoachStation,NaptanBusWayPoint,NaptanOnstreetBusCoachStopCluster,NaptanOnstreetBusCoachStopPair,NaptanPublicBusCoachTram&radius=500&modes=bus`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    };
};

//output data
async function outputStopPoints(lat, lon) {
    const data = await fetchStopPointsByArea(lat, lon);

    if (!data) {
        return;
    }
    console.log(data);
};

//get data
async function fetchArrivalsData(busStopCode) {
    try {
        const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${busStopCode}/Arrivals`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    };
};

//output data
async function outputData(busStopCode) {
    const data = await fetchArrivalsData(busStopCode);

    if (!data) {
        return;
    }
    console.log(data);
};

//print next five buses
async function printNext5Buses(busStopCode) {
    const data = await fetchArrivalsData(busStopCode);
    let timesToSort = [];

    for (let i = 0; i < data.length; i++) {
        let busNumber = data[i].lineId;
        let timestamp = Date.parse(data[i].expectedArrival);
        let formattedTime = new Date(timestamp);

        timesToSort.push({number: busNumber, formatted: formattedTime, time: timestamp});
    };
    
    let sortedTimesFunction = () => timesToSort.sort((a, b) => {return a.time - b.time})
    
    let sortedTimes = sortedTimesFunction();

    for (let i = 0; i < 5; i++) {
        let number = sortedTimes[i].number;
        let time = sortedTimes[i].formatted.toLocaleTimeString('en-GB');
        let date = sortedTimes[i].formatted.toLocaleDateString('en-GB');
        console.log(`Bus number ${number} will arrive at ${time} on ${date}.`);
    };
};
//Ask user for postcode
// let postcode = readlineSync.question('Please enter a postcode:');
// printNext5Buses(busStopCode);

outputStopPoints(51.566699, -0.098956);