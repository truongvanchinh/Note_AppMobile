import React, { Component, useRef, useState } from 'react'
import { Text, StyleSheet, View, ScrollView, Alert } from 'react-native'
import { useHeaderHeight } from '@react-navigation/elements'
import colors from '../misc/colors'
import RoundIconBtn from './RoundIconBtn';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotes } from '../contexts/NoteProvider';
import NoteInputModal from './NoteInputModal';

/////////////////////////////////////////////////
import {
  actions,
  RichEditor,
  RichToolbar,
} from "react-native-pell-rich-editor";
/////////////////////////////////////////////////

// Xử lý việc lưu lại ngày ghi chú
const formatDate = ms => {
  const date = new Date(ms)
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hrs = date.getHours();
  const min = date.getMinutes();
  const sec = date.getSeconds();

  return `${day}/${month}/${year} - ${hrs}:${min}:${sec}`;
};

const NoteDetail = (props) => {
    // Hàm setNote ở đây để xử lí việc sau khi đã update note, note mới không được hiển thị
    const [note, setNote] = useState(props.route.params.note)
    const headerHeight = useHeaderHeight()
    // Lấy ra hàm setNotes để lưu lại dữ liệu trong Async Storage
    const {setNotes} = useNotes()
    const [showModal, setShowModal] = useState(false)
    const [isEdit, setIsEdit] = useState(false)

    /////////////////////////////////////////////////
    const richText = useRef();
    /////////////////////////////////////////////////

    const deleteNote = async () => {
      const result = await AsyncStorage.getItem('notes')
      let notes = []
      if (result !== null) notes = JSON.parse(result)

      const newNotes = notes.filter(n => n.id !== note.id)
      setNotes(newNotes)
      await AsyncStorage.setItem('notes', JSON.stringify(newNotes))

      // We can use the props.navigation cuz we wrapped the NoteDetail component
      // in the Stack.Navigator so we can use the navigation to go back
      props.navigation.goBack();
    }

    const displayDeleteAlert = () => {
      Alert.alert('Are You Sure?', 'This action will delete your note permanently!!', [{
      text: 'Delete',
      onPress: deleteNote
    },
    {
      text: 'No Thanks',
      onPress: () => console.log('cancel delete')
    }], { cancelable: true, })}

    // *************************************************
    // Problem arise when we updated the note during use
    // *************************************************

    const handleUpdate = async (title, desc, time) => {
      const result = await AsyncStorage.getItem('notes')
      let notes = []
      if (result !== null) notes = JSON.parse(result)
      const newNotes = notes.filter(n => {
        if (n.id === note.id) {
          n.title = title
          n.desc = desc
          n.isUpdated = true
          n.time = time

          setNote(n)
        }
        return n;
      })
      
      setNotes(newNotes)
      await AsyncStorage.setItem('notes', JSON.stringify(newNotes))
    };

    const handleOnClose = () => setShowModal(false)

    const openEditModal = () => {
      setIsEdit(true)
      setShowModal(true)
    }

    return (
      <>
      <ScrollView contentContainerStyle={[styles.container, {paddingTop: headerHeight}]}>

        <Text style={styles.time}>{note.isUpdated ? `Updated At ${formatDate(note.time)}` : `Created At ${formatDate(note.time)}`}</Text>
        <Text style={styles.title}>{note.title}</Text>
        {/* <Text style={styles.desc}>{note.desc}</Text> */}
        
        <ScrollView>
          {/* <RichToolbar 
            editor={richText}
            selectedIconTint="#873c1e"
            iconTint="#312921"
            actions={[
            actions.insertImage,
            actions.setBold,
            actions.setItalic,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.insertLink,
            actions.setStrikethrough,
            actions.setUnderline,
            ]}
            style={styles.richTextToolbarStyle} /> */}

          <RichEditor
            // ref={richText}
            initialContentHTML={note.desc}
            style={styles.richTextEditorStyle}
            initialHeight={250}
          />
        </ScrollView>
      </ScrollView>

        <View style={styles.btnContainer}>
            <RoundIconBtn antIconName='delete' style={{backgroundColor: colors.ERROR, 
              marginBottom: 15}} onPress={displayDeleteAlert}/>
            <RoundIconBtn antIconName='edit' onPress={openEditModal}/>
        </View>
        
        <NoteInputModal isEdit={isEdit} note={note} onClose={handleOnClose} onSubmit={handleUpdate} visible={showModal} />
      </>
    )
  }

const styles = StyleSheet.create({
    container: {
      // flex: 1,
      paddingHorizontal: 15,
    },
    title: {
      fontSize: 30,
      color: colors.PRIMARY,
      fontWeight: 'bold',
    },
    desc: {
      fontSize: 20,
      opacity: 0.6,
    },
    time: {
      textAlign: 'right',
      fontSize: 12,
      opacity: 0.5,
    },
    btnContainer: {
      position: 'absolute',
      right: 15,
      bottom: 50, 
    },
    richTextEditorStyle: {
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      borderWidth: 1,
      borderColor: "#ccaf9b",
      shadowColor: "#000",
      shadowOffset: {
      width: 0,
      height: 2,
      },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
      fontSize: 20,
    },
    richTextToolbarStyle: {
      backgroundColor: "#c6c3b3",
      borderColor: "#c6c3b3",
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderWidth: 1,
    },
})

export default NoteDetail;