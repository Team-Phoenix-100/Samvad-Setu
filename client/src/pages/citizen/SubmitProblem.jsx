import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Sparkles, CheckCircle, ArrowRight, ArrowLeft, Crop, RefreshCw, Trash2, UploadCloud, Eye, Mic, Square, Radio } from 'lucide-react';
import { useProblemStore } from '../../store/problemStore';
import { useToastStore } from '../../store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import getCroppedImg, { compressImage } from '../../utils/cropImage';
import Button from '../../components/ui/Button';

function LocationSelector({ onSelect }) {
  const map = useMap();

  useMapEvents({
    click: (event) => {
      map.setView(event.latlng, map.getZoom());
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function LocationViewport({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);

  return null;
}

export default function SubmitProblem() {
  const navigate = useNavigate();
  const { addProblem, isLoading } = useProblemStore();
  const { showToast } = useToastStore();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioFile, setAudioFile] = useState(null);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Cropper states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [rawFile, setRawFile] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [aspect, setAspect] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    district: 'Ranchi',
    block: 'Kanke',
    urgency: 'medium',
    category: 'Infrastructure & Safety',
    imageUploaded: false,
    images: [],
    previewUrls: [],
    lat: 23.3441,
    lng: 85.3096,
  });

  // Simulated AI Engine Auto-Classification (Section 3.6)
  const handleNextToAI = () => {
    if (!formData.imageUploaded || formData.images.length === 0) {
      showToast("Uploading valid proof is required before continuing.", "error");
      return;
    }

    // Basic heuristic to demonstrate dynamic AI suggestions
    if (formData.description.toLowerCase().includes('water') || formData.description.toLowerCase().includes('pump')) {
      setFormData(prev => ({ ...prev, category: 'Renewable Energy & Water', urgency: 'urgent' }));
    } else if (formData.description.toLowerCase().includes('road') || formData.description.toLowerCase().includes('bridge')) {
      setFormData(prev => ({ ...prev, category: 'Civil Infrastructure', urgency: 'high' }));
    }
    setStep(4);
  };

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      showToast("Voice recording is not supported in this browser.", "error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioFile(new File([blob], 'citizen-voice-note.webm', { type: blob.type }));
        stream.getTracks().forEach((track) => track.stop());
        setRecordingSeconds(0);
        showToast("Voice note attached for transcription.", "success");
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      const startedAt = Date.now();
      const timer = window.setInterval(() => {
        setRecordingSeconds(Math.floor((Date.now() - startedAt) / 1000));
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') window.clearInterval(timer);
      }, 250);
    } catch {
      showToast("Microphone permission is required to record a voice note.", "error");
    }
  };

  const updateLocationDetails = async (lat, lng) => {
    setFormData(prev => ({ ...prev, lat, lng }));
    setIsResolvingLocation(true);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
      if (!response.ok) throw new Error('Reverse geocoding failed');
      const data = await response.json();
      const address = data.address || {};
      setFormData(prev => ({
        ...prev,
        district: address.state_district || address.county || address.city_district || prev.district,
        block: address.suburb || address.town || address.village || address.city || address.municipality || prev.block,
      }));
    } catch (error) {
      console.error('Could not resolve selected location:', error);
      showToast("Location selected, but district details could not be found. You can enter them manually.", "warning");
    } finally {
      setIsResolvingLocation(false);
    }
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await updateLocationDetails(latitude, longitude);
          showToast("Location updated successfully", "success");
        },
        () => showToast("Failed to get location. Please enable GPS.", "error")
      );
    } else {
      showToast("Geolocation not supported by this browser.", "error");
    }
  };

  // Direct photo processor with automatic client-side compression
  const processImageFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please upload a valid image file (JPG, PNG, or WebP).", "error");
      return;
    }

    setIsProcessingImage(true);
    try {
      // Compress client-side to ensure small file size, fast upload, and compatibility
      const compressedFile = await compressImage(file);
      const previewUrl = URL.createObjectURL(compressedFile);

      setRawFile(file);
      setImageToCrop(previewUrl);
      setFormData(prev => ({
        ...prev,
        imageUploaded: true,
        images: [compressedFile],
        previewUrls: [previewUrl]
      }));

      showToast("Photo uploaded successfully! You can optionally crop or adjust it.", "success");
    } catch (error) {
      console.error("Error processing photo:", error);
      // Fallback directly to original file if compression has any issue
      const fallbackUrl = URL.createObjectURL(file);
      setRawFile(file);
      setImageToCrop(fallbackUrl);
      setFormData(prev => ({
        ...prev,
        imageUploaded: true,
        images: [file],
        previewUrls: [fallbackUrl]
      }));
      showToast("Photo uploaded (original format).", "success");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    // Clear input value so selecting the same file triggers onChange
    if (e.target) {
      e.target.value = '';
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({
      ...prev,
      imageUploaded: false,
      images: [],
      previewUrls: []
    }));
    setImageToCrop(null);
    setRawFile(null);
    showToast("Photo removed.", "info");
  };

  const onCropComplete = (croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop) return;
    try {
      const croppedImageFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedImageFile);
      setFormData(prev => ({
        ...prev,
        imageUploaded: true,
        images: [croppedImageFile],
        previewUrls: [previewUrl]
      }));
      setCropModalOpen(false);
      showToast("Image cropped successfully!", "success");
    } catch (e) {
      console.error("Crop error:", e);
      showToast("Could not crop image. Keeping current photo.", "warning");
      setCropModalOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      showToast("Please enter a problem title.", "error");
      setStep(1);
      return;
    }

    if (!formData.imageUploaded || formData.images.length === 0) {
      showToast("Please provide photo proof before submitting.", "error");
      setStep(3);
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      urgency: formData.urgency,
      location: { district: formData.district, block: formData.block, lat: formData.lat, lng: formData.lng },
      images: formData.images,
      audio: audioFile,
    };
    
    const created = await addProblem(payload);
    
    if (created && !created.error) {
      showToast("Problem reported successfully!", "success");
      navigate(`/problem/${created.id || created._id}`);
    } else {
      showToast(created?.error || "Failed to submit problem. Please try again.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1B1E] text-[#F2EFE9] p-4 sm:p-6 max-w-2xl mx-auto space-y-6">
      {/* Hidden file input controlled via ref to prevent label click bubbling */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileInputChange}
      />

      {/* Step Indicator Header */}
      <div className="space-y-2 border-b border-[#1D3238] pb-4">
        <span className="text-xs font-mono text-[#E8A33D] uppercase">Phase 3 • Step {step} of 5</span>
        <h1 className="text-2xl font-bold font-display">Report a Civic Problem</h1>
        <div className="flex gap-1 h-1.5 w-full bg-[#16262A] rounded-full overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-full flex-1 transition-all duration-300 ${
                i <= step ? 'bg-[#E8A33D]' : 'bg-[#1D3238]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="bg-[#16262A] p-5 sm:p-6 rounded-xl border border-[#1D3238] space-y-4">
          <h2 className="text-lg font-bold font-display">1. Issue Information</h2>
          <div className="space-y-1">
            <label className="text-xs font-mono text-[#9BA8A6]">Problem Title *</label>
            <input
              type="text"
              required
              placeholder="e.g., Damaged Solar Water Pump"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg p-3 text-sm focus:outline-none focus:border-[#E8A33D]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-[#9BA8A6]">Detailed Description</label>
            <textarea
              rows={4}
              placeholder="Describe the issue, how long it has been present, and who is affected..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg p-3 text-sm focus:outline-none focus:border-[#E8A33D]"
            />
          </div>

          <Button
            variant="primary"
            className="w-full py-2.5 cursor-pointer"
            onClick={() => {
              if (!formData.title.trim()) {
                showToast("Please provide a title for the issue.", "error");
                return;
              }
              setStep(2);
            }}
          >
            Continue to Location <ArrowRight size={16} />
          </Button>
        </motion.div>
      )}

      {/* STEP 2: Location Selector */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="bg-[#16262A] p-5 sm:p-6 rounded-xl border border-[#1D3238] space-y-4">
          <h2 className="text-lg font-bold font-display">2. Pin Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#9BA8A6]">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg p-3 text-sm focus:outline-none focus:border-[#E8A33D]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#9BA8A6]">Block / Locality</label>
              <input
                type="text"
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg p-3 text-sm focus:outline-none focus:border-[#E8A33D]"
              />
            </div>
          </div>

          <div className="p-6 border border-dashed border-[#1D3238] rounded-lg bg-[#0F1B1E] text-center space-y-3">
            <MapPin className="mx-auto text-[#E8A33D]" size={32} />
            <p className="text-xs text-[#9BA8A6]">Click the map or drag the marker to choose the problem location.</p>
            <div className="h-52 overflow-hidden rounded-lg border border-[#1D3238] text-left">
              <MapContainer
                center={[formData.lat, formData.lng]}
                zoom={13}
                scrollWheelZoom={false}
                className="h-full w-full"
              >
                <LocationViewport lat={formData.lat} lng={formData.lng} />
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationSelector onSelect={updateLocationDetails} />
                <CircleMarker
                  center={[formData.lat, formData.lng]}
                  radius={10}
                  pathOptions={{ color: '#E8A33D', fillColor: '#E8A33D', fillOpacity: 0.85 }}
                />
              </MapContainer>
            </div>
            <span className="block text-xs font-mono text-[#2F9E8F] bg-[#2F9E8F]/10 px-2 py-1 rounded w-max mx-auto mb-2">
              GPS Lat: {formData.lat.toFixed(4)}, Lng: {formData.lng.toFixed(4)}
            </span>
            {isResolvingLocation && <p className="text-xs text-[#E8A33D]">Finding district and locality...</p>}
            <Button variant="outline" className="text-xs cursor-pointer" onClick={handleGetLocation}>
              Use Current Location
            </Button>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="w-full cursor-pointer" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button variant="primary" className="w-full cursor-pointer" onClick={() => setStep(3)}>
              Continue to Media <ArrowRight size={16} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Media Upload with Drag-and-Drop & Optional Cropping */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="bg-[#16262A] p-5 sm:p-6 rounded-xl border border-[#1D3238] space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold font-display">3. Upload Photos / Evidence</h2>
            {formData.imageUploaded && (
              <span className="text-xs font-mono text-[#2F9E8F] bg-[#2F9E8F]/15 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle size={12} /> Ready
              </span>
            )}
          </div>

          {formData.imageUploaded && formData.previewUrls.length > 0 ? (
            /* Uploaded Photo Card with Optional Crop & Controls */
            <div className="bg-[#0F1B1E] border border-[#1D3238] rounded-xl p-4 space-y-4">
              <div className="relative group overflow-hidden rounded-lg border border-[#1D3238] bg-black/40 flex items-center justify-center h-48 sm:h-56">
                <img
                  src={formData.previewUrls[0]}
                  alt="Problem Proof"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(true)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-medium text-xs backdrop-blur-xs cursor-pointer"
                >
                  <Eye size={16} /> Click to View Full Size
                </button>
              </div>

              {/* Photo Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1D3238]">
                <div className="text-xs text-[#9BA8A6]">
                  <span className="text-[#2F9E8F] font-semibold">Photo Attached</span> • Ready for submission
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCropModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1D3238] hover:bg-[#E8A33D] hover:text-[#0F1B1E] text-[#F2EFE9] rounded-lg transition-colors cursor-pointer"
                    title="Crop or adjust framing"
                  >
                    <Crop size={14} /> Crop / Adjust
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1D3238] hover:bg-[#2F9E8F] hover:text-white text-[#F2EFE9] rounded-lg transition-colors cursor-pointer"
                    title="Select a different photo"
                  >
                    <RefreshCw size={14} /> Change
                  </button>

                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Remove photo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Drag and Drop Zone */
            <div
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 sm:p-10 border-2 border-dashed rounded-xl text-center space-y-3 cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-[#E8A33D] bg-[#E8A33D]/10 scale-[1.01]'
                  : 'border-[#1D3238] hover:border-[#E8A33D] bg-[#0F1B1E]'
              }`}
            >
              {isProcessingImage ? (
                <div className="space-y-2 py-4">
                  <div className="w-8 h-8 border-2 border-[#E8A33D] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-[#E8A33D]">Optimizing photo for submission...</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-full bg-[#16262A] border border-[#1D3238] flex items-center justify-center mx-auto text-[#E8A33D]">
                    {isDragging ? <UploadCloud size={30} /> : <Camera size={28} />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#F2EFE9]">
                      {isDragging ? 'Drop your photo here' : 'Click to browse or drag and drop photo'}
                    </p>
                    <p className="text-xs text-[#9BA8A6]">
                      Supports JPG, PNG, WebP • Auto-optimized for all laptops
                    </p>
                  </div>
                  <span className="inline-block text-[11px] font-mono text-[#2F9E8F] bg-[#2F9E8F]/10 px-2 py-1 rounded">
                    Cropping is optional after selection
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="w-full cursor-pointer" onClick={() => setStep(2)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button
              variant="primary"
              className="w-full cursor-pointer"
              onClick={handleNextToAI}
            >
              {formData.imageUploaded && formData.images.length > 0 ? (
                <>Submit <ArrowRight size={16} /></>
              ) : (
                <>Run AI Engine Check <Sparkles size={16} /></>
              )}
            </Button>
          </div>

          <div className="border-t border-[#1D3238] pt-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold flex items-center gap-2"><Mic size={16} className="text-[#2F9E8F]" /> Add a voice note</p>
                <p className="text-xs text-[#9BA8A6]">Whisper transcription will enrich the triage brief.</p>
              </div>
              <button type="button" onClick={toggleVoiceRecording} className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${isRecording ? 'bg-[#C1443B] text-white' : 'bg-[#2F9E8F] text-[#0F1B1E]'}`}>
                {isRecording ? <Square size={14} /> : <Mic size={14} />}
                {isRecording ? `Stop ${recordingSeconds}s` : audioFile ? 'Record again' : 'Record voice'}
              </button>
            </div>
            {audioFile && !isRecording && <p className="text-xs text-[#2F9E8F] flex items-center gap-2"><CheckCircle size={13} /> Voice note ready: {audioFile.name}</p>}
          </div>
        </motion.div>
      )}

      {/* STEP 4: AI Classification Preview */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="bg-[#16262A] p-5 sm:p-6 rounded-xl border border-[#2F9E8F] space-y-4">
          <div className="flex items-center gap-2 text-[#2F9E8F]">
            <Sparkles size={20} />
            <h2 className="text-lg font-bold font-display">4. AI Analysis & Routing Preview</h2>
          </div>

          <div className="p-4 bg-[#0F1B1E] rounded-lg border border-[#1D3238] space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-[#9BA8A6]">Detected Category:</span>
              <span className="font-bold text-[#E8A33D]">{formData.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9BA8A6]">Calculated Urgency:</span>
              <span className="font-bold text-[#2F9E8F] uppercase">{formData.urgency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9BA8A6]">Suggested Match HEIs:</span>
              <span className="font-bold text-[#F2EFE9]">BIT Sindri, Ranchi University</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#9BA8A6]">Municipal SLA target:</span>
              <span className="font-bold text-[#E8A33D]">{formData.urgency === 'urgent' ? '168' : '336'} hours</span>
            </div>
            {audioFile && <div className="flex items-center gap-2 text-[#2F9E8F] border-t border-[#1D3238] pt-3"><Radio size={14} /> Voice note queued for Whisper transcription</div>}
          </div>
          <div className="p-3 rounded-lg border border-[#E8A33D]/30 bg-[#E8A33D]/10 text-xs text-[#E8A33D] flex gap-2"><MapPin size={15} className="shrink-0" /> Spatial check: a nearby report within 150m may be fused into the existing master ticket after server verification.</div>

          <div className="flex gap-3">
            <Button variant="outline" className="w-full cursor-pointer" onClick={() => setStep(3)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button variant="primary" className="w-full cursor-pointer" onClick={() => setStep(5)}>
              Review & Submit <ArrowRight size={16} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* STEP 5: Final Review & Confirmation */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="bg-[#16262A] p-5 sm:p-6 rounded-xl border border-[#1D3238] space-y-4">
          <h2 className="text-lg font-bold font-display">5. Review Your Report</h2>
          
          <div className="p-4 bg-[#0F1B1E] rounded-lg space-y-3 text-xs border border-[#1D3238]">
            <p><strong className="text-[#9BA8A6]">Title:</strong> {formData.title}</p>
            {formData.description && (
              <p><strong className="text-[#9BA8A6]">Description:</strong> {formData.description}</p>
            )}
            <p><strong className="text-[#9BA8A6]">Location:</strong> {formData.district}, {formData.block}</p>
            <p><strong className="text-[#9BA8A6]">Category:</strong> {formData.category}</p>
            <p><strong className="text-[#9BA8A6]">Municipal SLA:</strong> {formData.urgency === 'urgent' ? '7 days' : '14 days'}</p>
            
            {/* Image Preview in Review */}
            {formData.previewUrls.length > 0 && (
              <div className="pt-2 border-t border-[#1D3238] flex items-center gap-3">
                <img
                  src={formData.previewUrls[0]}
                  alt="Proof preview"
                  className="w-14 h-14 object-cover rounded-lg border border-[#1D3238]"
                />
                <div>
                  <span className="text-[#2F9E8F] font-semibold block">Photo Evidence Attached</span>
                  <span className="text-[11px] text-[#9BA8A6]">Verified proof ready for submission</span>
                </div>
              </div>
            )}
            {audioFile && <p className="pt-2 border-t border-[#1D3238] text-[#2F9E8F]"><Mic size={14} className="inline mr-2" />Voice note attached for Whisper</p>}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="w-full cursor-pointer" onClick={() => setStep(4)}>
              <ArrowLeft size={16} /> Edit
            </Button>
            <Button
              variant="primary"
              className="w-full cursor-pointer"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Confirm Submission'} <CheckCircle size={16} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* RESPONSIVE CROP MODAL (Safe for all laptops, MacBook, 1366x768 screens, and high scaling) */}
      <AnimatePresence>
        {cropModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#16262A] w-full max-w-lg rounded-2xl border border-[#1D3238] overflow-hidden flex flex-col my-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-[#1D3238] flex justify-between items-center bg-[#0F1B1E] shrink-0">
                <div>
                  <h3 className="font-bold text-[#F2EFE9] text-base">Crop & Adjust Image</h3>
                  <p className="text-[11px] text-[#9BA8A6]">Optional: Zoom and position your photo</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCropModalOpen(false)}
                  className="text-[#9BA8A6] hover:text-red-400 p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              
              {/* Cropper Viewport with flexible height */}
              <div className="relative w-full h-[220px] sm:h-[320px] max-h-[35vh] bg-[#0F1B1E] shrink-0">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              {/* Controls area with overflow scroll if needed */}
              <div className="p-4 space-y-3 overflow-y-auto">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-mono text-[#9BA8A6]">Zoom</label>
                    <span className="text-xs font-mono text-[#E8A33D]">{zoom.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-[#E8A33D] cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-mono text-[#9BA8A6] mb-1.5 block">Aspect Ratio</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={`flex-1 text-xs py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer border ${
                        aspect === 1
                          ? 'bg-[#E8A33D] text-[#0F1B1E] border-[#E8A33D]'
                          : 'bg-[#0F1B1E] text-[#9BA8A6] border-[#1D3238] hover:border-[#9BA8A6]'
                      }`}
                      onClick={() => setAspect(1)}
                    >
                      1:1 (Square)
                    </button>
                    <button
                      type="button"
                      className={`flex-1 text-xs py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer border ${
                        aspect === 4/3
                          ? 'bg-[#E8A33D] text-[#0F1B1E] border-[#E8A33D]'
                          : 'bg-[#0F1B1E] text-[#9BA8A6] border-[#1D3238] hover:border-[#9BA8A6]'
                      }`}
                      onClick={() => setAspect(4/3)}
                    >
                      4:3
                    </button>
                    <button
                      type="button"
                      className={`flex-1 text-xs py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer border ${
                        aspect === 16/9
                          ? 'bg-[#E8A33D] text-[#0F1B1E] border-[#E8A33D]'
                          : 'bg-[#0F1B1E] text-[#9BA8A6] border-[#1D3238] hover:border-[#9BA8A6]'
                      }`}
                      onClick={() => setAspect(16/9)}
                    >
                      16:9
                    </button>
                    <button
                      type="button"
                      className={`flex-1 text-xs py-1.5 px-2 rounded-lg font-medium transition-colors cursor-pointer border ${
                        !aspect
                          ? 'bg-[#E8A33D] text-[#0F1B1E] border-[#E8A33D]'
                          : 'bg-[#0F1B1E] text-[#9BA8A6] border-[#1D3238] hover:border-[#9BA8A6]'
                      }`}
                      onClick={() => setAspect(undefined)}
                    >
                      Free
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer with Actions (Always visible) */}
              <div className="p-3 sm:p-4 bg-[#0F1B1E] border-t border-[#1D3238] flex flex-wrap justify-end gap-2 shrink-0">
                <Button
                  variant="outline"
                  className="text-xs py-2 cursor-pointer"
                  onClick={() => setCropModalOpen(false)}
                >
                  Keep Uncropped
                </Button>
                <Button
                  variant="primary"
                  className="text-xs py-2 cursor-pointer"
                  onClick={handleCropConfirm}
                >
                  Apply Crop
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL PREVIEW MODAL */}
      <AnimatePresence>
        {previewModalOpen && formData.previewUrls.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setPreviewModalOpen(false)}
          >
            <button
              type="button"
              onClick={() => setPreviewModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-red-400 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm z-50 cursor-pointer"
            >
              ✕
            </button>
            <motion.img 
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              src={formData.previewUrls[0]} 
              alt="Full Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
