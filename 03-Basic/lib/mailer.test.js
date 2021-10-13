const rewire = require('rewire');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

var sandbox = sinon.createSandbox();
var mailer = rewire('./mailer');

describe('mailer', () => {
    let sendEmailStub;
    
    beforeEach(() => {
        sendEmailStub = sinon.stub().resolves('done');
        mailer.__set__('sendEmail', sendEmailStub);
    })

    afterEach(() => {
        sandbox.restore();
        mailer = rewire('./mailer');
    });

    context('sendWelcomeEmail', () => {
        it('should validate the inputs', async () => {
            await expect(mailer.sendWelcomeEmail()).to.eventually.be.rejectedWith('Invalid input');
            await expect(mailer.sendWelcomeEmail('a@a.bc')).to.eventually.be.rejectedWith('Invalid input');
            await expect(mailer.sendWelcomeEmail(undefined, 'John')).to.eventually.be.rejectedWith('Invalid input');
        });
        
        it('should call the sendEmail function', async () => {
            let result = await mailer.sendWelcomeEmail('a@abc.com', 'John');

            expect(result).to.be.equal('done');
            expect(sendEmailStub).to.have.been.calledWith('a@abc.com', 'Dear John, welcome to our family!');
        });

        it('should reject errors', async () => {
            sendEmailStub.rejects(new Error('fake'));

            await expect(mailer.sendWelcomeEmail('a@abc.com', 'John')).to.eventually.be.rejectedWith('fake');
        });
    });

    context('sendPasswordResetEmail', () => {
        it('should validate the inputs', async () => {
            await expect(mailer.sendPasswordResetEmail()).to.eventually.be.rejectedWith('Invalid input');
            await expect(mailer.sendPasswordResetEmail(null)).to.eventually.be.rejectedWith('Invalid input');
        });
        
        it('should call the sendEmail function', async () => {
            let result = await mailer.sendPasswordResetEmail('a@abc.com');

            expect(result).to.be.equal('done');
            expect(sendEmailStub).to.have.been.calledWith('a@abc.com', 'Please click http://some_link to reset your password.');
        });

        it('should reject errors', async () => {
            sendEmailStub.rejects(new Error('fake'));

            await expect(mailer.sendPasswordResetEmail('a@abc.com')).to.eventually.be.rejectedWith('fake');
        });
    });

    context('sendEmail', () => {
        let sendEmail;

        beforeEach(() => {
            mailer = rewire('./mailer');
            sendEmail = mailer.__get__('sendEmail');
        });

        it('should check email and body', async () => {
            await expect(sendEmail()).to.eventually.rejectedWith('Invalid input');
            await expect(sendEmail('a@123.com')).to.eventually.rejectedWith('Invalid input');
            await expect(sendEmail(null, 'John')).to.eventually.rejectedWith('Invalid input');
        });

        it('should send email', async () => {
            await expect(sendEmail('a@123.com', 'A')).to.eventually.be.equal('Email sent');
        });
    });
});