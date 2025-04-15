import { db } from "./mongo"; // Use relative path
import type { Collection, Document, ObjectId, WithId } from "mongodb";

// Define Story interface locally (copied from configureServer.ts)
// Note: This duplicates the interface from stories.ts. Consider creating a shared types file.
export interface Story extends Document {
    _id: ObjectId;
    title: string;
    story: string;
    likes?: number;
    dislikes?: number;
}

// Define Player interface locally (copied from configureServer.ts)
export interface Player {
    id: string;
    username: string;
    isHost: boolean;
    roomIndex: number;
}

// Define ChatMessage interface locally (copied from configureServer.ts)
export interface ChatMessage {
    user: string | null;
    message: string;
}

// Define Room interface locally (copied from configureServer.ts)
export interface Room extends Document {
    roomId: string;
    players: Player[];
    chat: ChatMessage[];
    hasGameStarted: boolean;
    hasSummaryStarted: boolean;
    story: WithId<Story> | null;
    gameSettings: Record<string, any>;
}

// Explicitly type the collection
export const active: Collection<Room> = db.collection<Room>("active");

// Add types to functions
export async function isRoomActive(roomCode: string): Promise<boolean> {
    const res: WithId<Room> | null = await active.findOne({ roomId: roomCode });
    return Boolean(res);
}

export async function isPlayerInRoom(username: string, roomCode: string): Promise<boolean> {
    const room: WithId<Room> | null = await active.findOne({ roomId: roomCode });
    if (!room) return false; // Room doesn't exist
    const players: string[] = room.players.map(x => x.username);
    return players.includes(username);
}

export async function isPlayerHost(username: string, roomCode: string): Promise<boolean> {
    const room: WithId<Room> | null = await active.findOne({ roomId: roomCode });
    if (!room || room.players.length === 0) return false; // Room doesn't exist or no players

    const host = room.players.find(x => x.isHost); // Use find for potentially one host
    return host ? host.username === username : false;
}

export async function hasGameStarted(roomCode: string): Promise<boolean> {
    const room: WithId<Room> | null = await active.findOne({ roomId: roomCode });
    // Return false if room doesn't exist, otherwise return game status
    return room ? room.hasGameStarted : false;
}

export async function hasSummaryStarted(roomCode: string): Promise<boolean> {
    const room: WithId<Room> | null = await active.findOne({ roomId: roomCode });
    // Return false if room doesn't exist, otherwise return summary status
    return room ? room.hasSummaryStarted : false;
}