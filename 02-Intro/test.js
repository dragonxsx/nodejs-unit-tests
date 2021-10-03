const assert = require('assert');

describe('The very first test on Mocha', () => {
    context('Mocha & Assert', () => {
        before(() => {
            console.log('----before');
        });

        after(() => {
            console.log('----after');
        });

        beforeEach(() => {
            console.log('----before each test');
        })

        afterEach(() => {
            console.log('----after each test');
        })

        it('Compare 2 number', () => {
            assert.equal(9 + 1, 10);
        });

        it('Deep compare 2 objects', () => {
            assert.deepEqual({name: 'Long', abc: {name: 'xyz'}}, {name: 'Long', abc: {name: 'xyz'}});
        });
    });

    context(('Another function to be test'), () => {
        it('Blabla', () => {
            console.log('123123');
        })
    });
});