import { startMongo } from "$lib/db/mongo";

startMongo().then(() => { console.log("Connected to Mongo.") })