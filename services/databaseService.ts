import { db, Item, ItemType } from "../config/database";

// ---------- GET ITEMS -----------------
export const getItems  = async (
    parent_id: number | null
): Promise<Item[]> => {
    if (parent_id === null) {
        return await db.getAllAsync<Item> (
            'SELECT * FROM items WHERE parent_id IS NULL;'
        );
    }

    return await db.getAllAsync<Item> (
        'SELECT * FROM items WHERE parent_id = ?;',
        [parent_id]
    );
};

// ------------ ADD FOLDER --------------
export const addFolder = async (
    name: string,
    parent_id: number | null
) => {
    const now = new Date().toISOString();

    return await db.runAsync(
        `INSERT INTO items (name, type, parent_id, content, file_path, created_at, updated_at)
        VALUES (?, ?, ?, NULL, NULL, ?, ?);`,
        [name, ItemType.Folder, parent_id, now, now]
    );
};

// -------------- ADD NOTE ------------------
export const addNote = async (
    name: string,
    content: string,
    parent_id: number | null
) => {
    const now = new Date().toISOString();

    return await db.runAsync(
        `INSERT INTO items (name, type, parent_id, content, file_path, created_at, updated_at)
        VALUES (?, ?, ?, NULL, NULL, ?, ?);`,
        [name, ItemType.Note, parent_id, content, now, now]
    );
};

// ----------- DELETE ITE< --------------
export const deleteItem = async (id: number) => {
    return await db.runAsync(
        'DELETE FROM items WHERE id = ?;',
        [id]
    );
};