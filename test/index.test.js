const mongoose = require('mongoose')
const db = require('../index')

const assert = require('assert')

describe('DB Connection', () => {

  const schemaProperty = {
    value: Number
  }

  let schema = null
  let model = null

  before(async () => {
    await db()
  })

  describe('connection state', () => {
    it('should be connected', () => {
      // const state = {
      //   0: 'disconnected',
      //   1: 'connected',
      //   2: 'connecting',
      //   3: 'disconnecting',
      //   4: 'unauthorized',
      //   99: 'uninitialized'
      // }
      assert.equal(mongoose.connection.readyState, 1)
    })
  })

  describe('register model', () => {
    it('should be able to create new schema', () => {
      schema = new mongoose.Schema(schemaProperty)
    })
    it('should be able to create new model', () => {
      model = mongoose.model('mocha-mongodb-connector-test', schema, 'mocha-mongodb-connector-test')
    })
  })

  describe('create documents', () => {
    let doc1 = null
    let doc2 = null
    it('should be able to create document from model via new', async () => {
      doc1 = new model({
        value: 1
      })
      await doc1.save()
    })
    it('should be able to create document from model via create', async () => {
      doc2 = await model.create({
        value: 2
      })
    })
  })

  describe('find documents', () => {
    let docs = null
    it('should be only 2 documents found', async () => {
      docs = await model.find().exec()
      assert(docs.length, 2)
    })
    it('should has ObjectId', async () => {
      docs.map(doc => {
        assert.equal(doc._id.toHexString().length, 24);
      })
    })
    it('should has property "value" and is number', async () => {
      docs.map(doc => {
        assert.equal(typeof (doc.value), 'number');
      })
    })
  })

  describe('update documents', () => {
    it('should be able to update', async () => {
      const updated = await model.updateMany({}, {
        $inc: {
          value: 10
        }
      }, {
        new: true
      }).exec()
      assert(updated.modifiedCount, 2)
    })
  })

  describe('delete documents', () => {
    it('should be able to delete', async () => {
      const deleted = await model.deleteMany().exec()
      assert(deleted.deletedCount, 2)
    })
    it('should be zero document at last', async () => {
      const total = await model.countDocuments()
      assert.equal(total, 0)
    })
  })

  after(async () => {
  })

})