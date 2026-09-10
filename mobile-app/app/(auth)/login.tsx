import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mail, Lock, ArrowRight, ShieldCheck, Building2, Sparkles } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';

export default function LoginScreen() {
  const router = useRouter();
  const { portal } = useLocalSearchParams<{ portal?: string }>();
  const { login, isLoading, error } = useAuthStore();
  const { showToast } = useToastStore();
  
  const isAuthority = portal === 'authority';

  const [identifier, setIdentifier] = useState(isAuthority ? 'dhte.admin@jharkhand.gov.in' : '');
  const [password, setPassword] = useState(isAuthority ? 'admin123' : '');

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      showToast('Please enter both identifier and password', 'error');
      return;
    }

    const success = await login({ email: identifier.trim(), password });

    if (success) {
      showToast('Successfully signed in!', 'success');
      
      const userRole = useAuthStore.getState().user?.role;
      
      if (userRole === 'hei' || userRole === 'hei_admin') {
        router.replace('/(hei)/home' as any);
      } else if (userRole === 'industry_csr' || userRole === 'industry_admin') {
        router.replace('/(industry)/home' as any);
      } else if (userRole === 'government_admin' || userRole === 'govt_admin' || userRole === 'official' || isAuthority) {
        router.replace('/(government)/home' as any);
      } else {
        router.replace('/(citizen)/home');
      }
    } else {
      const errorMessage = useAuthStore.getState().error || 'Invalid credentials. Please try again.';
      showToast(errorMessage, 'error');
    }
  };

  const handleQuickDemoFill = () => {
    setIdentifier('dhte.admin@jharkhand.gov.in');
    setPassword('admin123');
    showToast('Loaded DHTE Admin demo credentials', 'success');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1B1E' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 20, justifyContent: 'center' }}>
          
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            {isAuthority && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(47, 158, 143, 0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#2F9E8F', marginBottom: 12 }}>
                <Building2 size={15} color="#2F9E8F" />
                <Text style={{ color: '#2F9E8F', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 }}>AUTHORITY / DHTE PORTAL</Text>
              </View>
            )}
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#F2EFE9', marginBottom: 8 }}>
              {isAuthority ? 'State Authority Login' : 'Welcome Back'}
            </Text>
            <Text style={{ fontSize: 13, color: '#9BA8A6', textAlign: 'center', lineHeight: 18 }}>
              {isAuthority
                ? 'Sign in to access the Jharkhand DHTE Statewide Oversight & AI Moderation Console.'
                : 'Enter your credentials to access your dashboard. Role is auto-detected on sign-in.'}
            </Text>
          </View>

          {error ? (
            <View style={{ backgroundColor: 'rgba(127, 29, 29, 0.3)', borderColor: 'rgba(239, 68, 68, 0.5)', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: '#F87171', fontSize: 12, textAlign: 'center' }}>{error}</Text>
            </View>
          ) : null}

          <View style={{ backgroundColor: '#16262A', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#1D3238' }}>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#9BA8A6', fontSize: 11, letterSpacing: 1, marginBottom: 6, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                EMAIL OR OFFICIAL ID
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F1B1E', borderRadius: 12, borderWidth: 1, borderColor: '#1D3238', paddingHorizontal: 12, paddingVertical: 12 }}>
                <Mail size={18} color="#9BA8A6" style={{ marginRight: 10 }} />
                <TextInput
                  value={identifier}
                  onChangeText={(val) => { setIdentifier(val); }}
                  placeholder="dhte.admin@jharkhand.gov.in"
                  placeholderTextColor="#9BA8A6"
                  autoCapitalize="none"
                  style={{ flex: 1, color: '#F2EFE9', fontSize: 14 }}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#9BA8A6', fontSize: 11, letterSpacing: 1, marginBottom: 6, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                PASSWORD
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F1B1E', borderRadius: 12, borderWidth: 1, borderColor: '#1D3238', paddingHorizontal: 12, paddingVertical: 12 }}>
                <Lock size={18} color="#9BA8A6" style={{ marginRight: 10 }} />
                <TextInput
                  value={password}
                  onChangeText={(val) => { setPassword(val); }}
                  placeholder="••••••••"
                  placeholderTextColor="#9BA8A6"
                  secureTextEntry
                  style={{ flex: 1, color: '#F2EFE9', fontSize: 14 }}
                />
              </View>
            </View>

            {/* Quick Demo Pre-fill Button */}
            <TouchableOpacity
              onPress={handleQuickDemoFill}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                paddingVertical: 8,
                backgroundColor: '#0F1B1E',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#1D3238',
                marginBottom: 16,
              }}>
              <Sparkles size={13} color="#2F9E8F" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#2F9E8F' }}>
                Use Demo DHTE Admin Credentials
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleLogin} 
              disabled={isLoading}
              style={{ 
                backgroundColor: isAuthority ? '#2F9E8F' : '#E8A33D', 
                borderRadius: 12, 
                paddingVertical: 14, 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: 16,
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? (
                <ActivityIndicator color="#0F1B1E" size="small" />
              ) : (
                <>
                  <Text style={{ color: '#0F1B1E', fontSize: 15, fontWeight: '800', marginRight: 8 }}>
                    {isAuthority ? 'Access Oversight Console' : 'Sign In'}
                  </Text>
                  <ArrowRight size={18} color="#0F1B1E" />
                </>
              )}
            </TouchableOpacity>

            <View style={{ borderTopWidth: 1, borderTopColor: '#1D3238', paddingTop: 16, marginBottom: 16 }}>
              <TouchableOpacity 
                style={{
                  backgroundColor: '#1D3238',
                  borderWidth: 1,
                  borderColor: 'rgba(47, 158, 143, 0.3)',
                  borderRadius: 12,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={18} color="#2F9E8F" style={{ marginRight: 8 }} />
                <Text style={{ color: '#F2EFE9', fontSize: 13, fontWeight: '600' }}>Sign in with DigiLocker (SSO)</Text>
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: '#9BA8A6', fontSize: 13 }}>
                Don't have an account?{' '}
                <Text 
                  onPress={() => router.push('/(auth)/signup')} 
                  style={{ color: '#E8A33D', fontWeight: 'bold' }}
                >
                  Create Account
                </Text>
              </Text>
            </View>

          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}