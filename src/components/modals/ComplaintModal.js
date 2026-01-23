import React, {useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import GradientButton from '../button';
import {COLORS, fontFamly} from '../../constants';
import {width} from 'react-native-dimension';

const options = [
  {label: 'Refund', value: 'refund'},
  {label: 'Services Issue', value: 'services_issue'},
  {label: 'Other', value: 'other'},
];

const ComplaintPopup = ({visible, onClose, onConfirm}) => {
  const [note, setNote] = useState('');
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm({note, type: selectedOption.value});
    setNote('');
    setSelectedOption(options[0]);
    setDropdownOpen(false);
  };

  const handleClose = () => {
    onClose();
    setNote('');
    setSelectedOption(options[0]);
    setDropdownOpen(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Enter your complaint</Text>
          <Text
            style={{
              fontSize: 12,
              color: COLORS.black,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              marginBottom: width(2),
            }}>
            Type
          </Text>

          {/* Custom Dropdown */}
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setDropdownOpen(!dropdownOpen)}>
            <Text style={styles.dropdownText}>{selectedOption.label}</Text>
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdownOptions}>
              {options.map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.optionItem}
                  onPress={() => {
                    setSelectedOption(item);
                    setDropdownOpen(false);
                  }}>
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <Text
            style={{
              fontSize: 12,
              color: COLORS.black,
              fontFamily: fontFamly.PlusJakartaSansSemiRegular,
              marginBottom: width(2),
            }}>
            Reason
          </Text>
          <TextInput
            style={styles.input}
            placeholderTextColor={COLORS.textLight}
            placeholder="Type your complaint here..."
            value={note}
            onChangeText={setNote}
            multiline
          />

          <View style={styles.buttonRow}>
            <View style={{width: width(35)}}>
              <GradientButton
                text="Cancel"
                type="outline"
                useGradient={true}
                onPress={handleClose}
                outlineButtonStyle={{
                  backgroundColor: COLORS.backgroundLight,
                  borderColor: COLORS.border,
                }}
              />
            </View>

            <View style={{width: width(35)}}>
              <GradientButton
                text="Confirm"
                type="filled"
                useGradient={true}
                onPress={handleConfirm}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    color: COLORS.black,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 5,
    backgroundColor: COLORS.backgroundLight,
  },
  dropdownText: {
    color: COLORS.black,
    fontSize: 16,
  },
  dropdownOptions: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    marginBottom: 15,
  },
  optionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.black,
  },
  input: {
    height: 100,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    textAlignVertical: 'top',
    marginBottom: 20,
    color: COLORS.black,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default ComplaintPopup;
