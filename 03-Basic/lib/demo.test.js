const chai  = require('chai');
const expect = chai.expect;

const demo = require('./demo');

describe('Basic of testing', () => {
    context('Test the demo module', () => {
        it('test the standard function', () => {
            const result = demo.add(1, 4);
            expect(result).to.equal(5);
        });
    });
});