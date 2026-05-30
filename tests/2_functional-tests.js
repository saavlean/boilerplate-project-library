const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  test('#example Test GET /api/books', function(done){
    chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        if (res.body.length > 0) {
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
        }
        done();
      });
  });

  suite('Routing tests', function() {

    let testBookId;

    suite('POST /api/books with title => create book object/expect book object', function() {

      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            assert.equal(res.body.title, 'Test Book');
            testBookId = res.body._id;
            done();
          });
      });

      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'missing required field title');
            done();
          });
      });

    });

    suite('GET /api/books => array of books', function(){

      test('Test GET /api/books', function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            res.body.forEach(book => {
              assert.property(book, '_id');
              assert.property(book, 'title');
              assert.property(book, 'commentcount');
            });
            done();
          });
      });

    });

    suite('GET /api/books/[id] => book object with [id]', function(){

      test('Test GET /api/books/[id] with id not in db', function(done){
        chai.request(server)
          .get('/api/books/6400000000000000000000000')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          });
      });

      test('Test GET /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Book for GET test' })
          .end(function(err, res) {
            const id = res.body._id;
            chai.request(server)
              .get('/api/books/' + id)
              .end(function(err2, res2) {
                assert.equal(res2.status, 200);
                assert.property(res2.body, '_id');
                assert.property(res2.body, 'title');
                assert.property(res2.body, 'comments');
                assert.isArray(res2.body.comments);
                done();
              });
          });
      });

    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){

      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Book for comment test' })
          .end(function(err, res) {
            const id = res.body._id;
            chai.request(server)
              .post('/api/books/' + id)
              .send({ comment: 'Great book!' })
              .end(function(err2, res2) {
                assert.equal(res2.status, 200);
                assert.property(res2.body, '_id');
                assert.property(res2.body, 'title');
                assert.property(res2.body, 'comments');
                assert.include(res2.body.comments, 'Great book!');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Book for no comment test' })
          .end(function(err, res) {
            const id = res.body._id;
            chai.request(server)
              .post('/api/books/' + id)
              .send({})
              .end(function(err2, res2) {
                assert.equal(res2.status, 200);
                assert.equal(res2.body, 'missing required field comment');
                done();
              });
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .post('/api/books/6400000000000000000000000')
          .send({ comment: 'This book does not exist' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          });
      });

    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Book to delete' })
          .end(function(err, res) {
            const id = res.body._id;
            chai.request(server)
              .delete('/api/books/' + id)
              .end(function(err2, res2) {
                assert.equal(res2.status, 200);
                assert.equal(res2.body, 'delete successful');
                done();
              });
          });
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
          .delete('/api/books/6400000000000000000000000')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body, 'no book exists');
            done();
          });
      });

    });

  });

});
