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

        it('should test the promise', (done) => {
            demo.addPromise(1,4)
                .then(value => {
                    expect(value).to.equal(5);
                    done();
                })
                .catch(err => {
                    done(err);
                })
        });

        it('should return a promise', () => {
            return demo.addPromise(1,4)
                .then(val => {
                    expect(val).to.equal(5);
                });
        });
    });
});