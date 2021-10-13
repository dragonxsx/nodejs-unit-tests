const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

const rewire = require('rewire');
var mongoose = require('mongoose');

var users = rewire('./users');
const User = require('./models/user');
const mailer = require('./mailer');

describe('users', () => {

    let findStub;
    let removeStub;
    let mailerStub;
    let resetPasswordStub;
    let sampleArgs;
    let sampleUser;

    let sandbox = sinon.createSandbox();

    beforeEach(() => {
        sampleUser = {
            id: 123,
            name: 'foo',
            email: 'foo@bar.com',
            save: sandbox.stub().resolves()
        }

        findStub = sandbox.stub(mongoose.Model, 'findById').resolves(sampleUser);
        removeStub = sandbox.stub(mongoose.Model, 'remove').resolves('fake_remove_result');
        mailerStub = sandbox.stub(mailer, 'sendWelcomeEmail').resolves('fake_email');
        resetPasswordStub = sandbox.stub(mailer, 'sendPasswordResetEmail').resolves('fake_email');
    });

    afterEach(() => {
        sandbox.restore();
        users = rewire('./users');
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

    context('delete', () => {
        it('should check for an id', () => {
           return users.delete(null).then(result => {
               throw new Error('unexpected success');
           }).catch(err => {
               expect(err).to.exist;
               expect(err).to.be.instanceOf(Error);
               expect(err.message).to.equal('Invalid id');
           });
        });

        it('should check for error using eventually', () => {
            return expect(users.delete()).to.eventually.be.rejectedWith('Invalid id');
        });

        it('should call User.remove', async () => {
            const result = await users.delete(123);
            expect(removeStub).to.have.been.calledOnce;
            expect(removeStub).to.have.been.calledWith({_id: 123});
            expect(result).to.equal('fake_remove_result');
        });
    });

    context('create', () => {
        let FakeUserClass, saveStub, result;

        beforeEach(async () => {
            saveStub = sandbox.stub().resolves(sampleUser);
            FakeUserClass = sandbox.stub().returns({save: saveStub});

            users.__set__('User', FakeUserClass);
            result = await users.create(sampleUser);
        })

        it('should reject invalid args', async () => {
            await expect(users.create()).to.eventually.rejectedWith('Invalid arguments');
            await expect(users.create({})).to.eventually.rejectedWith('Invalid arguments');
            await expect(users.create({email: 'a@123.com'})).to.eventually.rejectedWith('Invalid arguments');
            await expect(users.create({name: 'abc'})).to.eventually.rejectedWith('Invalid arguments');
        });

        it('should call User with new', () => {
            expect(FakeUserClass).to.have.been.calledWithNew;
            expect(FakeUserClass).to.have.been.calledWith(sampleUser);
        });

        it('should save the user', () => {
            expect(saveStub).to.have.been.calledOnce;
        });

        it('should send welcome email', () => {
            expect(mailerStub).to.have.been.calledWith(sampleUser.email, sampleUser.name);
        });

        it('shoud reject errors', async () => {
            saveStub.rejects(new Error('fake'));
            
            await expect(users.create(sampleUser)).to.eventually.rejectedWith('fake');
        });
    });

    context('update', () => {
        it('should find the user by id', async () => {
            await users.update(123, {name: 'abc'});

            expect(findStub).to.have.been.calledWith(123);
        });

        it('should save the user', async () => {
            await users.update(123, {name: 'abc'});

            expect(sampleUser.save).to.have.been.calledOnce;
        });

        it('should reject errors', async () => {
            findStub.rejects(new Error('fake'));

            await expect(users.update(123, {name: '123'})).to.eventually.be.rejectedWith('fake');
        });
    });

    context('resetPassword', () => {
        it('should error if no password provided', async () => {
            await expect(users.resetPassword()).to.eventually.be.rejectedWith('Invalid email');
            await expect(users.resetPassword(null)).to.eventually.be.rejectedWith('Invalid email');
        });

        it('should call the mailer.sendPasswordResetEmail', async () => {
            await users.resetPassword('a@abc.com');

            expect(resetPasswordStub).to.have.been.calledWith('a@abc.com');
        });

        it('should reject errors', async () => {
            resetPasswordStub.rejects(new Error('fake'));

            await expect(users.resetPassword('a@abc.com')).to.eventually.be.rejectedWith('fake');
        });
    });
});