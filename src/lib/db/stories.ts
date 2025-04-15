import { db } from "./mongo"; // Use relative path
import type { Collection, Document, ObjectId, WithId } from "mongodb";

// Define Story interface locally (copied from configureServer.ts)
export interface Story extends Document {
    _id: ObjectId;
    title: string;
    story: string;
    likes?: number;
    dislikes?: number;
    // Add other fields if necessary
}

// Explicitly type the collection
export const stories: Collection<Story> = db.collection<Story>("stories");