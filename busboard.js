//fetch("https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals")
//    .then(response => response.json())
//    .then(body => console.log(body));

async function fetchData() {
    try {
        const response = await fetch("https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function outputData() {
    const data = await fetchData();

    if (!data) {
        return;
    }
    console.log(data)
}



async function printNext5Buses() {
    const data = await fetchData();
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
}


/////////////////////
printNext5Buses() ;