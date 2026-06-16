// import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

// export const firebaseAuth = auth();

let confirmationResult: any | null = null;

let mockPhone: string | null = null;

export async function sendFirebaseOTP(phoneNumber: string) {
  try {
    // MOCK OTP FLOW FOR LOCAL TESTING
    console.log('MOCKING FIREBASE OTP FOR:', phoneNumber);
    mockPhone = phoneNumber;
    return true;
  } catch (error) {
    console.error('Error sending Firebase OTP:', error);
    throw error;
  }
}

export async function verifyFirebaseOTP(otp: string) {
  if (!mockPhone) throw new Error('No OTP requested. Please go back and request a new one.');
  
  if (otp !== '123456') {
    throw new Error('Invalid OTP. For testing, please use 123456.');
  }

  try {
    // ACCEPT ANY OTP FOR MOCKING
    console.log('MOCK OTP VERIFIED!');
    // Return a special mock token that backend will recognize
    return 'MOCK_TOKEN_' + mockPhone;
  } catch (error) {
    console.error('Error verifying Firebase OTP:', error);
    throw error;
  }
}
