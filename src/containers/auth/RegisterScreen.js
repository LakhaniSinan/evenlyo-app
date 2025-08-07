import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../hooks';
import { registerUser } from '../../store/slices/authSlice';
import { COLORS, SIZES } from '../../constants';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedRole, setSelectedRole] = useState(null);
  const { isLoading, dispatch } = useAuth();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { name, email, password, confirmPassword } = formData;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!selectedRole) {
      Alert.alert('Error', 'Please select your role');
      return;
    }

    try {
      await dispatch(registerUser({
        name,
        email,
        password,
        role: selectedRole,
      })).unwrap();
      // Navigation will be handled automatically by AppNavigator
    } catch (error) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong');
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor={COLORS.textLight}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={COLORS.textLight}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={COLORS.textLight}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
            />

            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={COLORS.textLight}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
            />

            {/* Role Selection */}
            <Text style={styles.roleTitle}>I am a:</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'client' && styles.roleButtonSelected,
                ]}
                onPress={() => setSelectedRole('client')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    selectedRole === 'client' && styles.roleButtonTextSelected,
                  ]}
                >
                  Client
                </Text>
                <Text style={styles.roleDescription}>
                  Looking for events to attend
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleButton,
                  selectedRole === 'vendor' && styles.roleButtonSelected,
                ]}
                onPress={() => setSelectedRole('vendor')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    selectedRole === 'vendor' && styles.roleButtonTextSelected,
                  ]}
                >
                  Vendor
                </Text>
                <Text style={styles.roleDescription}>
                  Organizing events for others
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.registerButtonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.signInText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
  form: {
    marginBottom: SIZES.lg,
  },
  input: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.md,
    marginTop: SIZES.sm,
  },
  roleContainer: {
    marginBottom: SIZES.lg,
  },
  roleButton: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  roleButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  roleButtonTextSelected: {
    color: COLORS.primary,
  },
  roleDescription: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SIZES.md,
    marginTop: SIZES.md,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  signInText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
