import React, {useState} from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {height, width} from 'react-native-dimension';
import {COLORS} from '../../constants';
import {useTranslation} from '../../hooks';

const ReportUserModal = ({visible, onClose, onSubmit, userName}) => {
  const {currentLanguage} = useTranslation();
  const isDutch = currentLanguage === 'nl';
  const localizedText = {
    reportUser: isDutch ? 'Gebruiker melden' : 'Report User',
    report: isDutch ? 'Melden' : 'Report',
    reportReasonLabel: isDutch
      ? 'Reden van melding'
      : 'Reason for reporting',
    reportPlaceholder: isDutch
      ? 'Beschrijf waarom je deze gebruiker meldt...'
      : 'Please describe why you are reporting this user...',
    characters: isDutch ? 'tekens' : 'characters',
    cancel: isDutch ? 'Annuleren' : 'Cancel',
  };
  const [reason, setReason] = useState('');

  const handleReport = () => {
    if (reason.trim().length === 0) {return;}
    onSubmit(reason);
    setReason('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrapper}>
                <Text style={styles.flagIcon}>🚩</Text>
              </View>
              <View>
                <Text style={styles.title}>{localizedText.reportUser}</Text>
                <Text style={styles.subtitle}>
                  {localizedText.report} {userName}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Input Field */}
          <Text style={styles.label}>{localizedText.reportReasonLabel}</Text>
          <TextInput
            placeholder={localizedText.reportPlaceholder}
            placeholderTextColor={COLORS.textLight}
            value={reason}
            onChangeText={setReason}
            maxLength={500}
            multiline
            style={styles.textArea}
          />
          <Text style={styles.charCount}>
            {reason.length}/500 {localizedText.characters}
          </Text>

          {/* Buttons */}
          <View style={styles.btnContainer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{localizedText.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.reportBtn,
                {opacity: reason.trim().length ? 1 : 0.6},
              ]}
              onPress={handleReport}
              disabled={!reason.trim().length}>
              <Text style={styles.reportText}>{localizedText.report}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: width(5),
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: width(4),
    width: '100%',
    paddingVertical: height(2),
    paddingHorizontal: width(4),
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height(1.5),
  },
  headerLeft: {flexDirection: 'row', alignItems: 'center', gap: width(3)},
  iconWrapper: {
    backgroundColor: '#fde7e9',
    padding: width(2.2),
    borderRadius: width(3),
  },
  flagIcon: {fontSize: 20},
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight || '#666',
  },
  closeIcon: {fontSize: 20, color: '#999'},
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: height(0.5),
  },
  textArea: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: width(2),
    height: height(15),
    padding: width(3),
    textAlignVertical: 'top',
    color: '#333',
  },
  charCount: {
    alignSelf: 'flex-end',
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: width(3),
    marginTop: height(2),
  },
  cancelBtn: {
    paddingVertical: height(1.2),
    paddingHorizontal: width(5),
    borderRadius: width(3),
    backgroundColor: '#f2f2f2',
  },
  cancelText: {
    color: '#000',
    fontWeight: '500',
  },
  reportBtn: {
    paddingVertical: height(1.2),
    paddingHorizontal: width(5),
    borderRadius: width(3),
    backgroundColor: '#d81b60',
  },
  reportText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ReportUserModal;
