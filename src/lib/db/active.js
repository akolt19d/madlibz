import { db } from "$lib/db/mongo"

export const active = db.collection("active")