import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, GraduationCap, Building2, ShieldAlert, ArrowRight, Check } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';

export default function SignupScreen() {
  const router = useRouter();
  const { signup, isLoading, error } = useAuthStore();
  const { showToast } = useToastStore();

  const [role, setRole] = useState<'citizen' | 'university' | 'industry'>('citizen');
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    address: '',
    city: '',
    state: 'Jharkhand',
    district: '',
    pinCode: '',
    password: '',
    confirmPassword: '',
    orgName: '',
    regId: '',
    consent: false,
  });

  const getPrimaryColor = () => {
    if (role === 'citizen') return '#E8A33D';
    if (role === 'university') return '#2F9E8F';
    return '#E8A33D';
  };
  
  const primaryColor = getPrimaryColor();

  const updateField = (field: string, value: any) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    if (!/^\d{6}$/.test(formData.pinCode)) {
      showToast("Enter a valid 6-digit PIN code.", "error");
      return;
    }

    let dbRole = role as string;
    if (role === "university") dbRole = "hei";
    if (role === "industry") dbRole = "industry_csr";

    const payload = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      role: dbRole,
      institutionName: role === "university" ? formData.orgName : "",
      companyName: role === "industry" ? formData.orgName : "",
    };

    const success = await signup(payload);

    if (success) {
      showToast("Account created successfully!", "success");

      if (role === "citizen") {
        router.replace("/(citizen)/home");
      } else if (role === "university") {
        router.replace("/(hei)/home" as any);
      } else {
        router.replace("/(industry)/home" as any);
      }
    } else {
      const errorMessage = useAuthStore.getState().error || "Registration failed. Please try again.";
      showToast(errorMessage, "error");
    }
  };

  const goToNextStep = () => {
    if (step === 1 && (!formData.firstName || !formData.lastName || !formData.email || !formData.phone)) {
      showToast("Complete your name, email, and phone number first.", "error");
      return;
    }
    if (step === 2 && (!formData.dateOfBirth || !formData.address || !formData.city || !formData.district || !formData.pinCode)) {
      showToast("Complete your date of birth and address details first.", "error");
      return;
    }
    if (step === 2 && !formData.consent) {
      showToast("Please accept the privacy notice before continuing.", "error");
      return;
    }
    if (step < 3) setStep((current) => current + 1);
  };

  const goToPreviousStep = () => setStep((current) => Math.max(1, current - 1));

  // Reusable Styles
  const labelStyle = { color: '#9BA8A6', fontSize: 10, letterSpacing: 1, marginBottom: 4, fontWeight: '700' as const, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' };
  const inputStyle = { backgroundColor: '#0F1B1E', borderRadius: 10, borderWidth: 1, borderColor: '#1D3238', paddingHorizontal: 12, paddingVertical: 12, color: '#F2EFE9', fontSize: 14 };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F1B1E' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
          
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: '#F2EFE9', marginBottom: 6 }}>Create Account</Text>
            <Text style={{ fontSize: 13, color: '#9BA8A6', textAlign: 'center' }}>Create your civic profile to connect with institutions and industry.</Text>
          </View>

          {error ? (
            <View style={{ backgroundColor: 'rgba(127, 29, 29, 0.3)', borderColor: 'rgba(239, 68, 68, 0.5)', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <Text style={{ color: '#F87171', fontSize: 12, textAlign: 'center' }}>{error}</Text>
            </View>
          ) : null}

          {/* Role Selection Tabs */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            {[
              { id: 'citizen', label: 'Citizen', icon: Users, color: '#E8A33D' },
              { id: 'university', label: 'University', icon: GraduationCap, color: '#2F9E8F' },
              { id: 'industry', label: 'Industry', icon: Building2, color: '#E8A33D' }
            ].map((tab) => {
              const isActive = role === tab.id;
              const Icon = tab.icon;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => { setRole(tab.id as any); setStep(1); }}
                  style={{
                    flex: 1,
                    marginHorizontal: 4,
                    paddingVertical: 12,
                    backgroundColor: isActive ? '#1D3238' : '#0F1B1E',
                    borderWidth: 1,
                    borderColor: isActive ? tab.color : '#1D3238',
                    borderRadius: 12,
                    alignItems: 'center'
                  }}
                >
                  <Icon size={20} color={isActive ? tab.color : '#9BA8A6'} style={{ marginBottom: 6 }} />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: isActive ? tab.color : '#9BA8A6' }}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {role !== 'citizen' && (
            <View style={{ backgroundColor: '#1D3238', borderColor: 'rgba(47, 158, 143, 0.4)', borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', marginBottom: 16 }}>
              <ShieldAlert size={16} color="#2F9E8F" style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={{ flex: 1, color: '#9BA8A6', fontSize: 11, lineHeight: 16 }}>
                Institutional accounts require verification by DHTE Administrators prior to claiming or funding projects.
              </Text>
            </View>
          )}

          {/* Progress Indicator */}
          <View style={{ flexDirection: 'row', marginBottom: 20 }}>
            {['Basic details', 'Profile & location', 'Security'].map((label, index) => {
              const isActive = step >= index + 1;
              const isCurrent = step === index + 1;
              return (
                <View key={label} style={{ flex: 1, marginHorizontal: 2 }}>
                  <View style={{ height: 4, backgroundColor: isActive ? '#E8A33D' : '#1D3238', borderRadius: 2, marginBottom: 6 }} />
                  <Text style={{ fontSize: 9, color: isCurrent ? '#E8A33D' : '#9BA8A6', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
                    {index + 1}. {label}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={{ backgroundColor: '#16262A', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#1D3238' }}>
            
            {step === 1 && (
              <>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F2EFE9' }}>Basic details</Text>
                  <Text style={{ fontSize: 12, color: '#9BA8A6', marginTop: 4 }}>Tell us how we should identify and contact you.</Text>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 12, gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={labelStyle}>FIRST NAME</Text>
                    <TextInput style={inputStyle} value={formData.firstName} onChangeText={t => updateField('firstName', t)} placeholder="First Name" placeholderTextColor="#9BA8A6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={labelStyle}>LAST NAME</Text>
                    <TextInput style={inputStyle} value={formData.lastName} onChangeText={t => updateField('lastName', t)} placeholder="Last Name" placeholderTextColor="#9BA8A6" />
                  </View>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={labelStyle}>EMAIL ADDRESS</Text>
                  <TextInput style={inputStyle} value={formData.email} onChangeText={t => updateField('email', t)} placeholder="Email Address" placeholderTextColor="#9BA8A6" keyboardType="email-address" autoCapitalize="none" />
                </View>

                <View style={{ marginBottom: 20 }}>
                  <Text style={labelStyle}>PHONE NUMBER</Text>
                  <TextInput style={inputStyle} value={formData.phone} onChangeText={t => updateField('phone', t)} placeholder="Phone Number" placeholderTextColor="#9BA8A6" keyboardType="phone-pad" />
                </View>
              </>
            )}

            {step === 2 && (
              <>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F2EFE9' }}>Profile & location</Text>
                  <Text style={{ fontSize: 12, color: '#9BA8A6', marginTop: 4 }}>Add your demographic and address details.</Text>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 12, gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={labelStyle}>DATE OF BIRTH</Text>
                    <TextInput style={inputStyle} value={formData.dateOfBirth} onChangeText={t => updateField('dateOfBirth', t)} placeholder="YYYY-MM-DD" placeholderTextColor="#9BA8A6" />
                  </View>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={labelStyle}>GENDER</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {['Female', 'Male', 'Other'].map(g => (
                      <TouchableOpacity key={g} onPress={() => updateField('gender', g)} style={{ flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: formData.gender === g ? primaryColor : '#1D3238', borderRadius: 8, alignItems: 'center', backgroundColor: formData.gender === g ? 'rgba(232, 163, 61, 0.1)' : '#0F1B1E' }}>
                        <Text style={{ color: formData.gender === g ? primaryColor : '#9BA8A6', fontSize: 12, fontWeight: '600' }}>{g}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={labelStyle}>ADDRESS</Text>
                  <TextInput style={[inputStyle, { minHeight: 60, textAlignVertical: 'top' }]} value={formData.address} onChangeText={t => updateField('address', t)} placeholder="House number, street, village or ward" placeholderTextColor="#9BA8A6" multiline />
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 12, gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={labelStyle}>CITY / TOWN</Text>
                    <TextInput style={inputStyle} value={formData.city} onChangeText={t => updateField('city', t)} placeholder="City" placeholderTextColor="#9BA8A6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={labelStyle}>DISTRICT</Text>
                    <TextInput style={inputStyle} value={formData.district} onChangeText={t => updateField('district', t)} placeholder="District" placeholderTextColor="#9BA8A6" />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 16, gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={labelStyle}>STATE</Text>
                    <TextInput style={inputStyle} value={formData.state} onChangeText={t => updateField('state', t)} placeholder="State" placeholderTextColor="#9BA8A6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={labelStyle}>PIN CODE</Text>
                    <TextInput style={inputStyle} value={formData.pinCode} onChangeText={t => updateField('pinCode', t)} placeholder="PIN Code" placeholderTextColor="#9BA8A6" keyboardType="numeric" maxLength={6} />
                  </View>
                </View>

                {role !== 'citizen' && (
                  <>
                    <View style={{ marginBottom: 12 }}>
                      <Text style={labelStyle}>ORGANISATION NAME</Text>
                      <TextInput style={inputStyle} value={formData.orgName} onChangeText={t => updateField('orgName', t)} placeholder="Organisation Name" placeholderTextColor="#9BA8A6" />
                    </View>
                    <View style={{ marginBottom: 16 }}>
                      <Text style={labelStyle}>REGISTRATION ID (AISHE / CIN)</Text>
                      <TextInput style={inputStyle} value={formData.regId} onChangeText={t => updateField('regId', t)} placeholder="Registration Number" placeholderTextColor="#9BA8A6" />
                    </View>
                  </>
                )}

                <TouchableOpacity onPress={() => updateField('consent', !formData.consent)} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
                  <View style={{ width: 20, height: 20, borderRadius: 6, borderWidth: 1, borderColor: formData.consent ? primaryColor : '#9BA8A6', backgroundColor: formData.consent ? primaryColor : 'transparent', alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2 }}>
                    {formData.consent && <Check size={14} color="#0F1B1E" />}
                  </View>
                  <Text style={{ flex: 1, color: '#9BA8A6', fontSize: 11, lineHeight: 16 }}>
                    We'll use your submission and location to route your problem. We never sell your data (DPDP Act Compliant).
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {step === 3 && (
              <>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F2EFE9' }}>Secure your account</Text>
                  <Text style={{ fontSize: 12, color: '#9BA8A6', marginTop: 4 }}>Create a password to finish your registration.</Text>
                </View>

                <View style={{ marginBottom: 12 }}>
                  <Text style={labelStyle}>CREATE PASSWORD</Text>
                  <TextInput style={inputStyle} value={formData.password} onChangeText={t => updateField('password', t)} placeholder="Password" placeholderTextColor="#9BA8A6" secureTextEntry />
                </View>
                <View style={{ marginBottom: 24 }}>
                  <Text style={labelStyle}>CONFIRM PASSWORD</Text>
                  <TextInput style={inputStyle} value={formData.confirmPassword} onChangeText={t => updateField('confirmPassword', t)} placeholder="Confirm Password" placeholderTextColor="#9BA8A6" secureTextEntry />
                </View>
              </>
            )}

            {/* Navigation Buttons */}
            {step === 3 ? (
              <TouchableOpacity onPress={handleSignup} disabled={isLoading} style={{ backgroundColor: primaryColor, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 0.7 : 1, marginBottom: 12 }}>
                {isLoading ? (
                  <ActivityIndicator color="#0F1B1E" size="small" />
                ) : (
                  <>
                    <Text style={{ color: '#0F1B1E', fontSize: 15, fontWeight: '800', marginRight: 8 }}>Complete Registration</Text>
                    <ArrowRight size={18} color="#0F1B1E" />
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={goToNextStep} style={{ backgroundColor: primaryColor, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Text style={{ color: '#0F1B1E', fontSize: 15, fontWeight: '800', marginRight: 8 }}>
                  Continue to {step === 1 ? 'Profile & location' : 'Security'}
                </Text>
                <ArrowRight size={18} color="#0F1B1E" />
              </TouchableOpacity>
            )}

            {step > 1 && (
              <TouchableOpacity onPress={goToPreviousStep} style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#1D3238', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#F2EFE9', fontSize: 14, fontWeight: '600' }}>
                  Back to {step === 3 ? 'Profile & location' : 'Basic details'}
                </Text>
              </TouchableOpacity>
            )}

            {step === 1 && (
              <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ marginTop: 16, alignItems: 'center' }}>
                <Text style={{ color: '#9BA8A6', fontSize: 13 }}>
                  Already registered? <Text style={{ color: primaryColor, fontWeight: 'bold' }}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}