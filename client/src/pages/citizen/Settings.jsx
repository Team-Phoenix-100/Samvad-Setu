import React, { useState } from 'react';
import { Bell, Shield, Eye, Moon, Sun, Monitor, Smartphone, Globe, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';

export default function Settings() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);
  
  const { mode, setThemeMode } = useTheme();

  // A reusable toggle switch component styled for the app
  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E8A33D] focus:ring-offset-2 focus:ring-offset-[#0F1B1E] ${
        checked ? 'bg-[#2F9E8F]' : 'bg-[#1D3238]'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-[#F2EFE9] transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-[#0F1B1E] text-[#F2EFE9] p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-[#1D3238] pb-6">
        <h1 className="text-3xl font-bold font-display text-[#F2EFE9]">Settings</h1>
        <p className="text-sm text-[#9BA8A6] mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="space-y-6">
        
        {/* Notifications Section */}
        <div className="bg-[#16262A] border border-[#1D3238] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#1D3238] flex items-center gap-3">
            <div className="p-2 bg-[#1D3238] rounded-lg text-[#E8A33D]">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-[#F2EFE9]">Notifications</h2>
              <p className="text-xs text-[#9BA8A6]">Choose how you receive updates about your reports.</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#F2EFE9]">Email Notifications</p>
                <p className="text-xs text-[#9BA8A6] mt-1">Receive status updates and alerts via email.</p>
              </div>
              <Toggle checked={emailNotif} onChange={setEmailNotif} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#F2EFE9]">SMS Notifications</p>
                <p className="text-xs text-[#9BA8A6] mt-1">Receive critical alerts via text message.</p>
              </div>
              <Toggle checked={smsNotif} onChange={setSmsNotif} />
            </div>
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-[#16262A] border border-[#1D3238] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#1D3238] flex items-center gap-3">
            <div className="p-2 bg-[#1D3238] rounded-lg text-[#2F9E8F]">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-[#F2EFE9]">Privacy</h2>
              <p className="text-xs text-[#9BA8A6]">Manage your visibility on the platform.</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#F2EFE9]">Public Profile</p>
                <p className="text-xs text-[#9BA8A6] mt-1">Allow others to see your public activity and stats.</p>
              </div>
              <Toggle checked={publicProfile} onChange={setPublicProfile} />
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="bg-[#16262A] border border-[#1D3238] rounded-xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-[#1D3238] flex items-center gap-3">
            <div className="p-2 bg-[#1D3238] rounded-lg text-[#E8A33D]">
              <Eye size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-[#F2EFE9]">Appearance</h2>
              <p className="text-xs text-[#9BA8A6]">Customize the look and feel of the application.</p>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-[#F2EFE9]">Theme Mode</p>
                <p className="text-xs text-[#9BA8A6] mt-1">Select your preferred color theme or sync with your system.</p>
              </div>
              
              <div className="relative flex items-center p-1 bg-[#0F1B1E] border border-[#1D3238] rounded-xl w-full md:w-auto">
                {themeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setThemeMode(option.value)}
                    className={`relative flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg z-10 transition-colors ${
                      mode === option.value ? 'text-[#F2EFE9]' : 'text-[#9BA8A6] hover:text-[#F2EFE9]'
                    }`}
                  >
                    {mode === option.value && (
                      <motion.div
                        layoutId="theme-active-tab"
                        className="absolute inset-0 bg-[#1D3238] rounded-lg -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <option.icon size={16} className={mode === option.value ? 'text-[#E8A33D]' : ''} />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Save Actions */}
      <div className="flex justify-end gap-4 pt-4">
        <Button variant="outline" className="border-[#1D3238] hover:border-[#9BA8A6]">
          Cancel
        </Button>
        <Button variant="primary" className="flex items-center gap-2">
          <Check size={16} />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
