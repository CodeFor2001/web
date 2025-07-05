import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Shield, Eye, EyeOff, CircleCheck as CheckCircle, X } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';

type Step = 'email' | 'otp' | 'reset';

// Mock registered emails for validation
const registeredEmails = [
  'superadmin@vigilix.tech',
  'admin@vigilix.tech',
  'user@vigilix.tech',
  'admin-nonsensor@vigilix.tech',
  'user-nonsensor@vigilix.tech'
];

// Mock valid OTP for demo
const validOTP = '123456';

interface NotificationProps {
  visible: boolean;
  message: string;
  type: 'error' | 'success';
  onClose: () => void;
}

const NotificationPopup = ({ visible, message, type, onClose }: NotificationProps) => {
  React.useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Auto-dismiss after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.notificationOverlay}>
        <View style={[
          styles.notificationContainer,
          { backgroundColor: type === 'error' ? Colors.error : Colors.success }
        ]}>
          <View style={styles.notificationContent}>
            {type === 'success' ? (
              <CheckCircle size={24} color={Colors.textInverse} />
            ) : (
              <X size={24} color={Colors.textInverse} />
            )}
            <Text style={styles.notificationText}>{message}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.notificationClose}>
            <X size={20} color={Colors.textInverse} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'error' as 'error' | 'success'
  });

  const showNotification = (message: string, type: 'error' | 'success' = 'error') => {
    setNotification({ visible: true, message, type });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return 'Password must contain at least one special character (@$!%*?&)';
    }
    return null;
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      showNotification('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification('Please enter a valid email address');
      return;
    }

    // Check if email is registered
    if (!registeredEmails.includes(email.toLowerCase())) {
      showNotification('Email not registered');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification(`A verification code has been sent to ${email}`, 'success');
      setCurrentStep('otp');
    } catch (error) {
      showNotification('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      showNotification('Please enter a valid 6-digit OTP');
      return;
    }

    // Check if OTP is correct
    if (otp !== validOTP) {
      showNotification('Incorrect OTP. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setCurrentStep('reset');
    } catch (error) {
      showNotification('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      showNotification('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      showNotification(passwordError);
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Password Reset Successful',
        'Your password has been reset successfully. You can now log in with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error) {
      showNotification('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderEmailStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Mail size={32} color={Colors.info} />
        </View>
        <Text style={styles.stepTitle}>Reset Your Password</Text>
        <Text style={styles.stepSubtitle}>
          Enter your email address and we'll send you a verification code to reset your password.
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={handleSendOTP}
        disabled={isLoading}
      >
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.buttonGradient}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.demoInfo}>
        <Text style={styles.demoTitle}>Demo Information</Text>
        <Text style={styles.demoText}>
          For testing, use any of the demo emails from the login screen.{'\n'}
          Valid OTP: <Text style={styles.demoCode}>123456</Text>
        </Text>
      </View>
    </View>
  );

  const renderOTPStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Shield size={32} color={Colors.info} />
        </View>
        <Text style={styles.stepTitle}>Enter Verification Code</Text>
        <Text style={styles.stepSubtitle}>
          We've sent a 6-digit verification code to {email}. Please enter it below.
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Verification Code</Text>
        <TextInput
          style={[styles.input, styles.otpInput]}
          value={otp}
          onChangeText={setOtp}
          placeholder="Enter 6-digit code"
          keyboardType="number-pad"
          maxLength={6}
          placeholderTextColor={Colors.textTertiary}
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={handleVerifyOTP}
        disabled={isLoading}
      >
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.buttonGradient}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setCurrentStep('email')}
      >
        <Text style={styles.secondaryButtonText}>Resend Code</Text>
      </TouchableOpacity>

      <View style={styles.demoInfo}>
        <Text style={styles.demoTitle}>Demo OTP</Text>
        <Text style={styles.demoText}>
          Use this code: <Text style={styles.demoCode}>123456</Text>
        </Text>
      </View>
    </View>
  );

  const renderResetStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <View style={styles.stepIconContainer}>
          <Shield size={32} color={Colors.success} />
        </View>
        <Text style={styles.stepTitle}>Create New Password</Text>
        <Text style={styles.stepSubtitle}>
          Please create a strong password for your account.
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={Colors.textTertiary}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={20} color={Colors.textTertiary} />
            ) : (
              <Eye size={20} color={Colors.textTertiary} />
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.passwordRequirements}>
          Password must be at least 8 characters with uppercase, lowercase, number, and special character
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor={Colors.textTertiary}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color={Colors.textTertiary} />
            ) : (
              <Eye size={20} color={Colors.textTertiary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        <LinearGradient
          colors={[Colors.gradientStart, Colors.gradientEnd]}
          style={styles.buttonGradient}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={[Colors.deepNavy, Colors.lightNavy]}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={Colors.textInverse} />
            </TouchableOpacity>
            <LinearGradient
              colors={[Colors.gradientStart, Colors.gradientEnd]}
              style={styles.titleGradient}
            >
              <Text style={styles.title}>VIGILIX</Text>
            </LinearGradient>
          </View>

          {currentStep === 'email' && renderEmailStep()}
          {currentStep === 'otp' && renderOTPStep()}
          {currentStep === 'reset' && renderResetStep()}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Vigilix Food Safety System v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>

      <NotificationPopup
        visible={notification.visible}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  content: {
    paddingHorizontal: 32,
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  titleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: Colors.textInverse,
    textAlign: 'center',
  },
  stepContainer: {
    marginBottom: 32,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: Colors.textInverse,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    backgroundColor: Colors.backgroundPrimary,
    color: Colors.textPrimary,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    letterSpacing: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderMedium,
    borderRadius: 8,
    backgroundColor: Colors.backgroundPrimary,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: Colors.textPrimary,
  },
  eyeButton: {
    padding: 16,
  },
  passwordRequirements: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
    marginTop: 8,
    lineHeight: 16,
  },
  primaryButton: {
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: Colors.gradientStart,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    height: 48,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: Colors.textTertiary,
  },
  demoInfo: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  demoTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
    lineHeight: 20,
  },
  demoCode: {
    fontFamily: 'Inter-Bold',
    color: Colors.gradientStart,
  },
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  // Notification styles
  notificationOverlay: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    maxWidth: 400,
    width: '90%',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  notificationText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: Colors.textInverse,
    flex: 1,
  },
  notificationClose: {
    padding: 4,
    marginLeft: 8,
  },
});
