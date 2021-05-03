'use strict';

const channels = require('../../channels.js');
const chai = require('chai');
const expect = chai.expect;
let event, context;

function isAnObject(result) {
    console.log("isAnObject")
    expect(result).to.be.an('object');
    expect(result.statusCode).to.equal(200);
    expect(result.body).to.be.an('string');
}

function isAValidJournal(response) {
    console.log("isAValidJournal")
    expect(response).to.be.an('object');
    expect(response.message).to.be.equal("hello journal");
}

function isAValidPublisher(response) {
    console.log("isAValidPublisher")
    expect(response).to.be.an('object');
    expect(response.message).to.be.equal("hello publisher");
}


describe('Tests journal', async function () {
    const result = await channels.journal(event, context)
    it('verifies response is success and has a body', function () {
        isAnObject(result)
    });
    const response = JSON.parse(result.body);
    it('verifies response is a valid journal', async () => {
        isAValidJournal(response);
    });
});

describe('Tests publisher', async function () {
    const result = await channels.publisher(event, context)
    it('verifies response is success and has a body', function () {
        isAnObject(result)
    });
    const response = JSON.parse(result.body);
    it('verifies response is a valid publisher', async () => {
        isAValidPublisher(response);
    });
});

