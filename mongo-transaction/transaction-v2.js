const mongoose = require('mongoose')
const mongoUri = 'mongodb://localhost:27017,localhost:37017,localhost:47017/test'
const client = mongoose.createConnection(mongoUri, { replicaSet: 'rstest1', useNewUrlParser: true })
let Acc = client.model('Account', new mongoose.Schema({
    name: String,
    balance: Number,
    love: String
}))
async function initTest() {
    await Acc.create({ 'name': 'James', 'balance': 3000, 'love': 'Kelvin' })
    await Acc.create({ 'name': 'Wade', 'balance': 0, 'love': 'James' })
}
async function afterWork() {
    await Acc.deleteOne({ 'name': 'James' })
    await Acc.deleteOne({ 'name': 'Wade' })
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
        let c = await Acc.findOneAndUpdate({
            'name': 'James'
        }, {
            $inc: { 'balance': -transfer }
        }, opts)
        console.log(c.toObject());
        let d = await Acc.findOneAndUpdate({
            'name': 'James'
        }, {
            $set: { 'love': 'Wade' },
            $inc: { 'balance': -transfer }
        }, opts)
        console.log(d.toObject());
        console.log('sleep 3 secs')
        await sleep(3000)
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
    process.exit()
        // await afterWork()
}
test()