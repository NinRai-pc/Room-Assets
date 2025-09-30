import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

// Define types for our data structures
export interface Room {
    id: string;
    name: string;
    capacity: number;
    features: string[];
}

export interface Asset {
    id: string;
    name: string;
    inventoryCode: string;
    status: 'available' | 'unavailable' | 'maintenance';
}

export interface Booking {
    id: string;
    resourceType: 'room' | 'asset';
    resourceId: string;
    title: string;
    start: string; // ISO 8601 format
    end: string;   // ISO 8601 format
    notes?: string;
}

// Generic function to get items from localforage
async function getItems<T>(key: string): Promise<T[]> {
    let items = await localforage.getItem<T[]>(key);
    if (!items) {
        items = [];
    }
    return items;
}

// Generic function to set items in localforage
function setItems<T>(key: string, items: T[]): Promise<T[]> {
    return localforage.setItem(key, items);
}


// --- Rooms ---
export async function getRooms(query?: string | null): Promise<Room[]> {
    let rooms = await getItems<Room>('rooms');
    if (query) {
        rooms = matchSorter(rooms, query, { keys: ["name"] });
    }
    return rooms.sort(sortBy("name"));
}

export async function createRoom(): Promise<Room> {
    const id = `r-${Math.random().toString(36).substring(2, 9)}`;
    const newRoom: Room = { id, name: "Новая аудитория", capacity: 0, features: [] };
    const rooms = await getRooms();
    rooms.unshift(newRoom);
    await setItems('rooms', rooms);
    return newRoom;
}

export async function getRoom(id: string): Promise<Room | null> {
    const rooms = await getItems<Room>('rooms');
    return rooms.find(room => room.id === id) ?? null;
}

export async function updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    let rooms = await getItems<Room>('rooms');
    let room = rooms.find(room => room.id === id);
    if (!room) throw new Error(`No room with id: ${id}`);
    Object.assign(room, updates);
    await setItems('rooms', rooms);
    return room;
}

export async function deleteRoom(id: string): Promise<boolean> {
    let rooms = await getItems<Room>('rooms');
    let index = rooms.findIndex(room => room.id === id);
    if (index > -1) {
        rooms.splice(index, 1);
        await setItems('rooms', rooms);
        return true;
    }
    return false;
}


// --- Assets ---
// Functions for assets (getAssets, createAsset, etc.) will be similar to rooms.
// We can add them later as we build out the asset management part.


// --- Bookings ---
export async function getBookings(resourceId?: string | null): Promise<Booking[]> {
    let bookings = await getItems<Booking>('bookings');
    if (resourceId) {
        bookings = bookings.filter(b => b.resourceId === resourceId);
    }
    return bookings.sort(sortBy("start"));
}

export async function createBooking(bookingData: Omit<Booking, 'id'>): Promise<Booking> {
    const id = `b-${Math.random().toString(36).substring(2, 9)}`;
    const newBooking: Booking = { id, ...bookingData };
    const bookings = await getBookings();
    bookings.unshift(newBooking);
    await setItems('bookings', bookings);
    return newBooking;
}

// ... other booking functions (getBooking, updateBooking, deleteBooking) will be added later.


// --- Seed Data ---
// This function can be used to populate the database from the JSON file
export async function seedData() {
    try {
        const response = await fetch('/seed/seed.example.json');
        const data = await response.json();
        
        // Check if data already exists to avoid overwriting
        const rooms = await getItems('rooms');
        const assets = await getItems('assets');
        const bookings = await getItems('bookings');
        
        if (rooms.length === 0 && data.rooms) {
             await setItems('rooms', data.rooms);
        }
        if (assets.length === 0 && data.assets) {
             await setItems('assets', data.assets);
        }
        if (bookings.length === 0 && data.bookings) {
             await setItems('bookings', data.bookings);
        }

    } catch (error) {
        console.error("Failed to seed data:", error);
    }
}