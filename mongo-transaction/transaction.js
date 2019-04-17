const mongoose = require('mongoose')
const mongoUri = 'mongodb://localhost:27017,localhost:37017,localhost:47017/test'
const client = mongoose.createConnection(mongoUri, { replicaSet: 'rstest' })
let Acc = client.model('Account', new mongoose.Schema({
    name: String,
    balance: Number
}))
async function initTest() {
    await Acc.create({ 'name': 'James', 'balance': 3000 })
    await Acc.create({ 'name': 'Wade', 'balance': 0 })
}
async function afterWork() {
    await Acc.remove({ 'name': 'James' })
    await Acc.remove({ 'name': 'Wade' })
}
const sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));

async function transferTest(transfer) {
    let session = await Acc.startSession()
    session.startTransaction()
    try {
        const opts = { session, new: true }
        let a = await Acc.findOneAndUpdate({
            'name': 'James'
        }, {
            $inc: { 'balance': -transfer }
        }, opts)
        console.log(a.toObject());
        await sleep(8000)
        let b = await Acc.findOneAndUpdate({
            'name': 'Wade',
        }, {
            $inc: { 'balance': transfer }
        }, opts)
        console.log(b.toObject());
        await session.commitTransaction()
    } catch (err) {
        session.abortTransaction()
        console.error(err)
    } finally {
        session.endSession()
    }

}
async function test() {
    await afterWork()
    await initTest()
    await transferTest(100)
        // await afterWork()
}
test()