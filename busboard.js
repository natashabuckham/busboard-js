const readlineSync = require('readline-sync');

//get latitude and longitude of a given postcode
async function fetchPostcodeData(postcode) {
    try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data: ', error);
    };
};

//output postcode data
async function outputPostcodeData(postcode) {
    const data = await fetchPostcodeData(postcode);

    if (!data) {
        return;
    }
    console.log(data);
};

//get list of stop points from latitude and longitude
//TO DO: start with radius of 500m then if that returns no stops, try again with increased radius of 100m each time until no longer returning no stops
async function fetchStopPointsByArea(postcode) {
    const postcodeData = await fetchPostcodeData(postcode);
    const lat = postcodeData.result.latitude;
    const lon = postcodeData.result.longitude;

    try {
        const response = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${lon}&stopTypes=NaptanBusCoachStation,NaptanBusWayPoint,NaptanOnstreetBusCoachStopCluster,NaptanOnstreetBusCoachStopPair,NaptanPublicBusCoachTram&radius=500&modes=bus`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    };
};

//output bus stops data
async function outputStopPoints(postcode) {
    const data = await fetchStopPointsByArea(postcode);

    if (!data) {
        return;
    }
    console.log(data);
};

//convert stop ids to stoppoint ids
async function convertToStopPointId(stopId) {
    try {
        const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${stopId}`);
        const data = await response.json();
        return data.lineGroup[0].naptanIdReference;
    } catch(error) {
        console.error('Error fetching data:', error);
    };
};

//get arrivals data
async function fetchArrivalsData(busStopCode) {
    try {
        const response = await fetch(`https://api.tfl.gov.uk/StopPoint/${busStopCode}/Arrivals`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    };
};

//output arrivals data
async function outputData(busStopCode) {
    const data = await fetchArrivalsData(busStopCode);

    if (!data) {
        return;
    }
    console.log(data);
};

//print next five buses
//TO DO: console.log a message if there are no upcoming buses
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

//print next five buses for the two nearest stops
async function twoNearestStopsBuses(postcode) {
    const data = await fetchStopPointsByArea(postcode);
    const stopOneCode = await convertToStopPointId(data.stopPoints[0].naptanId);
    const stopOneName = data.stopPoints[0].commonName;
    const stopTwoCode = await convertToStopPointId(data.stopPoints[1].naptanId);
    const stopTwoName = data.stopPoints[1].commonName;

    console.log(`Your two nearest stops are ${stopOneName} and ${stopTwoName}.`);
    console.log(`The next five buses to arrive at ${stopOneName} are:`);
    await printNext5Buses(stopOneCode);
    console.log(`The next five buses to arrive at ${stopTwoName} are:`);
    await printNext5Buses(stopTwoCode);
};

//ask user for a postcode
//TO DO: validate postcode and give feedback for invalid postcode
let postcode = readlineSync.question('Please enter a postcode:');
twoNearestStopsBuses(postcode);
