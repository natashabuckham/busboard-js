fetch("https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals")
    .then(response => response.json())
    .then(body => 
        {for (let i = 0; i < 5; i++) {

            let busNumber = body[i].lineId;
            let dateTime = new Date(Date.parse(body[i].expectedArrival))
            let arrivalTime = dateTime.toLocaleTimeString('en-GB');
            let arrivalDate = dateTime.toLocaleDateString('en-GB');

            console.log(`Bus number ${busNumber} will arrive at ${arrivalTime} on ${arrivalDate}.`);
        }}
    );

    