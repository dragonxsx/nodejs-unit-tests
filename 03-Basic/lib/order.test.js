const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const user = require('./models/user');

chai.use(sinonChai);
const expect = chai.expect;

const Order = require('./order');
let sandbox = sinon.createSandbox();

describe('Order Class', () => {
    let dateSpy, warnSpy, user, items, o;

    beforeEach(() => {
        dateSpy = sandbox.spy(Date, 'now');
        warnSpy = sandbox.spy(console, 'warn');

        user = {id: 1, name: 'foo'};
        items = [
            {name: 'A', price: 34},
            {name: 'B', price: 66}
        ];

        o = new Order(123, user, items);
    });

    afterEach(() => {
        sandbox.restore();
    })

    it('should create instance of Order and calculate total & shipping', () => {
        expect(o).to.be.instanceOf(Order);
        expect(o).to.have.property('ref').to.equal(123);
        expect(o).to.have.property('user').to.deep.equal(user);
        expect(o).to.have.property('items').to.deep.equal(items);
        expect(o).to.have.property('status').to.equal('Pending');
        expect(o).to.have.property('createdAt').to.be.a('number');
        expect(o).to.have.property('updatedAt').to.be.a('number');
        expect(dateSpy).to.be.calledTwice;
        expect(o).to.have.property('subtotal').to.equal(100);
        expect(o).to.have.property('shipping').to.equal(10);
        expect(o).to.have.property('total').to.equal(110);

        expect(o.save).to.be.a('function');
        expect(o.cancel).to.be.a('function');
        expect(o.ship).to.be.a('function');
    });

    it('should update status to active and return order details', () => {
        const result = o.save();

        expect(o.status).to.equal('Active');
        expect(result).to.be.an('object');
        expect(dateSpy).to.be.callCount(3);
    });

    it('should cancel the order and return true', () => {
        const result = o.cancel();

        expect(o.status).to.equal('Cancelled');
        expect(o).to.have.property('updatedAt').to.be.a('number');
        expect(o.shipping).to.equal(0);
        expect(o.total).to.equal(0);
        expect(result).to.be.equal(true);
        expect(warnSpy).to.be.calledOnce;
    });

    it('should ship the order', () => {
        o.ship();

        expect(o.status).to.be.equal('Shipped');
        expect(o).to.have.property('updatedAt').to.be.a('number');
        expect(dateSpy).to.be.calledThrice;
    });
});