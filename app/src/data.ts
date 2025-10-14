import localforage from "localforage";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

export interface Room {
    id: string;
    name: string;
    location: string;
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
    start: string;
    end: string;
    status: 'confirmed' | 'pending' | 'rejected';
    notes?: string;
}

export async function getItems<T>(key: string): Promise<T[]> {
    let items = await localforage.getItem<T[]>(key);
    if (!items) items = [];
    return items;
}

export function setItems<T>(key: string, items: T[]): Promise<T[]> {
    return localforage.setItem(key, items);
}

export async function getRooms(query?: string | null, features?: string[] | null): Promise<Room[]> {
    let rooms = await getItems<Room>('rooms');
    if (query) {
        rooms = matchSorter(rooms, query, { keys: ["name", "id", "location"] });
    }
    if (features && features.length > 0) {
        rooms = rooms.filter(room => features.every(feature => room.features.includes(feature)));
    }
    return rooms.sort(sortBy("name"));
}

export async function createRoom(data: Omit<Room, 'id'>): Promise<Room> {
    const id = `r-${Math.random().toString(36).substring(2, 9)}`;
    const newRoom: Room = { id, ...data };
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

export async function getBookings(resourceId?: string | null): Promise<Booking[]> {
    let bookings = await getItems<Booking>('bookings');
    if (resourceId) {
        bookings = bookings.filter(b => b.resourceId === resourceId);
    }
    return bookings.sort(sortBy("start"));
}

export async function createBooking(bookingData: Omit<Booking, 'id'>): Promise<Booking> {
    const id = `b-${Math.random().toString(36).substring(2, 9)}`;
    // Avoid duplicate 'status' property if bookingData already has it
    const { status = 'pending', ...rest } = bookingData as any;
    const newBooking: Booking = { id, status, ...rest };
    const bookings = await getBookings();
    bookings.unshift(newBooking);
    await setItems('bookings', bookings);
    return newBooking;
}

export async function getAllData() {
    const rooms = await getItems<Room>('rooms');
    const assets = await getItems<Asset>('assets');
    const bookings = await getItems<Booking>('bookings');
    return { rooms, assets, bookings };
}

export async function seedData() {
    try {
        const response = await fetch('/seed/seed.example.json');
        if (!response.ok) return;
        
        const data = await response.json();
        const rooms = await getItems('rooms');
        if (rooms.length === 0 && data.rooms) {
             await setItems('rooms', data.rooms);
             await setItems('assets', data.assets);
             await setItems('bookings', data.bookings);
        }

    } catch (error) {
        console.error("Failed to seed data:", error);
    }
}