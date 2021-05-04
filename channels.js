'use strict';

const fetchData = require('fetchData');

function createRequestFromEvent(event) {
    return     {
        "tabell_id": event.tableId,
        "api_versjon": 1,
        "statuslinje": "N",
        "begrensning": 10,
        "kodetekst": "J",
        "desimal_separator": ".",
        "variabler": ["*"],
        "sortBy": [],
        "filter": [
        {
            "variabel": "Original Tittel",
            "selection": {
                "filter": "like",
                "values": [  event.searchTerm  ]
            }
        }
    ]
    };
};


 const searchHandler = async (event) => {
     let data;
    try {
        console.log(event);
        let request =  createRequestFromEvent(event);
        let response = await fetchData.fetch(request);
        data = response.data;
        console.log('status=' + response.status);
        console.log('statustext=' + response.statusText);
        console.log('(channels.searchHandler response.data=');
        console.log(response.data);
    } catch (err) {
        console.log("UPS Error!!!");
        console.log(err);
        return err;
    }
    return data;
};

exports.searchHandler = searchHandler;

