'use strict';

const mongoose = require('mongoose');

mongoose.connect(process.env.DB);

const bookSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  comments: { type: [String], default: [] }
});

const Book = mongoose.model('Book', bookSchema);

module.exports = function(app) {

  app.route('/api/books')

    .get(async function(req, res) {
      try {
        const books = await Book.find({});
        const result = books.map(book => ({
          _id:          book._id,
          title:        book.title,
          commentcount: book.comments.length
        }));
        res.json(result);
      } catch(e) {
        res.json({ error: 'could not get books' });
      }
    })

    .post(async function(req, res) {
      const title = req.body.title;
      if (!title) return res.json('missing required field title');
      try {
        const book = new Book({ title });
        const saved = await book.save();
        res.json({ _id: saved._id, title: saved.title });
      } catch(e) {
        res.json({ error: 'could not save book' });
      }
    })

    .delete(async function(req, res) {
      try {
        await Book.deleteMany({});
        res.json('complete delete successful');
      } catch(e) {
        res.json({ error: 'could not delete books' });
      }
    });

  app.route('/api/books/:id')

    .get(async function(req, res) {
      const bookid = req.params.id;
      try {
        const book = await Book.findById(bookid);
        if (!book) return res.json('no book exists');
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch(e) {
        res.json('no book exists');
      }
    })

    .post(async function(req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      if (!comment) return res.json('missing required field comment');
      try {
        const book = await Book.findById(bookid);
        if (!book) return res.json('no book exists');
        book.comments.push(comment);
        await book.save();
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch(e) {
        res.json('no book exists');
      }
    })

    .delete(async function(req, res) {
      const bookid = req.params.id;
      try {
        const deleted = await Book.findByIdAndDelete(bookid);
        if (!deleted) return res.json('no book exists');
        res.json('delete successful');
      } catch(e) {
        res.json('no book exists');
      }
    });

};
