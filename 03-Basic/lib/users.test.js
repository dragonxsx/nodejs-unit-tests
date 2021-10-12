const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const expect = chai.expect;

var mongoose = require('mongoose');

const users = require('./users');
const User = require('./models/user');
const user = require('./models/user');

describe('users', () => {

    let findStub;
    let sampleArgs;
    let sampleUser;

    let sandbox = sinon.createSandbox();

    beforeEach(() => {
        sampleUser = {
            id: 123,
            name: 'foo',
            email: 'foo@bar.com'
        }

        findStub = sandbox.stub(mongoose.Model, 'findById').resolves(sampleUser);
    });

    afterEach(() => {
        sandbox.restore();
    });

    context('get', () => {
        it('should check for an id', (done) => {
            users.get(null, (err, res) => {
                expect(err).to.exist;
                expect(err.message).to.equal('Invalid user id');
                expect(err).to.be.instanceOf(Error);
                done();
            });
        });

        it('should call findUserById with id and return result', (done) => {
            sandbox.restore();
            let stub = sandbox.stub(mongoose.Model, 'findById').yields(null, {name: 'foo'});

            users.get(123, (err, res) => {
                expect(err).to.not.exist;
                expect(stub).to.have.been.calledOnce;
                expect(stub).to.have.been.calledWith(123);
                expect(res).to.be.an('object');
                expect(res).to.have.property('name').to.equal('foo');
                done();
            });
        });

        it('should catch error if there is one', (done) => {
            sandbox.restore();
            let stub = sandbox.stub(mongoose.Model, 'findById').yields(new Error('fake'));

            users.get(123, (err, res) => {
                expect(res).to.not.exist;
                expect(err).to.exist;
                expect(err).to.be.instanceOf(Error);
                expect(stub).to.have.been.calledWith(123);
                expect(err.message).to.equal('fake');
                done();
            });
        });
    });
});