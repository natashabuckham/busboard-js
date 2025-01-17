const readlineSync = require('readline-sync');

//get latitude and longitude of a given postcode
async function fetchPostcodeData(postcode) {
    try {
        const response = await fetch(`https://api.postcodes.io/postcodes/${postcode}`);
        const data = await response.json();
        if (response.status != 200) {
            throw data.error;
        } else { 
        return data;
        };
    } catch (error) {
        console.error('Error fetching data: ', error);
        throw error;
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
//start with radius of 500m then if that returns no stops, try again with increased radius of 100m each time until no longer returning no stops
async function fetchStopPointsByArea(postcode) {
    const postcodeData = await fetchPostcodeData(postcode);
    const lat = postcodeData.result.latitude;
    const lon = postcodeData.result.longitude;

    try {
        let radius = 500;
        let response = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${lon}&stopTypes=NaptanBusCoachStation,NaptanBusWayPoint,NaptanOnstreetBusCoachStopCluster,NaptanOnstreetBusCoachStopPair,NaptanPublicBusCoachTram&radius=${radius}&modes=bus`);
        let data = await response.json();
        isEmpty = (data.stopPoints.length == 0);
        while (isEmpty) {      
            radius += 100;
            response = await fetch(`https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${lon}&stopTypes=NaptanBusCoachStation,NaptanBusWayPoint,NaptanOnstreetBusCoachStopCluster,NaptanOnstreetBusCoachStopPair,NaptanPublicBusCoachTram&radius=${radius}&modes=bus`);
            data = await response.json();
            console.log(data);
            isEmpty = (data.stopPoints.length == 0); 
            if (radius > 3000)
                {
                    throw 'No nearby bus stops found, please enter a different postcode.';
                }          
        }
        return data;
    } catch (error) {
        console.error(error);
        throw error;
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
async function printNext5Buses(busStopCode) {
    const data = await fetchArrivalsData(busStopCode);
    let timesToSort = [];

    //console.log a message if there are no upcoming 
    //need to know how the data is formatted when there is no upcoming buses
    if (data.length==0) {
        console.log('There are no upcoming buses');
        return;
    } 

    for (let i = 0; i < data.length; i++) {
        let busNumber = data[i].lineId;
        let timestamp = Date.parse(data[i].expectedArrival);
        let formattedTime = new Date(timestamp);

        timesToSort.push({number: busNumber, formatted: formattedTime, time: timestamp});
    };
    
    let sortedTimesFunction = () => timesToSort.sort((a, b) => {return a.time - b.time})
    
    let sortedTimes = sortedTimesFunction();

    //print the 5 next buses, or less if there are less than 5 upcoming buses
    for (let i = 0; i < Math.min(5,data.length); i++) {
        let number = sortedTimes[i].number;
        let time = sortedTimes[i].formatted.toLocaleTimeString('en-GB');
        let date = sortedTimes[i].formatted.toLocaleDateString('en-GB');
        console.log(`Bus number ${number} will arrive at ${time} on ${date}.`);
    };

    if (data.length<5) {
        console.log(`There are only ${data.length} upcoming buses!`);
    }
};

//print next five buses for the two nearest stops
//refactor to reduce repetition
//separate console.logs from data sorting?
//function naming - what actions is the function doing?
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

async function getArrivalPoint(postcode) {
    const data = await fetchStopPointsByArea(postcode);
    const stopOneCode = await convertToStopPointId(data.stopPoints[0].naptanId);
    const stopOneName = data.stopPoints[0].commonName;
    const stopTwoCode = await convertToStopPointId(data.stopPoints[1].naptanId);
    const stopTwoName = data.stopPoints[1].commonName;

    let busStopName = readlineSync.question(`Which bus stop do you want to go to: 1.${stopOneName} or 2.${stopTwoName}?\n`);
    let busStopCode = undefined;
    if (busStopName == "1" || stopOneName) {
        busStopCode = stopOneCode;
    } else if (busStopName == "2" || stopTwoName) {
        busStopCode = stopTwoCode;
    } else {
        console.log("Didn't define bus stop code");
    };
    return (busStopCode);
}


async function fetchJourneyData(departurePoint,arrivalPoint) {
    try {
        const response = await fetch(`https://api.tfl.gov.uk/Journey/JourneyResults/${departurePoint}/to/${arrivalPoint}?mode=walking`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data: ', error);
        throw error;
    };
};

async function outputJourneyData(departurePoint, arrivalPoint) {
    const data = await fetchJourneyData(departurePoint, arrivalPoint);

    if (!data) {
        return;
    }
    console.log(data); 
};

async function getJourneyLegInstruction(postcode) {
    const arrivalPoint = await getArrivalPoint(postcode);
    const data = await fetchJourneyData(postcode,arrivalPoint);

    const journeyTime = data.journeys[0].duration;
    const steps = data.journeys[0].legs[0].instruction.steps;
    console.log(`It will take ${journeyTime} minutes to walk to your nearest stop. The directions are:`);

    for (let i = 0; i < steps.length; i++) {
        let descriptionHeading = data.journeys[0].legs[0].instruction.steps[i].descriptionHeading;
        let description = data.journeys[0].legs[0].instruction.steps[i].description;
        console.log(`Step ${i + 1}: ${descriptionHeading} ${description}`);
    };
};


async function runProgram(postcode) {
    //ask user for postcode of their location
    //validate postcode
        //if invalid - console log message and exit program
    //if valid - 
    //use postcode to get postcode data from postcode api
    //process the postcode data to extract latitude and longitude of the postcode
    //use latitude and longitude to find list of stops in a radius from tfl api
        //if no stops returned - increase radius and get list of stops again
        //stop after 3000m and console.log no stops found - exit program
    //if stops found -
    //get name and code data of first two stops in list - save stop names and codes in variables
    //console.log the names of the two nearest stops
        //REPEAT TWICE
        //get all arrivals data for a bus stop
        //sort arrivals data by arrival time and return first five
        //console log the first five arrivals
    //Ask user which bus stop they want directions to
    //Validate their answer
        //if invalid - give response and exit program
    //if valid -
    //assign arrival point from chosen bus stop
    //get journey data from tfl api using postcode variable and arrival point
    //extract 1.journey time 2.steps from journey data
    //console.log journey time
    //iterate through steps to console log the description heading and description for each step
    await twoNearestStopsBuses(postcode);
    await getJourneyLegInstruction(postcode);
};

//ask user for a postcode, validate postcode and give feedback for invalid postcode format
let postcode = readlineSync.question('Please enter a postcode:');
let isPostCode = postcode.match(/^[a-z]{1,2}\d[a-z\d]?\s*\d[a-z]{2}$/i);   // Regex found on https://ideal-postcodes.co.uk/guides/postcode-validation

if (isPostCode) {
    runProgram(postcode);
}else {
    console.log('This is not a correct postcode format. Try again.')
};
