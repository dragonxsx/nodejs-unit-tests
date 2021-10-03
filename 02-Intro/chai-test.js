const chai = require('chai');
const expect = chai.expect;

describe('Chai tests', () => {
    it('Should be the 1st test', () => {
        expect(100).to.be.equal(99 + 1);
    });

    it('Should test some stuff', () => {
        console.log('environment ', process.env.NODE_ENV);
        
        expect({name: 'Long'}).to.deep.equal({name: 'Long'});
        expect({name: 'foo'}).to.have.property('name').to.equal('foo');
        expect(10 > 100).to.be.false;
        expect({}).to.be.an('object');
        expect([]).to.be.an('array');
        expect('jhgsd').to.be.a('string');
        expect(534).to.be.a('number');
        expect(null).to.be.null;
        expect(undefined).to.be.undefined;
        expect(undefined).to.not.exist;
        expect(100).to.exist;
        expect('foo').to.be.a('string').with.lengthOf(3);
        expect([1,2,3]).to.be.an('array').lengthOf(3);
    });
})