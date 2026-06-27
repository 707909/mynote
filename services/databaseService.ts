import { db, Folder, Note  } from "../config/database";

// ------------- FOLDER --------------
export const getFolders = async (): Promise<Folder[]> => {
  return await db.getAllAsync<Folder>('SELECT * FROM folders;');
};

export const addFolder = async (name: string) => {
    return await db.runAsync('INSERT INTO folders (name) VALUES (?);', [name]);
};

export const deleteFolder = async (id: number) => {
    return await db.runAsync('DELETE FROM folders WHERE id = ?;', [id]);
};

// ------------ ROOT NOTES --------------
export const getRootNotes = async (): Promise<Note[]> => {
    return await db.getAllAsync<Note>('SELECT * FROM notes WHERE folder_id IS NULL;');
};

export const addRootNote = async (
    title: string,
    body: string,
) => {
    return await db.runAsync('INSERT INTO notes (title, body, folder_id) VALUES (?, ?, NULL);', 
        [title, body]);
};

export const deleteRootNote = async (id: number) => {
    return await db.runAsync('DELETE FROM notes WHERE id = ?;', [id]);
};