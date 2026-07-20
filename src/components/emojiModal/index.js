// components/EmojiPickerPopup.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import {width} from 'react-native-dimension';
import {COLORS, fontFamly} from '../../constants';

const EmojiPickerPopup = ({visible, onClose, onSelectEmoji, emojis = []}) => {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.popupContainer}>
          <Text style={styles.title}>Select Emoji</Text>
          <ScrollView
            contentContainerStyle={styles.emojiGrid}
            showsVerticalScrollIndicator={false}>
            {emojis.map((emoji, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onSelectEmoji(emoji)}
                style={styles.emojiButton}>
                <Text style={styles.emoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: COLORS.white,
    width: width(80),
    borderRadius: 16,
    padding: width(5),
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 2,
  },
  title: {
    fontFamily: fontFamly.PlusJakartaSansBold,
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: width(3),
    textAlign: 'center',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  emojiButton: {
    padding: width(2),
    margin: width(1),
  },
  emoji: {
    fontSize: 28,
  },
});

export default EmojiPickerPopup;
