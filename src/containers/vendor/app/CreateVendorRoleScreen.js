import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  BackHandler,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLORS, fontFamly} from '../../../constants';

const GRADIENT_COLORS = ['#FF295D', '#E31B95', '#C817AE'];
const INPUT_TINT = '#E8F2FC';

const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim());

const RequiredLabel = ({children}) => (
  <Text style={styles.label}>
    {children}
    <Text style={styles.star}> *</Text>
  </Text>
);

const CreateVendorRoleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const designationOptions = useMemo(
    () => route.params?.designationOptions ?? [],
    [route.params?.designationOptions],
  );

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [designationId, setDesignationId] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const selectedDesignationLabel = designationId
    ? designationOptions.find(d => d.id === designationId)?.name
    : null;

  const buildPayload = () => ({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    contactNumber: contactNumber.trim(),
    designation: designationId || '',
    designationName: selectedDesignationLabel || '',
    password,
  });

  const validate = () => {
    const p = buildPayload();
    if (!p.firstName) {
      Alert.alert('Required', 'Please enter first name.');
      return null;
    }
    if (!p.lastName) {
      Alert.alert('Required', 'Please enter last name.');
      return null;
    }
    if (!p.email || !emailOk(p.email)) {
      Alert.alert('Required', 'Please enter a valid email.');
      return null;
    }
    if (!p.contactNumber) {
      Alert.alert('Required', 'Please enter contact number.');
      return null;
    }
    if (!p.designation) {
      Alert.alert('Required', 'Please choose a designation.');
      return null;
    }
    if (!p.password || p.password.length < 6) {
      Alert.alert('Required', 'Password must be at least 6 characters.');
      return null;
    }
    return {
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      contactNumber: p.contactNumber,
      designation: p.designation,
      designationName: p.designationName,
      password: p.password,
    };
  };

  const handleCreate = () => {
    const payload = validate();
    if (!payload) {
      return;
    }
    const now = new Date();
    const fullName = `${payload.firstName} ${payload.lastName}`.trim();
    const row = {
      id: `role-${Date.now()}`,
      date: now.toLocaleString(),
      name: fullName,
      allAccess: payload.designationName || payload.designation,
      status: 'Active',
      raw: payload,
    };
    navigation.navigate({
      name: 'VendorRoleManagement',
      params: {submittedRole: row},
      merge: true,
    });
  };

  const handleCancel = useCallback(() => {
    navigation.navigate('VendorRoleManagement');
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (pickerOpen) {
          setPickerOpen(false);
          return true;
        }
        handleCancel();
        return true;
      });
      return () => sub.remove();
    }, [handleCancel, pickerOpen]),
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Create New Role</Text>
          <TouchableOpacity
            onPress={handleCancel}
            hitSlop={12}
            style={styles.closeBtn}>
            <Icon name="close" size={26} color={COLORS.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          <View style={styles.rowHalf}>
            <View style={styles.halfCol}>
              <RequiredLabel>First Name</RequiredLabel>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter first name"
                placeholderTextColor={COLORS.textLight}
                style={styles.input}
              />
            </View>
            <View style={styles.halfCol}>
              <RequiredLabel>Last Name</RequiredLabel>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
                placeholderTextColor={COLORS.textLight}
                style={styles.input}
              />
            </View>
          </View>

          <RequiredLabel>Email</RequiredLabel>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email"
            placeholderTextColor={COLORS.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, styles.inputTint]}
          />

          <View style={styles.rowHalf}>
            <View style={styles.halfCol}>
              <RequiredLabel>Contact Number</RequiredLabel>
              <TextInput
                value={contactNumber}
                onChangeText={setContactNumber}
                placeholder="Enter contact number"
                placeholderTextColor={COLORS.textLight}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
            <View style={styles.halfCol}>
              <RequiredLabel>Select Designation</RequiredLabel>
              <TouchableOpacity
                style={[styles.input, styles.dropdown]}
                activeOpacity={0.7}
                onPress={() => setPickerOpen(true)}>
                <Text
                  style={
                    selectedDesignationLabel
                      ? styles.dropdownValue
                      : styles.dropdownPlaceholder
                  }
                  numberOfLines={1}>
                  {selectedDesignationLabel || 'Choose a Designation'}
                </Text>
                <Icon name="chevron-down" size={20} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
          </View>

          <RequiredLabel>Set Password</RequiredLabel>
          <View style={[styles.input, styles.inputTint, styles.passwordRow]}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry={!showPassword}
              style={styles.passwordInput}
            />
            <TouchableOpacity onPress={() => setShowPassword(s => !s)}>
              <Icon
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.9} onPress={handleCreate}>
            <LinearGradient
              colors={GRADIENT_COLORS}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Create Role</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <Modal
          visible={pickerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setPickerOpen(false)}>
          <TouchableWithoutFeedback onPress={() => setPickerOpen(false)}>
            <View style={styles.modalBackdrop}>
              <TouchableWithoutFeedback>
                <View style={styles.modalSheet}>
                  <Text style={styles.modalTitle}>Choose a Designation</Text>
                  {designationOptions.length === 0 ? (
                    <Text style={styles.modalEmpty}>
                      No designations yet. Create one under Set Designation first.
                    </Text>
                  ) : (
                    <FlatList
                      data={designationOptions}
                      keyExtractor={item => String(item.id)}
                      keyboardShouldPersistTaps="handled"
                      renderItem={({item}) => (
                        <TouchableOpacity
                          style={styles.pickerRow}
                          onPress={() => {
                            setDesignationId(item.id);
                            setPickerOpen(false);
                          }}>
                          <Text style={styles.pickerRowText}>{item.name}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                  <TouchableOpacity
                    style={styles.modalClose}
                    onPress={() => setPickerOpen(false)}>
                    <Text style={styles.modalCloseText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default CreateVendorRoleScreen;

const styles = StyleSheet.create({
  flex: {flex: 1, backgroundColor: COLORS.white},
  screen: {flex: 1, backgroundColor: COLORS.white},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width(4),
    paddingTop: width(2),
    paddingBottom: width(3),
    backgroundColor: COLORS.white,
  },
  title: {
    flex: 1,
    fontSize: 18,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansBold,
  },
  closeBtn: {padding: 4},
  scroll: {
    flexGrow: 1,
    paddingHorizontal: width(4),
    paddingBottom: width(6),
    backgroundColor: COLORS.white,
  },
  label: {
    fontSize: 13,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    marginBottom: 8,
  },
  star: {color: '#DC2626'},
  rowHalf: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  halfCol: {flex: 1},
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFF4',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    marginBottom: width(3),
  },
  inputTint: {
    backgroundColor: INPUT_TINT,
    borderColor: '#C7D9F0',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  dropdownPlaceholder: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  dropdownValue: {
    flex: 1,
    color: COLORS.textDark,
    fontSize: 14,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: width(4),
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: width(4),
    paddingVertical: width(3),
    paddingBottom: width(5),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EFEFF4',
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: width(6),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.black,
    fontSize: 15,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  primaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: width(6),
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: width(6),
    paddingVertical: width(10),
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    maxHeight: '70%',
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: fontFamly.PlusJakartaSansBold,
    color: COLORS.black,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  modalEmpty: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    fontSize: 13,
  },
  pickerRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
  },
  pickerRowText: {
    fontSize: 15,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  modalClose: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseText: {
    color: COLORS.primary,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    fontSize: 15,
  },
});
