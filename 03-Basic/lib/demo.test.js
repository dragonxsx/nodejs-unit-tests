const chai  = require('chai');
const ChaiAsPromise = require('chai-as-promised');
const sinon = require('sinon');
const sinonchai = require('sinon-chai');

chai.use(ChaiAsPromise);
chai.use(sinonchai);

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

        it('should test the promise by using async-await', async () => {
            const result = await demo.addPromise(1, 4);
            expect(result).to.equal(5);
        });

        it('should test the promise by using chai-as-promised', async () => {
            await expect(demo.addPromise(1, 4)).to.eventually.equal(5);
        })
    });

    context('test doubles', () => {
        it('should spy on log', () => {
            let spy = sinon.spy(console, 'log');

            demo.foo();

            expect(spy.calledOnce).to.be.true;
            expect(spy).to.have.been.calledOnce;        // use sinon-chai to make calledOnce available
            spy.restore();                              // restore default behavior
        })
    });
});