import { db } from "$lib/db/mongo"

export const stories = db.collection("stories")