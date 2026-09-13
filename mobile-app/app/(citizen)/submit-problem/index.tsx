import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight, ArrowLeft, Camera, MapPin, Sparkles, CheckCircle, UploadCloud, RefreshCw, Trash2, Navigation, Volume2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useProblemStore } from '../../../store/problemStore';
import { useToastStore } from '../../../store/toastStore';
import LeafletMap from '../../../components/LeafletMap';
import VoiceInputRecorder from '../../../components/VoiceInputRecorder';
import { reverseGeocodeCoords } from '../../../utils/geocoding';
import { useTheme } from '../../../context/ThemeContext';

export default function SubmitProblemScreen() {
  const router = useRouter();
  const { theme, isDarkMode } = useTheme();
  const { addProblem, isLoading } = useProblemStore() as any;
  const { showToast } = useToastStore();

  const [step, setStep] = useState(1);
  const [geocoding, setGeocoding] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState<string>('');
  const geocodeTimeoutRef = useRef<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    state: 'Jharkhand',
    district: 'Ranchi',
    block: 'Kanke',
    urgency: 'medium',
    category: 'Infrastructure & Safety',
    imageUploaded: false,
    images: [] as any[],
    previewUrls: [] as string[],
    audio: null as any,
    lat: 23.3441,
    lng: 85.3096,
  });

  const handleVoiceTranscription = (text: string, meta?: any) => {
    setFormData(prev => ({
      ...prev,
      title: prev.title || meta?.title || text.slice(0, 40),
      description: prev.description ? `${prev.description}\n\n${meta?.description || text}` : (meta?.description || text),
      category: meta?.category || prev.category,
      urgency: meta?.urgency || prev.urgency
    }));
  };

  const handleAudioAttached = (audioFile: any) => {
    setFormData(prev => ({ ...prev, audio: audioFile }));
  };

  useEffect(() => {
    // Initial reverse geocode on mount
    reverseGeocodeCoords(formData.lat, formData.lng).then(res => {
      setDetectedAddress(res.formattedAddress);
      if (res.district) {
        setFormData(prev => ({ ...prev, state: res.state, district: res.district, block: res.block }));
      }
    }).catch(() => {});

    return () => {
      if (geocodeTimeoutRef.current) {
        clearTimeout(geocodeTimeoutRef.current);
      }
    };
  }, []);

  const applyLocationUpdate = async (latitude: number, longitude: number) => {
    // Immediately update coordinates
    setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));

    // Debounce reverse geocoding slightly so rapid drag/tap events are smoothed
    if (geocodeTimeoutRef.current) {
      clearTimeout(geocodeTimeoutRef.current);
    }

    setGeocoding(true);
    geocodeTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await reverseGeocodeCoords(latitude, longitude);
        setFormData(prev => ({
          ...prev,
          state: res.state || prev.state,
          district: res.district || prev.district,
          block: res.block || prev.block,
        }));
        setDetectedAddress(res.formattedAddress);
      } catch (err) {
        console.warn('Geocoding error:', err);
      } finally {
        setGeocoding(false);
      }
    }, 350);
  };

  const handleNextToAI = () => {
    if (!formData.imageUploaded || formData.images.length === 0) {
      showToast("Uploading valid proof is required before continuing.", "error");
      return;
    }

    let newCategory = formData.category;
    let newUrgency = formData.urgency;

    if (formData.description.toLowerCase().includes('water') || formData.description.toLowerCase().includes('pump')) {
      newCategory = 'Renewable Energy & Water';
      newUrgency = 'urgent';
    } else if (formData.description.toLowerCase().includes('road') || formData.description.toLowerCase().includes('bridge')) {
      newCategory = 'Civil Infrastructure';
      newUrgency = 'high';
    }
    
    setFormData(prev => ({ ...prev, category: newCategory, urgency: newUrgency }));
    setStep(4);
  };

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permission to access location was denied', 'error');
        return;
      }

      setGeocoding(true);
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = location.coords;
      await applyLocationUpdate(latitude, longitude);
      showToast('Location and district updated!', 'success');
    } catch (error) {
      showToast('Failed to get location. Please enable GPS.', 'error');
      setGeocoding(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setFormData(prev => ({
          ...prev,
          imageUploaded: true,
          images: [asset],
          previewUrls: [asset.uri]
        }));
        showToast("Photo attached successfully!", "success");
      }
    } catch (error) {
      showToast("Error picking image.", "error");
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      imageUploaded: false,
      images: [],
      previewUrls: []
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      urgency: formData.urgency,
      location: { 
        state: formData.state, 
        district: formData.district, 
        block: formData.block, 
        lat: formData.lat, 
        lng: formData.lng,
        address: detectedAddress || `${formData.block}, ${formData.district}, ${formData.state}`
      },
      images: formData.images,
      audio: formData.audio,
    };
    
    const created = await addProblem(payload);
    
    if (created && !created.error) {
      showToast("Problem reported successfully!", "success");
      router.replace('/(citizen)/home');
    } else {
      showToast(created?.error || "Failed to submit problem. Please try again.", "error");
    }
  };

  // UI Helpers
  const inputStyle = { backgroundColor: theme.inputBg, borderRadius: 10, borderWidth: 1, borderColor: theme.inputBorder, paddingHorizontal: 12, paddingVertical: 12, color: theme.text, fontSize: 14 };
  const labelStyle = { color: theme.subtext, fontSize: 10, letterSpacing: 1, marginBottom: 6, fontWeight: '700' as const, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          
          {/* Header */}
          <View style={{ marginBottom: 24, borderBottomWidth: 1, borderBottomColor: theme.border, paddingBottom: 16 }}>
            <Text style={{ fontSize: 10, color: theme.citizenPrimary, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}>
              PHASE 3 • STEP {step} OF 5
            </Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text, marginBottom: 12 }}>Report Civic Problem</Text>
            
            {/* Progress Bar */}
            <View style={{ flexDirection: 'row', height: 4, gap: 4 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={{ flex: 1, backgroundColor: i <= step ? theme.citizenPrimary : theme.border, borderRadius: 2 }} />
              ))}
            </View>
          </View>

          <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: theme.border }}>
            
            {/* STEP 1 */}
            {step === 1 && (
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 16 }}>1. Issue Information</Text>
                
                {/* Voice Input & Speech Dictation Assist */}
                <VoiceInputRecorder 
                  onTranscriptionComplete={handleVoiceTranscription}
                  onAudioAttached={handleAudioAttached}
                  existingDescription={formData.description}
                />

                <View style={{ marginBottom: 16 }}>
                  <Text style={labelStyle}>PROBLEM TITLE *</Text>
                  <TextInput
                    value={formData.title}
                    onChangeText={t => setFormData({ ...formData, title: t })}
                    placeholder="e.g., Damaged Solar Water Pump"
                    placeholderTextColor={theme.subtext}
                    style={inputStyle}
                  />
                </View>

                <View style={{ marginBottom: 24 }}>
                  <Text style={labelStyle}>DETAILED DESCRIPTION</Text>
                  <TextInput
                    value={formData.description}
                    onChangeText={t => setFormData({ ...formData, description: t })}
                    placeholder="Describe the issue in detail..."
                    placeholderTextColor={theme.subtext}
                    multiline
                    numberOfLines={4}
                    style={[inputStyle, { minHeight: 100, textAlignVertical: 'top' }]}
                  />
                </View>

                <TouchableOpacity 
                  onPress={() => {
                    if (!formData.title.trim()) {
                      showToast("Please provide a title.", "error");
                      return;
                    }
                    setStep(2);
                  }}
                  style={{ backgroundColor: theme.citizenPrimary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800', marginRight: 8 }}>Continue to Location</Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 16 }}>2. Pin Location (OpenStreetMap)</Text>
                
                <View style={{ gap: 12, marginBottom: 16 }}>
                  {/* Row 1: State & District */}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={labelStyle}>STATE</Text>
                        {geocoding && <ActivityIndicator size="small" color="#2F9E8F" style={{ transform: [{ scale: 0.7 }] }} />}
                      </View>
                      <TextInput 
                        value={formData.state} 
                        onChangeText={t => setFormData({ ...formData, state: t })} 
                        style={inputStyle} 
                        placeholder="e.g. Jharkhand, Bihar, WB"
                        placeholderTextColor="#9BA8A6" 
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={labelStyle}>DISTRICT</Text>
                      </View>
                      <TextInput 
                        value={formData.district} 
                        onChangeText={t => setFormData({ ...formData, district: t })} 
                        style={inputStyle} 
                        placeholder="e.g. Ranchi, Patna, Kolkata"
                        placeholderTextColor="#9BA8A6" 
                      />
                    </View>
                  </View>

                  {/* Row 2: Block / Locality */}
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={labelStyle}>BLOCK / LOCALITY</Text>
                      {geocoding && <Text style={{ color: '#2F9E8F', fontSize: 9 }}>Detecting across India...</Text>}
                    </View>
                    <TextInput 
                      value={formData.block} 
                      onChangeText={t => setFormData({ ...formData, block: t })} 
                      style={inputStyle} 
                      placeholder="e.g. Kanke, Salt Lake, Bandra..."
                      placeholderTextColor="#9BA8A6" 
                    />
                  </View>
                </View>

                {/* Leaflet OpenStreetMap Interactive Selector */}
                <View style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ color: '#E8A33D', fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>
                      LEAFLET OPENSTREETMAP POINTER
                    </Text>
                    <TouchableOpacity 
                      onPress={handleGetLocation} 
                      disabled={geocoding}
                      style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        gap: 4, 
                        backgroundColor: '#2F9E8F', 
                        paddingHorizontal: 10, 
                        paddingVertical: 5, 
                        borderRadius: 8 
                      }}
                    >
                      {geocoding ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <MapPin size={12} color="#FFFFFF" />
                      )}
                      <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>GPS Location</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
                    <LeafletMap
                      mode="picker"
                      selectedLatitude={formData.lat}
                      selectedLongitude={formData.lng}
                      onLocationChange={(lat, lng) => {
                        applyLocationUpdate(lat, lng);
                      }}
                      height={240}
                      isDarkMode={isDarkMode}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <Text style={{ color: theme.subtext, fontSize: 11, flex: 1, marginRight: 8 }} numberOfLines={1}>
                      {geocoding ? '🔄 Resolving state, district & block...' : (detectedAddress ? `📍 ${formData.block}, ${formData.district}, ${formData.state}` : '📍 Tap map or drag pin to adjust exact spot')}
                    </Text>
                    <View style={{ backgroundColor: 'rgba(47, 158, 143, 0.15)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                      <Text style={{ color: theme.authorityPrimary, fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '700' }}>
                        {formData.lat.toFixed(5)}, {formData.lng.toFixed(5)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => setStep(1)} style={{ flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={16} color={theme.text} style={{ marginRight: 8 }} />
                    <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setStep(3)} style={{ flex: 1, backgroundColor: theme.citizenPrimary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginRight: 8 }}>Media</Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>3. Upload Photos</Text>
                  {formData.imageUploaded && (
                    <View style={{ backgroundColor: 'rgba(47, 158, 143, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                      <CheckCircle size={12} color={theme.authorityPrimary} style={{ marginRight: 4 }} />
                      <Text style={{ color: theme.authorityPrimary, fontSize: 10, fontWeight: '700' }}>Ready</Text>
                    </View>
                  )}
                </View>

                {formData.imageUploaded && formData.previewUrls.length > 0 ? (
                  <View style={{ backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 16, marginBottom: 24 }}>
                    <Image source={{ uri: formData.previewUrls[0] }} style={{ width: '100%', height: 200, borderRadius: 12, marginBottom: 16 }} resizeMode="cover" />
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 16 }}>
                      <View>
                        <Text style={{ color: theme.authorityPrimary, fontSize: 12, fontWeight: 'bold' }}>Photo Attached</Text>
                        <Text style={{ color: theme.subtext, fontSize: 10 }}>Ready for submission</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity onPress={handlePickImage} style={{ backgroundColor: theme.surfaceHover, padding: 8, borderRadius: 8 }}>
                          <RefreshCw size={16} color={theme.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleRemovePhoto} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 8, borderRadius: 8 }}>
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity onPress={handlePickImage} style={{ padding: 32, borderWidth: 2, borderColor: theme.border, borderStyle: 'dashed', borderRadius: 16, backgroundColor: theme.surface, alignItems: 'center', marginBottom: 24 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Camera size={28} color={theme.citizenPrimary} />
                    </View>
                    <Text style={{ color: theme.text, fontSize: 15, fontWeight: '600', marginBottom: 4 }}>Tap to select photo</Text>
                    <Text style={{ color: theme.subtext, fontSize: 11 }}>Supports JPG, PNG</Text>
                  </TouchableOpacity>
                )}

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => setStep(2)} style={{ flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={16} color={theme.text} style={{ marginRight: 8 }} />
                    <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleNextToAI} style={{ flex: 1, backgroundColor: theme.citizenPrimary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {formData.imageUploaded ? (
                      <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginRight: 8 }}>Submit</Text>
                    ) : (
                      <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800', marginRight: 8 }}>AI Engine</Text>
                    )}
                    {formData.imageUploaded ? <ArrowRight size={16} color="#FFFFFF" /> : <Sparkles size={16} color="#FFFFFF" />}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 4 */}
            {step === 4 && (
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <Sparkles size={20} color={theme.authorityPrimary} style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.authorityPrimary }}>4. AI Analysis & Routing</Text>
                </View>

                <View style={{ backgroundColor: theme.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 24, gap: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.subtext, fontSize: 12 }}>Detected Category:</Text>
                    <Text style={{ color: theme.citizenPrimary, fontSize: 12, fontWeight: 'bold' }}>{formData.category}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.subtext, fontSize: 12 }}>Calculated Urgency:</Text>
                    <Text style={{ color: theme.authorityPrimary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>{formData.urgency}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.subtext, fontSize: 12 }}>Suggested Match HEIs:</Text>
                    <Text style={{ color: theme.text, fontSize: 12, fontWeight: 'bold' }}>BIT Sindri, Ranchi University</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => setStep(3)} style={{ flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={16} color={theme.text} style={{ marginRight: 8 }} />
                    <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setStep(5)} style={{ flex: 1, backgroundColor: theme.citizenPrimary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginRight: 8 }}>Review</Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* STEP 5 */}
            {step === 5 && (
              <View>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 16 }}>5. Review Your Report</Text>
                
                <View style={{ backgroundColor: theme.surface, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.border, marginBottom: 24, gap: 12 }}>
                  <Text style={{ color: theme.text, fontSize: 13 }}><Text style={{ color: theme.subtext }}>Title:</Text> {formData.title}</Text>
                  <Text style={{ color: theme.text, fontSize: 13 }}><Text style={{ color: theme.subtext }}>Description:</Text> {formData.description}</Text>
                  <Text style={{ color: theme.text, fontSize: 13 }}><Text style={{ color: theme.subtext }}>Location:</Text> {formData.block}, {formData.district}, {formData.state}</Text>
                  <Text style={{ color: theme.text, fontSize: 13 }}><Text style={{ color: theme.subtext }}>Category:</Text> {formData.category}</Text>

                  {formData.previewUrls.length > 0 && (
                    <View style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12, marginTop: 4, flexDirection: 'row', alignItems: 'center' }}>
                      <Image source={{ uri: formData.previewUrls[0] }} style={{ width: 48, height: 48, borderRadius: 8, borderWidth: 1, borderColor: theme.border, marginRight: 12 }} />
                      <View>
                        <Text style={{ color: theme.authorityPrimary, fontSize: 12, fontWeight: 'bold' }}>Photo Evidence Attached</Text>
                        <Text style={{ color: theme.subtext, fontSize: 10 }}>Ready for submission</Text>
                      </View>
                    </View>
                  )}

                  {formData.audio && (
                    <View style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12, marginTop: 4, flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(47, 158, 143, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <Volume2 size={18} color={theme.authorityPrimary} />
                      </View>
                      <View>
                        <Text style={{ color: theme.authorityPrimary, fontSize: 12, fontWeight: 'bold' }}>Voice Note Attached</Text>
                        <Text style={{ color: theme.subtext, fontSize: 10 }}>Audio proof forwarded to municipal engineers</Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity onPress={() => setStep(4)} style={{ flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowLeft size={16} color={theme.text} style={{ marginRight: 8 }} />
                    <Text style={{ color: theme.text, fontSize: 14, fontWeight: '600' }}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSubmit} disabled={isLoading} style={{ flex: 1, backgroundColor: theme.citizenPrimary, borderRadius: 12, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 0.7 : 1 }}>
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '800', marginRight: 8 }}>Submit</Text>
                        <CheckCircle size={16} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}