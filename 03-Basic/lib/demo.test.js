const chai  = require('chai');
const expect = chai.expect;

const demo = require('./demo');

describe('Basic of testing', () => {
    context('Test the demo module', () => {
        it('should test the standard function', () => {
            const result = demo.add(1, 4);
            expect(result).to.equal(5);
        });

        it('should test the callback function', (done) => {
            demo.addCallback(1, 4, (err, res) => {
                expect(err).is.not.exist;
                // expect(err).is.null;
                expect(res).to.equal(5);
                done();
            })
        });
    });
});