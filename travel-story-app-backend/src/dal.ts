import mongoose, { Mongoose } from "mongoose";
import config from './utils/config';

async function connect(): Promise<void> {
    try {
        const db: Mongoose = await mongoose.connect(config.connectionString);
        console.log("We're connected to MongoDB " + db.connection.name);
    } 
    catch (err) {
        console.error("Error connecting to MongoDB:", err);
    }
}

export default {
    connect
};
