const chai = require('chai');
const { fake } = require('sinon');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const request = require('supertest');
const rewire = require('rewire');

chai.use(sinonChai);
const expect = chai.expect;

let app = rewire('./app');
let users = require('./users');
let auth = require('./auth');

let sandbox = sinon.createSandbox();

describe('app.js', () => {
    
    afterEach(() => {
        app = rewire('./app');
        sandbox.restore();
    });

    context('GET /', () => {
        it('should get /', (done) => {
            request(app)
                .get('/')
                .expect(200)
                .end((err, response) => {
                    expect(response.body).to.have.property('name').to.equal('Foo Fooing Bar');
                    done();
                });
        });
    });

    context('POST /user', () => {
        let createStub, errorStub;

        it('should call users.create', async () => {
            createStub = sandbox.stub(users, 'create').resolves({name: 'foo'});

            const result = await request(app)
                .post('/user')
                .send({name: 'Xapx'})
                .expect(200);

            expect(createStub).to.have.been.calledOnce;
            expect(result.body).to.have.property('name').to.equal('foo');
            expect(createStub).to.have.been.calledOnce;
        });

        it('should call handleError on error', async () => {
            createStub = sandbox.stub(users, 'create').rejects(new Error('fake'));
            errorStub = sandbox.stub().callsFake((res, err) => {
                return res.status(400).json({
                    error: 'fake err'
                });
            });

            app.__set__('handleError', errorStub);

            const result = await request(app)
                .post('/user')
                .send({name: 'Xapx'})
                .expect(400);
            
            expect(result.body.error).to.be.equal('fake err');
            expect(createStub).to.have.been.calledOnce;
        });
    });

    context('PUT /user/:id', () => {
        let updateStub, errorStub;

        it('should call users.update', async () => {
            updateStub = sandbox.stub(users, 'update').resolves({name: 'Kahn'});

            const result = await request(app)
                .put('/user/123')
                .send({username: 'Kafle'})
                .expect(200);
            
            expect(updateStub).to.have.been.calledOnce;
            expect(result.body).to.have.property('name').to.equal('Kahn');
        });

        it('should handle errors', async () => {
            updateStub = sandbox.stub(users, 'update').rejects(new Error('fake'));
            errorStub = sandbox.stub().callsFake((res, err) => {
                return res.status(400).json({
                    error: err.message
                });
            });

            app.__set__('handleError', errorStub);

            const result = await request(app)
            .put('/user/123')
            .send({username: 'Kafle'})
            .expect(400);

            expect(result.body).to.have.property('error').to.equal('fake');
            expect(errorStub).to.have.been.calledOnce;
        });
    });

    context('DELETE /user/:id', () => {
        let authStub, deleteStub, handleError;

        beforeEach(() => {
            fakeAuth = (req, res, next) => {
                return next();
            }

            authStub = sandbox.stub(auth, "isAuthorized").callsFake(fakeAuth);

            app = rewire('./app');
        });

        it('should call users.delete', async () => {
            deleteStub = sandbox.stub(users, 'delete').resolves('fake_delete');

            const result = await request(app)
                .delete('/user/123')
                .expect(200);
            
            expect(authStub).to.have.been.calledOnce;
            // expect(deleteStub).to.have.been.calledWithMatch(123);
            expect(result.body).to.equal('fake_delete');
        });

        it('should handle errors', async () => {
            updateStub = sandbox.stub(users, 'delete').rejects(new Error('fake'));
            errorStub = sandbox.stub().callsFake((res, err) => {
                return res.status(400).json({
                    error: err.message
                });
            });

            app.__set__('handleError', errorStub);

            const result = await request(app)
                .delete('/user/123')
                .expect(400);

            expect(result.body).to.have.property('error').to.equal('fake');
            expect(errorStub).to.have.been.calledOnce;
        });
    });

    context('handleError', () => {
        let handleError, statusStub, jsonStub, res;

        beforeEach(() => {
            jsonStub = sandbox.stub().returns({error: 'fakeError'});
            statusStub = sandbox.stub().returns({json: jsonStub});
            res = { status: statusStub };

            handleError = app.__get__('handleError');
        });

        it('should check error instance and format message', () => {
            const result = handleError(res, new Error('fake'));

            expect(statusStub).to.have.been.calledWith(400);
            expect(jsonStub).to.have.been.calledWith({error: 'fake'});
        });

        it('should returns object without changing it of not instance of error', () => {
            const result = handleError(res, {name: 123123});

            expect(statusStub).to.have.been.calledWith(400);
            expect(jsonStub).to.have.been.calledWith({name: 123123});
        });
    });
});