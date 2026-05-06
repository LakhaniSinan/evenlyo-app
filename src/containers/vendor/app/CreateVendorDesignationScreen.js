import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useLayoutEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {
  Alert,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {width} from 'react-native-dimension';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import Loader from '../../../components/loder';
import {COLORS, fontFamly} from '../../../constants';
import {DESIGNATION_MODULE_OPTIONS} from '../../../constants/vendorDesignationModules';
import {
  buildPermissionMapFromApiItem,
  createVendorDesignation,
  updateVendorDesignation,
} from '../../../services/VendorDesignation';

const GRADIENT_COLORS = ['#FF295D', '#E31B95', '#C817AE'];

const emptyPermissions = () =>
  Object.fromEntries(DESIGNATION_MODULE_OPTIONS.map(m => [m.id, false]));

const CreateVendorDesignationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {user} = useSelector(state => state.LoginSlice);
  const vendorId = user?.id ?? user?._id ?? user?.vendorDetails?._id;
  const [submitting, setSubmitting] = useState(false);
  const [designationName, setDesignationName] = useState('');
  const [status, setStatus] = useState(true);
  const [permissions, setPermissions] = useState(emptyPermissions);
  const [editingId, setEditingId] = useState(null);

  const resetForm = useCallback(() => {
    setDesignationName('');
    setStatus(true);
    setPermissions(emptyPermissions());
    setEditingId(null);
  }, []);

  const togglePermission = useCallback(id => {
    setPermissions(prev => ({...prev, [id]: !prev[id]}));
  }, []);

  const buildPayload = useCallback(() => {
    const selected = DESIGNATION_MODULE_OPTIONS.filter(
      m => permissions[m.id],
    ).map(m => m.id);
    return {
      designationName: designationName.trim(),
      status,
      permissions: selected.map(module => ({
        module,
        canView: true,
        canEdit: true,
      })),
    };
  }, [designationName, status, permissions]);

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload.designationName) {
      Alert.alert('Required', 'Please enter a designation name.');
      return;
    }
    if (!vendorId) {
      Alert.alert('Error', 'Vendor account not found. Please log in again.');
      return;
    }
    const effectiveEditId =
      editingId ||
      (route.params?.mode === 'edit'
        ? String(
            route.params?.designation?._id ??
              route.params?.designation?.id ??
              '',
          ).trim()
        : '');

    const sharedFields = {
      name: payload.designationName,
      designationName: payload.designationName,
      isActive: payload.status,
      permissions: payload.permissions,
    };

    const createBody = {
      vendorId,
      ...sharedFields,
      status: payload.status,
    };
    const updateBody = {
      vendorId,
      ...sharedFields,
      status: payload.status,
    };

    setSubmitting(true);
    try {
      let res;
      if (effectiveEditId) {
        res = await updateVendorDesignation(effectiveEditId, updateBody);
      } else {
        res = await createVendorDesignation(createBody);
      }
      const ok =
        res?.status === 200 ||
        res?.status === 201 ||
        res?.status === 204;
      if (ok) {
        navigation.navigate('VendorRoleManagement');
      } else {
        const data = res?.data;
        const msg =
          (typeof data?.message === 'string' && data.message) ||
          (typeof data?.error === 'string' && data.error) ||
          (Array.isArray(data?.errors) && data.errors[0]) ||
          (typeof data === 'string' ? data : null);
        Alert.alert(
          'Error',
          msg ||
            (effectiveEditId
              ? `Could not update designation${res?.status ? ` (${res.status})` : ''}.`
              : 'Could not create designation.'),
        );
      }
    } catch {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = useCallback(() => {
    navigation.navigate('VendorRoleManagement');
  }, [navigation]);

  useLayoutEffect(() => {
    const item = route.params?.designation;
    if (route.params?.mode === 'edit' && item) {
      setDesignationName(
        String(item.designationName ?? item.name ?? item.title ?? '').trim(),
      );
      const st = item.status ?? item.isActive ?? item.active;
      setStatus(
        st !== false &&
          st !== 'inactive' &&
          st !== 'Inactive' &&
          st !== '0',
      );
      setPermissions(buildPermissionMapFromApiItem(item));
      setEditingId(String(item._id ?? item.id ?? '').trim() || null);
    } else {
      resetForm();
    }
  }, [route.params?.mode, route.params?.designation, resetForm]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        handleCancel();
        return true;
      });
      return () => sub.remove();
    }, [handleCancel]),
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {route.params?.mode === 'edit' && route.params?.designation
              ? 'Edit Designation'
              : 'Create New Designation'}
          </Text>
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
          <Text style={styles.label}>Designation Name</Text>
          <TextInput
            value={designationName}
            onChangeText={setDesignationName}
            placeholder="Enter Designation name"
            placeholderTextColor={COLORS.textLight}
            style={styles.input}
          />

          <View style={styles.statusRow}>
            <View style={styles.statusLabels}>
              <Text style={styles.label}>Status</Text>
              <Text style={styles.subLabel}>Set designation status</Text>
            </View>
            <View style={styles.statusRight}>
              {status ? (
                <View style={styles.activePill}>
                  <Text style={styles.activePillText}>Active</Text>
                </View>
              ) : (
                <View style={[styles.activePill, styles.inactivePill]}>
                  <Text style={styles.inactivePillText}>Inactive</Text>
                </View>
              )}
              <Switch
                value={status}
                onValueChange={setStatus}
                trackColor={{false: '#FECACA', true: '#F9A8D4'}}
                thumbColor={status ? COLORS.primary : '#EF4444'}
              />
            </View>
          </View>

          <Text style={[styles.label, styles.mt]}>Module Permissions</Text>
          <Text style={styles.subLabel}>
            Select access permissions for each module
          </Text>

          <View style={styles.moduleList}>
            {DESIGNATION_MODULE_OPTIONS.map((mod, idx) => (
              <TouchableOpacity
                key={mod.id}
                style={[
                  styles.moduleRow,
                  idx === DESIGNATION_MODULE_OPTIONS.length - 1 &&
                    styles.moduleRowLast,
                ]}
                activeOpacity={0.7}
                onPress={() => togglePermission(mod.id)}>
                <Icon
                  name={
                    permissions[mod.id] ? 'checkbox' : 'square-outline'
                  }
                  size={22}
                  color={
                    permissions[mod.id] ? COLORS.primary : COLORS.textLight
                  }
                />
                <Text style={styles.moduleLabel}>{mod.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancel}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSubmit}
            disabled={submitting}
            style={styles.primaryBtnWrap}>
            <LinearGradient
              colors={GRADIENT_COLORS}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>
                {route.params?.mode === 'edit' && route.params?.designation
                  ? 'Update Designation'
                  : 'Create Designation'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <Loader isLoading={submitting} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default CreateVendorDesignationScreen;

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
    fontSize: 14,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    marginBottom: 10,
  },
  mt: {marginTop: width(2)},
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EFEFF4',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.black,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
    marginBottom: width(4),
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: width(4),
  },
  statusLabels: {flex: 1, paddingRight: 12},
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  activePillText: {
    color: '#15803D',
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  inactivePill: {backgroundColor: '#FEE2E2'},
  inactivePillText: {
    color: '#B91C1C',
    fontSize: 12,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  moduleList: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EFEFF4',
    overflow: 'hidden',
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F5',
    gap: 12,
  },
  moduleRowLast: {
    borderBottomWidth: 0,
  },
  moduleLabel: {
    fontSize: 14,
    color: COLORS.textDark,
    fontFamily: fontFamly.PlusJakartaSansSemiRegular,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: width(4),
    paddingVertical: width(3),
    paddingBottom: width(5),
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EFEFF4',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnWrap: {
    flex: 1,
  },
  cancelBtnText: {
    color: COLORS.black,
    fontSize: 15,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: width(42),
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: fontFamly.PlusJakartaSansSemiBold,
  },
});
