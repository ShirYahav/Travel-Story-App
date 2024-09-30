class Config {
    connectionString: string;

    constructor() {
        this.connectionString = "mongodb://localhost:27017/travel-story";
    }
}

const config = new Config();

export default config;
