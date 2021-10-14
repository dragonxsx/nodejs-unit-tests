const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

const expect = chai.expect;
chai.use(sinonChai);

const utils = require('./utils');
const config = require('./config');
const crypto = require('crypto');

let sandbox = sinon.createSandbox();

describe('utils',() => {
    let secretStub, createHashStub, updateStub, digestStub, hash;

    beforeEach(() => {
        secretStub = sandbox.stub(config, 'secret').returns('fake_secret');
        digestStub = sandbox.stub().returns('ABC123!');
        updateStub = sandbox.stub().returns({
            digest: digestStub
        });
        createHashStub = sandbox.stub(crypto, 'createHash').returns({
            update: updateStub
        });
    });

    afterEach(() => {
        sandbox.restore();
    })

    context('getHash', () => {
        beforeEach(() => {
            hash = utils.getHash('xyz');
        });

        it('should check the input', () => {
            expect(utils.getHash()).to.be.null;
            expect(utils.getHash(null)).to.be.null;
            expect(utils.getHash(undefined)).to.be.null;
            expect(utils.getHash(123)).to.be.null;
            expect(utils.getHash({a: 'asd'})).to.be.null;
        });

        it('should call the config.secret()', () => {
            expect(secretStub).to.be.calledOnce;
        })

        it('should call the crypto functions', () => {
            expect(createHashStub).to.be.calledOnceWith('md5');
            expect(updateStub).to.be.calledOnceWith('xyz_fake_secret');
            expect(digestStub).to.be.calledOnceWith('hex');
            expect(hash).to.be.equal('ABC123!');
        });
    });
});