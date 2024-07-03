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

    for (let i = 0; i < 5; i++) {
        let busNumber = body[i].lineId;
        let dateTime = new Date(Date.parse(body[i].expectedArrival))
        timesToSort.push({[body[i].lineId]: dateTime});
    };
    console.log(body);
    console.log(timesToSort);
    // let arrivalTime = dateTime.toLocaleTimeString('en-GB');
    // let arrivalDate = dateTime.toLocaleDateString('en-GB');

    // console.log(`Bus number ${busNumber} will arrive at ${arrivalTime} on ${arrivalDate}.`);
}


/////////////////////
outputData() ;