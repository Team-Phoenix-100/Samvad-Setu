import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Sparkles, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { useProblemStore } from '../../store/problemStore';
import { useToastStore } from '../../store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import Button from '../../components/ui/Button';

export default function SubmitProblem() {
  const navigate = useNavigate();
  const { addProblem, isLoading } = useProblemStore();
  const [step, setStep] = useState(1);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
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
    if (!formData.imageUploaded) {
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


  const { showToast } = useToastStore();

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({ ...prev, lat: position.coords.latitude, lng: position.coords.longitude }));
          showToast("Location updated successfully", "success");
        },
        (error) => showToast("Failed to get location. Please enable GPS.", "error")
      );
    } else {
      showToast("Geolocation not supported by this browser.", "error");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageToCrop(url);
      setCropModalOpen(true);
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    try {
      const croppedImageFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const previewUrl = URL.createObjectURL(croppedImageFile);
      setFormData(prev => ({ ...prev, imageUploaded: true, images: [croppedImageFile], previewUrls: [previewUrl] }));
      setCropModalOpen(false);
      showToast("Image cropped successfully", "success");
    } catch (e) {
      showToast("Failed to crop image", "error");
    }
  };

  const handleSubmit = async () => {
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      urgency: formData.urgency,
      location: { district: formData.district, block: formData.block, lat: formData.lat, lng: formData.lng },
      images: formData.images,
    };
    
    const created = await addProblem(payload);
    
    if (created) {
      showToast("Problem reported successfully!", "success");
      navigate(`/problem/${created.id}`);
    } else {
      showToast("Failed to submit problem.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1B1E] text-[#F2EFE9] p-6 max-w-2xl mx-auto space-y-6">
      {/* Step Indicator Header */}
      <div className="space-y-2 border-b border-[#1D3238] pb-4">
        <span className="text-xs font-mono text-[#E8A33D] uppercase">Phase 3 • Step {step} of 5</span>
        <h1 className="text-2xl font-bold font-display">Report a Civic Problem</h1>
        <div className="flex gap-1 h-1.5 w-full bg-[#16262A] rounded-full overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-full flex-1 transition-all ${
                i <= step ? 'bg-[#E8A33D]' : 'bg-[#1D3238]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* STEP 1: Basic Information */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="bg-[#16262A] p-6 rounded-xl border border-[#1D3238] space-y-4">
          <h2 className="text-lg font-bold font-display">1. Issue Information</h2>
          <div className="space-y-1">
            <label className="text-xs font-mono text-[#9BA8A6]">Problem Title</label>
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

          <Button variant="primary" className="w-full py-2.5" onClick={() => setStep(2)}>
            Continue to Location <ArrowRight size={16} />
          </Button>
        </motion.div>
      )}

      {/* STEP 2: Location Selector */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="bg-[#16262A] p-6 rounded-xl border border-[#1D3238] space-y-4">
          <h2 className="text-lg font-bold font-display">2. Pin Location</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#9BA8A6]">District</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg p-3 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-mono text-[#9BA8A6]">Block / Locality</label>
              <input
                type="text"
                value={formData.block}
                onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                className="w-full bg-[#0F1B1E] border border-[#1D3238] rounded-lg p-3 text-sm"
              />
            </div>
          </div>

          
          <div className="p-6 border border-dashed border-[#1D3238] rounded-lg bg-[#0F1B1E] text-center space-y-3">
            <MapPin className="mx-auto text-[#E8A33D]" size={32} />
            <p className="text-xs text-[#9BA8A6]">Interactive Map Picker (GPS Auto-Location)</p>
            <span className="block text-xs font-mono text-[#2F9E8F] bg-[#2F9E8F]/10 px-2 py-1 rounded w-max mx-auto mb-2">
              GPS Lat: {formData.lat.toFixed(4)}, Lng: {formData.lng.toFixed(4)}
            </span>
            <Button variant="outline" className="text-xs" onClick={handleGetLocation}>Use Current Location</Button>
          </div>


          <div className="flex gap-3">
            <Button variant="outline" className="w-full" onClick={() => setStep(1)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button variant="primary" className="w-full" onClick={() => setStep(3)}>
              Continue to Media <ArrowRight size={16} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Media Upload */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="bg-[#16262A] p-6 rounded-xl border border-[#1D3238] space-y-4">
          <h2 className="text-lg font-bold font-display">3. Upload Photos / Evidence</h2>
          
          <label className="p-8 border-2 border-dashed border-[#1D3238] hover:border-[#E8A33D] rounded-xl bg-[#0F1B1E] text-center space-y-3 cursor-pointer block transition-colors">
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            {formData.imageUploaded ? (
              <img src={formData.previewUrls[0]} alt="Preview" className="mx-auto h-32 object-cover rounded-lg border border-[#1D3238] shadow-md hover:scale-105 transition-transform" onClick={(e) => { e.preventDefault(); setPreviewModalOpen(true); }} />
            ) : (
              <>
                <Camera className="mx-auto text-[#9BA8A6]" size={36} />
                <p className="text-sm font-semibold">Click to select photo</p>
                <p className="text-xs text-[#9BA8A6]">Supports JPG, PNG up to 10MB</p>
              </>
            )}
          </label>


          <div className="flex gap-3">
            <Button variant="outline" className="w-full" onClick={() => setStep(2)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button variant="primary" className="w-full" onClick={handleNextToAI}>
              Run AI Engine Check <Sparkles size={16} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: AI Classification Preview */}
      {step === 4 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="bg-[#16262A] p-6 rounded-xl border border-[#2F9E8F] space-y-4">
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
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="w-full" onClick={() => setStep(3)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button variant="primary" className="w-full" onClick={() => setStep(5)}>
              Review & Submit <ArrowRight size={16} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* STEP 5: Final Review & Confirmation */}
      {step === 5 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="bg-[#16262A] p-6 rounded-xl border border-[#1D3238] space-y-4">
          <h2 className="text-lg font-bold font-display">5. Review Your Report</h2>
          <div className="p-4 bg-[#0F1B1E] rounded-lg space-y-2 text-xs">
            <p><strong className="text-[#9BA8A6]">Title:</strong> {formData.title}</p>
            <p><strong className="text-[#9BA8A6]">Location:</strong> {formData.district}, {formData.block}</p>
            <p><strong className="text-[#9BA8A6]">Category:</strong> {formData.category}</p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="w-full" onClick={() => setStep(4)}>
              <ArrowLeft size={16} /> Edit
            </Button>
            <Button variant="primary" className="w-full" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Confirm Submission'} <CheckCircle size={16} />
            </Button>
          </div>
        </motion.div>
      )}
      {/* Crop Modal */}
      <AnimatePresence>
        {cropModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#16262A] w-full max-w-lg rounded-2xl border border-[#1D3238] overflow-hidden flex flex-col"
            >
              <div className="p-4 border-b border-[#1D3238] flex justify-between items-center bg-[#0F1B1E]">
                <h3 className="font-bold text-[#F2EFE9]">Crop Image</h3>
                <button onClick={() => setCropModalOpen(false)} className="text-[#9BA8A6] hover:text-red-400">✕</button>
              </div>
              
              <div className="relative w-full h-[300px] sm:h-[400px] bg-[#0F1B1E]">
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

              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-mono text-[#9BA8A6] mb-2 block">Zoom</label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(e.target.value)}
                    className="w-full accent-[#E8A33D]"
                  />
                </div>
                
                <div>
                  <label className="text-xs font-mono text-[#9BA8A6] mb-2 block">Aspect Ratio</label>
                  <div className="flex gap-2">
                    <Button variant={aspect === 1 ? 'primary' : 'outline'} className="flex-1 text-xs py-1" onClick={() => setAspect(1)}>1:1 (Square)</Button>
                    <Button variant={aspect === 4/3 ? 'primary' : 'outline'} className="flex-1 text-xs py-1" onClick={() => setAspect(4/3)}>4:3</Button>
                    <Button variant={!aspect ? 'primary' : 'outline'} className="flex-1 text-xs py-1" onClick={() => setAspect(undefined)}>Free Form</Button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#1D3238]">
                  <Button variant="outline" onClick={() => setCropModalOpen(false)}>Cancel</Button>
                  <Button variant="primary" onClick={handleCropConfirm}>Confirm Crop</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setPreviewModalOpen(false)}
          >
            <button className="absolute top-4 right-4 text-white hover:text-red-400 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm z-50">✕</button>
            <motion.img 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              src={formData.previewUrls[0]} 
              alt="Full Preview" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}