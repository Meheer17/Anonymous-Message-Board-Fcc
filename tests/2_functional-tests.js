const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    var a, b, c;
    test('Creating a new thread: POST request to /api/threads/{board}', function (done) {
        this.timeout(5000);
        chai.request(server)
            .post('/api/threads/mahi')
            .send({
                text: 'test',
                delete_password: 'password'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                done();
            })
    });
    test('Viewing the 10 most recent threads with 3 replies each: GET request to /api/threads/{board}', function (done) {
        this.timeout(5000);
        chai.request(server)
            .get('/api/threads/mahi')
            .end(function (err, res) {
                a = res.body[0]._id;
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.property(res.body[0], '_id');
                assert.property(res.body[0], 'text');
                assert.property(res.body[0], 'created_on');
                assert.property(res.body[0], 'bumped_on');
                assert.property(res.body[0], 'replies');
                assert.isArray(res.body[0].replies);
                assert.isAtMost(res.body.length, 10);
                done();
            });
    });
    test('Reporting a thread: PUT request to /api/threads/{board}', function (done) {
        this.timeout(5000);
        chai.request(server)
            .put('/api/threads/mahi')
            .send({
                thread_id: a
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'reported');
                done();
            });
    });
    test('Deleting a thread with the incorrect password: DELETE request to /api/threads/{board} with an invalid delete_password', function (done) {
        this.timeout(5000);
        chai.request(server)
            .delete('/api/threads/mahi')
            .send({
                thread_id: a,
                delete_password: 'wrongpassword'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'incorrect password');
                done();
            });
    });
    test('Creating a new reply: POST request to /api/replies/{board}', function (done) {
        this.timeout(5000);
        chai.request(server)
            .post('/api/replies/mahi')
            .send({
                thread_id: a,
                text: 'Test reply',
                delete_password: 'password'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                done();
            });
    });
    test('Viewing a single thread with all replies: GET request to /api/replies/{board}', function (done) {
        this.timeout(5000);
        chai.request(server)
            .get('/api/replies/mahi')
            .query({
                thread_id: a
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.property(res.body, '_id');
                assert.property(res.body, 'text');
                assert.property(res.body, 'created_on');
                assert.property(res.body, 'bumped_on');
                assert.property(res.body, 'replies');
                assert.isArray(res.body.replies);
                assert.property(res.body.replies[0], '_id');
                assert.property(res.body.replies[0], 'text');
                assert.property(res.body.replies[0], 'created_on');
                b = res.body.replies[0]._id;
                done();
            });
    });
    test('Reporting a reply: PUT request to /api/replies/{board}', function (done) {
        this.timeout(5000);
        chai.request(server)
            .put('/api/replies/mahi')
            .send({
                thread_id: a,
                reply_id: b
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'reported');
                done();
            });
    });
    test('Deleting a reply with the incorrect password: DELETE request to /api/replies/{board} with an invalid delete_password', function (done) {
        this.timeout(5000);
        chai.request(server)
            .delete('/api/replies/mahi')
            .send({
                thread_id: a,
                reply_id: b,
                delete_password: 'wrongpassword'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'incorrect password');
                done();
            })
    });
    test('Deleting a reply with the correct password: DELETE request to /api/replies/{board} with a valid delete_password', function (done) {
        this.timeout(5000);
        chai.request(server)
            .delete('/api/replies/mahi')
            .send({
                thread_id: a,
                reply_id: b,
                delete_password: 'password'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'success');
                done();
            })
    });
    test('Deleting a thread with the correct password: DELETE request to /api/threads/{board} with a valid delete_password', function (done) {
        this.timeout(5000);
        chai.request(server)
            .delete('/api/threads/mahi')
            .send({
                thread_id: a,
                delete_password: 'password'
            })
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.equal(res.text, 'success');
                done();
            });
    });
});