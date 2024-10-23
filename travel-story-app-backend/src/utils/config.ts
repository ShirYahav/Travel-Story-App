import dotenv from 'dotenv';

dotenv.config();

class Config {
    connectionString: string;

    constructor() {
        this.connectionString = process.env.MONGO_DB_URI as string;
    }
}

const config = new Config();

export default config;
