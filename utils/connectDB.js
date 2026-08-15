import mongoose from 'mongoose'

const MONGODB_URL = process.env.MONGODB_URL

if (!MONGODB_URL) {
    throw new Error('MONGODB_URL is not defined')
}

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    }
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URL, {
            family: 4,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000,
            maxIdleTimeMS: 60000,
        })
    }

    try {
        cached.conn = await cached.promise
        console.log('✅ MongoDB Connected')
        return cached.conn
    } catch (error) {
        cached.promise = null
        console.error('❌ MongoDB Connection Error:', error)
        throw error
    }
}

export default connectDB