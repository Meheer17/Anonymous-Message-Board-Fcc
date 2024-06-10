'use strict';

const clidb = require('./db.js');
const { ObjectId } = require('mongodb');

module.exports = function (app) {

	app.route('/api/threads/:board')
		.get(async function (req, res) {
			const board = req.params.board;
			const db = (await clidb()).collection('boards');
			var data = await db.find({ board: board }, { limit: 10, projection: { _id: 1, text: 1, created_on: 1, bumped_on: 1, replies: { created_on: 1, text: 1, _id: 1 } }, replies: { $slice: 3 }, sort: { bumped_on: -1 } }).toArray();
			res.send(data)
		})
		.post(async function (req, res) {
			const board = req.params.board;
			const db = (await clidb()).collection('boards');
			await db.insertOne({ board: board, text: req.body.text, delete_password: req.body.delete_password, created_on: new Date(), bumped_on: new Date(), reported: false, replies: [] });
			res.redirect('/b/' + board + '/');
		})
		.put(async function (req, res) {
			const db = (await clidb()).collection('boards');
			await db.updateOne({ _id: new ObjectId(req.body.thread_id) }, { $set: { reported: true } });
			res.send('reported');
		})
		.delete(async function (req, res) {
			const db = (await clidb()).collection('boards');
			const data = await db.find({ _id: new ObjectId(req.body.thread_id) }).toArray();
			if (data[0].delete_password == req.body.delete_password) {
				await db.deleteOne({ _id: new ObjectId(req.body.thread_id) });
				res.send('success');
			} else {
				res.send('incorrect password');
			}
		});

	app.route('/api/replies/:board')
		.get(async function (req, res) {
			const db = (await clidb()).collection('boards');
			var data;
			if (req.query.thread_id) {
				data = await db.find({ _id: new ObjectId(req.query.thread_id) }, { projection: { _id: 1, text: 1, created_on: 1, bumped_on: 1, replies: { created_on: 1, text: 1, _id: 1 } }, sort: { bumped_on: -1 } }).toArray();
				res.send(data[0])
			} else {
				res.send('missing thread_id')
			}
		})
		.post(async function (req, res) {
			const db = (await clidb()).collection('boards');
			await db.updateOne({ _id: new ObjectId(req.body.thread_id) }, { $push: { replies: { _id: new ObjectId(), text: req.body.text, delete_password: req.body.delete_password, created_on: new Date(), reported: false } }, $set: { bumped_on: new Date() } });
			res.redirect('/b/' + req.params.board + '/' + req.body.thread_id);
		})
		.put(async function (req, res) {
			const db = (await clidb()).collection('boards');
			await db.updateOne({ _id: new ObjectId(req.body.thread_id), 'replies._id': new ObjectId(req.body.reply_id) }, { $set: { 'replies.$.reported': true } });
			res.send('reported');
		})
		.delete(async function (req, res) {
			const db = (await clidb()).collection('boards');
			const data = (await db.find({ _id: new ObjectId(req.body.thread_id), 'replies._id': new ObjectId(req.body.reply_id) }).toArray())[0];
			if (data.replies.find(reply => reply._id == req.body.reply_id).delete_password == req.body.delete_password) {
				await db.updateOne({ _id: new ObjectId(req.body.thread_id), 'replies._id': new ObjectId(req.body.reply_id) }, { $set: { 'replies.$.text': "[deleted]" } });
				res.send('success');
			} else {
				res.send('incorrect password');
			}
		});
};