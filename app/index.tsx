import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';


import { Item, ItemType } from '../config/database';
import {
  addFolder,
  addNote,
  deleteItem,
  getItems
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
  // ---------------------- APP STATE ------------------------
  const [items, setItems] = useState<Item[]>([]);

  const [folderName, setFolderName] = useState('');

  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');    

  // state query
  const [searchQuery, setSearchQuery] = useState('');

  // filter search
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // -------------------- ANIMATION -------------------------

  // animated value buat mengontrol pergerakan FAB
  const animation = useRef(new Animated.Value(0)).current;

  //  animasi child FAB untuk membuat note
  const fab1 = {transform: 
    [{translateY: animation.interpolate
      ({
        inputRange: [0, 1],
        outputRange: [0, -70],
      }),
    },],
    opacity: animation,
  };

  // animasi child FAB untuk membuat folder
  const fab2 = {transform: 
    [{translateY: animation.interpolate
      ({
        inputRange: [0, 1],
        outputRange: [0, -140],
      }),
    },],
    opacity: animation,
  };

  // --------------- FLOATING ACTION BUTTON FAB -------------------------

  const [open, setOpen] = useState(false);

  // toggle open/close MAIN FAB
  const toggleMenu = () => {
    const toValue = open ? 0 : 1;
    Animated.spring(animation, {
    toValue, useNativeDriver: true,
    }).start();
    setOpen(!open);
  };

  // buat menentukan apakah modal muncul/tdk
  const [visible, setVisible] = useState(false);

  // nentuin jenis modalny apa
  const [modalType, setModalType] = useState<'folder' | 'note' | null>(null); 

  // buka modal sesuai jenis yg dipilih
  const openModal = (type: "folder" | "note") => {
    setModalType(type);
    setVisible(true);
  };  

  // menutup modal dan reset semua input
  const closeModal = () => {
    setVisible(false);
    setModalType(null);

    setFolderName('');
    setNoteTitle('');
    setNoteBody('');
  };

  // ----------------- REFRESH DATA ----------------------

  // ngambil ulang seluruh data dari SQLite
  const loadingRef = useRef(false); 
  const refreshData = async () => {
    if (loadingRef.current) return;

    // mencegah refreshData dipanggil bersamaan
    loadingRef.current = true;

    try {
      const allItems = await getItems(null);

      setItems(allItems);

    } catch (error) {
    console.log('refreshData error:', error);
    Alert.alert('Error', String(error));

    } finally {
    loadingRef.current = false;
    }
  };      

  // --------- ADD & DELETE ----------

  // add folder 
  const handleAddFolder = async () => {
    try {
      console.log('adding folder...');

      if (folderName.trim() === '') {
        Alert.alert('Name required!');
        return;
      }

      await addFolder(folderName, null);
      await refreshData();
      closeModal();

    } catch (error) {
      console.log('add folder error:', error);
      Alert.alert('Error', String(error));
    }
  };   

  // add note
  const handleAddNote =async  () => {
    try {
      console.log('adding note...');

      if (noteTitle.trim() === '') {
        Alert.alert('Title required!');
        return;
      }

      await addNote(noteTitle, noteBody, null);
      await refreshData();
      closeModal();

    } catch (error) {
      console.log('add note error:', error);
      Alert.alert('Error', String(error));
    }
  };  

  // delete for folder & note
  const handleDeleteItem = (item: Item) => {
    Alert.alert(
      'Delete',
      `Are you sure you want to delete "${item.name}"?`,
      [
        {text: 'Cancel'},
        {text: 'Delete',
          onPress: async () => {
            try {
              await deleteItem(item.id);
              await refreshData();
            } catch (error) {
              Alert.alert('Error', String(error));
            }
          },
        },
      ]
    );
  };

  // ---------------------------------------------

  // refresh data setiap halaman kembali fokus
  useFocusEffect(
    useCallback(() => {
      void refreshData();
    }, [])
  );

  // event saat ikon informasi ditekan
  const handlePressInfo = () => {
    console.log('Info icon pressed');
  };

  return (
    <SafeAreaView style={styles.safearea}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Mynotes
        </Text>

        <TouchableOpacity
          onPress={handlePressInfo}
          activeOpacity={0.7}
          accessibilityRole='button'
          accessibilityLabel='Information'
        >
          <Ionicons name="information-circle-outline" size={22} color="#ffffff" />
        </TouchableOpacity>
      </View> 

      <View>
          <View>
            {filteredItems.map((item) => (
              <View key={item.id}>
                <TouchableOpacity onLongPress={() => handleDeleteItem(item)} delayLongPress={500}>
                  <Text>{item.type === ItemType.Folder ? '📁' : '📝'} {item.name}</Text>
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
                      value={noteTitle}
                      onChangeText={setNoteTitle}
                      style={{
                        width: '100%',
                        borderWidth: 1,
                        padding: 12,
                        marginBottom: 20,
                      }}
                    />
                    <TextInput
                      placeholder='Note content...'
                      value={noteBody}
                      onChangeText={setNoteBody}
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
                      <TouchableOpacity onPress={handleAddNote}>
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
    paddingHorizontal: 12,
    backgroundColor: 'black',
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
  },

    header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
})

// hhh gonna style this soon 😭