fetch("https://api.tfl.gov.uk/StopPoint/490008660N/Arrivals")
    .then(response => response.json())
    .then(body => 
        {
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
    );

    