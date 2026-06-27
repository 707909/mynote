import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { Folder, Note } from '../config/database';
import {
  addFolder,
  addRootNote,
  deleteFolder,
  deleteRootNote,
  getFolders,
  getRootNotes
} from '../services/databaseService';

import {
  Alert,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Home () {
  // ---------------------- STATE DATA ------------------------
  // 1. state untuk data Folder
  // 2. state untuk data rootNotes
  // 3. filter rootNotes menyaring yang tidak punya folder_id
  // -----------------------------------------------------------

  // 1. state untuk data Folders
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderName, setFolderName] = useState('');  

  // 2. state untuk data rootNotes
  const [rootNotes, setRootNotes] = useState<Note[]>([]);
  const [rootNoteTitle, setRootNoteTitle] = useState('');
  const [rootNoteBody, setRootNoteBody] = useState('');    

  // 3. filter rootNotes menyaring yang tidak punya folder_id
  const allRootNotes = rootNotes.filter(
    note => note.folder_id === null
  );

  // ----------- SEARCH QUERY ------------ NTAR POKOKNYA
  // 1. state query search
  // 2. filter search folders dan notes
  // --------------------------------------

  // 1. state query search
  const [searchQuery, setSearchQuery] = useState('');

  // 2. filter search folders dan notes
  const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredNotes = rootNotes.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // -------------------- ANIMATION -------------------------
  // 1. state animation
  // 2. FAB 1 rootNote
  // 3. FAB 2 folder
  // --------------------------------------------------------

  // 1. state animation
  const animation = useRef(new Animated.Value(0)).current;

  // 2. FAB 1 rootNote
  const fab1 = {transform: 
    [{translateY: animation.interpolate
      ({
        inputRange: [0, 1],
        outputRange: [0, -70],
      }),
    },],
    opacity: animation,
  };

  // 3. FAB 2 folder
  const fab2 = {transform: 
    [{translateY: animation.interpolate
      ({
        inputRange: [0, 1],
        outputRange: [0, -140],
      }),
    },],
    opacity: animation,
  };

  // --------------- FLOATING ACTION BUTTON FAB --------------------------------------------------
  // 1. state buat open/close MAIN FAB
  // 2. toggle open/close MAIN FAB
  // 3. state buat pop out addFolder & addRootNote
  // 4. function biar CHILD FAB munculin pop out addFolder & addRootNote
  // 5. function biar tombol "Cancel" mengosongkan field "Folder name" dan menghilangkan pop out
  // ----------------------------------------------------------------------------------------------

  // 1. state buat open/close MAIN FAB
  const [open, setOpen] = useState(false);

  // 2. toggle open/close MAIN FAB
  const toggleMenu = () => {
    const toValue = open ? 0 : 1;
    Animated.spring(animation, {
    toValue, useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  // 3. state buat pop out addFolder & addRootNote
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState<'folder' | 'note' | null>(null); 

  // 4. function biar CHILD FAB munculin pop out addFolder & addRootNote
  const openModal = (type: "folder" | "note") => {
    setModalType(type);
    setVisible(true);
  };  

  // 5. function biar tombol "Cancel" mengosongkan field "Folder name" dan menghilangkan pop out
  const closeModal = () => {
    setVisible(false);
    setModalType(null);

    setFolderName('');
    setRootNoteTitle('');
    setRootNoteBody('');
  };

  // ----------------- REFRESH DATA ----------------------
  // function tarik data terbaru dari sqlite
  // -----------------------------------------------------

  // function tarik data terbaru dari sqlite
  const loadingRef = useRef(false); 
  const refreshData = async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
    const allFolders = await getFolders();
    const allRootNotes = await getRootNotes();

    setFolders(allFolders);
    setRootNotes(allRootNotes);

    } catch (error) {
    console.log('refreshData error:', error);
    Alert.alert('Error', String(error));

    } finally {
    loadingRef.current = false;
    }
  };      

  // -------------------------- LOGIC --------------------------------
  // FOLDER                           ROOT NOTE
  // 1. handleAddFolder               1. handleAddRootNote
  // 2. handleDeleteFolder            2. handleDeleteRootNote
  // -------------------------------------------------------------------

  // 1. handleAddFolder  
  const handleAddFolder = async () => {
    try {
      console.log('adding folder...');

      if (folderName.trim() === '') {
        Alert.alert('Folder name required!');
        return;
      }

      await addFolder(folderName);
      await refreshData();
      closeModal();

    } catch (error) {
      console.log('add folder error:', error);
      Alert.alert('Error', String(error));
    }
  };  

  // 2. handleDeleteFolder
  const handleDeleteFolder = (folder_id: number, folderName: string) => {
    Alert.alert('Delete folder', `Are you sure to delete "${folderName}"?`, [
      { text: 'Cancel' }, 
      { text: 'Delete' , onPress: async () => {
        try { 

          await deleteFolder(folder_id); 
          await refreshData();

        } catch (error) {
          console.log('delete folder error:', error);
          Alert.alert('Error', String(error));
        }
      }}
    ]);
  };   

  // 1. handleAddRootNote
  const handleAddRootNote =async  () => {
    try {
      console.log('adding note...');

      if (rootNoteTitle.trim() === '') {
        Alert.alert('Note title required!');
        return;
      }

      await addRootNote(rootNoteTitle, rootNoteBody);
      await refreshData();
      closeModal();

    } catch (error) {
      console.log('add note error:', error);
      Alert.alert('Error', String(error));
    }
  };  

  // 2. handleDeleteRootNote
  const handleDeleteRootNote = (note_id: number, noteTitle: string) => {
    Alert.alert('Delete note', `are you sure to delete "${noteTitle}"?`, [
      { text: 'Cancel' },
      { text: 'Delete', onPress: async () => {
        try {
          await deleteRootNote(note_id);
          await refreshData();

        } catch (error) {
          console.log('delete note error:', error);
          Alert.alert('Error', String(error));
        }
      }}
    ]);
  };   

  // ------------ USEFOCUSEFFECT ------------
  useFocusEffect(
    useCallback(() => {
      void refreshData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safearea}>
        <View>
            <View>
              {filteredFolders.map((folder) => (
                <View key={folder.id}>
                  <TouchableOpacity onLongPress={() => handleDeleteFolder(folder.id, folder.name)} delayLongPress={500}>
                    <Text>{folder.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}    
              {allRootNotes.map((note) => (
                <View key={note.id}>
                  <TouchableOpacity onLongPress={() => handleDeleteRootNote(note.id, note.title)} delayLongPress={500}>
                    <Text>{note.title}</Text>
                  </TouchableOpacity>
                </View>
              ))}                                 
            </View>  
        </View>
        <View>
          <Modal visible={visible} transparent animationType='fade'>
            <View style={styles.overlay}>
              <View style={styles.modal}>
                {modalType === 'folder' && (
                  <>
                    <TextInput
                        placeholder='Folder name...'
                        value={folderName}
                        onChangeText={setFolderName}
                        style={{
                          width: '100%',
                          borderWidth: 1,
                          padding: 12,
                          marginBottom: 20,
                        }}
                    />
                    <View>
                      <TouchableOpacity onPress={closeModal}>
                        <Text>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleAddFolder}>
                        <Text>Save</Text>
                      </TouchableOpacity>
                    </View>                               
                  </>
                )} 
              
                {modalType === 'note' && (
                  <>
                      <TextInput
                        placeholder='Note title...'
                        value={rootNoteTitle}
                        onChangeText={setRootNoteTitle}
                        style={{
                          width: '100%',
                          borderWidth: 1,
                          padding: 12,
                          marginBottom: 20,
                        }}
                      />
                      <TextInput
                        placeholder='Note content...'
                        value={rootNoteBody}
                        onChangeText={setRootNoteBody}
                        style={{
                          width: '100%',
                          borderWidth: 1,
                          padding: 12,
                          marginBottom: 20,
                        }}
                        multiline
                      />
                      <View>
                        <TouchableOpacity onPress={closeModal}>
                          <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleAddRootNote}>
                          <Text>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                )} 
              </View>
            </View>
          </Modal>
      </View>

      <View style={styles.container}>
        <Animated.View style={[styles.smallFab, fab2]}>
          <TouchableOpacity style={styles.fab} onPress={() => openModal("folder")}>
            <Ionicons name='folder' size={22} color="white"/>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.smallFab, fab1]}>
          <TouchableOpacity style={styles.fab} onPress={() => openModal("note")}>
            <Ionicons name='document' size={22} color="white"/>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.mainFab} onPress={toggleMenu}>
          <Ionicons name ={open ? "close" : "add"} size={30} color="white"/>
        </TouchableOpacity>
      </View>  
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safearea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    position: "absolute",
    bottom: 95,
    right: 30,
    alignItems: "center",
  },

  // --------------------------------

  mainFab: {
    width: 70,
    height: 70,
    borderRadius: 30,
    backgroundColor: "#f684ae",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  smallFab: {
    position: "absolute",
  },

  fab: {
    width: 65,
    height: 65,
    borderRadius: 30,
    backgroundColor: "#f684ae",
    justifyContent: "center",
    alignItems: "center",
  },

  // ------------------------------

  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
  }
})