import dns from 'dns'
import mongoose from 'mongoose'

dns.setServers(['8.8.8.8', '8.8.4.4'])

const MONGODB_URL = process.env.MONGODB_URL

if (!MONGODB_URL) {
    throw new Error('MONGODB_URL is not defined')
}

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    }
}

async function connectDB() {
    if (cached.conn) {
        return cached.conn
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URL)
            .then((mongoose) => {
                console.log('✅ MongoDB Connected')
                return mongoose
            })
    }

    try {
        cached.conn = await cached.promise
    } catch (error) {
        cached.promise = null
        console.error('❌ MongoDB Connection Error:', error)
        throw error
    }

    return cached.conn
}

export default connectDB