'use strict';

const chai = require('chai');
const {searchHandler} = require("../../channels");
const expect = chai.expect;

function isAnObject(result) {
    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(200);
    expect(result.body).to.be.an('string');
}

function isAValidJournal(response) {
    expect(response).to.be.an('object');
    expect(response.message).to.be.equal("hello journal");
}

function isAValidPublisher(response) {
    expect(response).to.be.an('object');
    expect(response.message).to.be.equal("hello publisher");
}


// describe('Tests journal', async function () {
//     const result = await channels.journal(event, context)
//     it('verifies response is success and has a body', function () {
//         isAnObject(result)
//     });
//     const response = JSON.parse(result.body);
//     it('verifies response is a valid journal', async () => {
//         isAValidJournal(response);
//     });
// });
//
// describe('Tests publisher', async function () {
//     const result = await channels.publisher(event, context)
//     it('verifies response is success and has a body', function () {
//         isAnObject(result)
//     });
//     const response = JSON.parse(result.body);
//     it('verifies response is a valid publisher', async () => {
//         isAValidPublisher(response);
//     });
// });


describe('Tests search for publication channel',  function () {
    let result;
    let event = { 'body' : { 'tableId' : '851', 'searchTerm' : '%Journal%' } };

    describe("TestSimpleSearch",  () => {

        it('verifies response is success and has a body', async function () {
            result = await searchHandler(event);
            expect(result).to.be.an('Array');
            expect(result).to.have.lengthOf(10);
        });
        console.log(result);
    });

    it('should be sucess', function () {
        console.log('is sucess');
        console.log(result)
        // expect(result.status).to.equal(200);
    });
});


