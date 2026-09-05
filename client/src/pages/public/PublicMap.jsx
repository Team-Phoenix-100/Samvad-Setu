import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import { useProblemStore } from '../../store/problemStore';
import SignalDot from '../../components/ui/SignalDot';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

// Fix for default marker icons in Leaflet under Vite bundle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function PublicMap() {
  const { problems, fetchProblems } = useProblemStore();
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchProblems();
  }, []);

  // Jharkhand Center Coordinates
  const jharkhandCenter = [23.6102, 85.2799];

  const filteredProblems = filter === 'all' 
    ? problems 
    : problems.filter(p => p.status === filter);

  return (
    <div className="flex-1 min-h-[calc(100vh-140px)] bg-[#0F1B1E] text-[#F2EFE9] flex flex-col">
      {/* Map Header Overlay */}
      <header className="border-b border-[#1D3238] bg-[#16262A]/90 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <SignalDot status="unresolved" size="sm" />
            <span className="font-display font-bold text-lg text-[#F2EFE9]">SICP Map Explorer</span>
          </Link>
          <span className="hidden sm:inline text-xs font-mono text-[#9BA8A6] border-l border-[#1D3238] pl-3">
            Jharkhand Geo-Signals
          </span>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 text-xs">
          <Filter size={14} className="text-[#E8A33D]" />
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filter === 'all' ? 'bg-[#1D3238] border-[#E8A33D] text-[#E8A33D]' : 'border-[#1D3238] text-[#9BA8A6]'
            }`}
          >
            All ({problems.length})
          </button>
          <button
            onClick={() => setFilter('in-progress')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filter === 'in-progress' ? 'bg-[#1D3238] border-[#2F9E8F] text-[#2F9E8F]' : 'border-[#1D3238] text-[#9BA8A6]'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              filter === 'resolved' ? 'bg-[#1D3238] border-[#F2EFE9] text-[#F2EFE9]' : 'border-[#1D3238] text-[#9BA8A6]'
            }`}
          >
            Resolved
          </button>
        </div>
      </header>

      {/* Map Body */}
      <div className="flex-1 w-full relative z-0">
        <MapContainer
          center={jharkhandCenter}
          zoom={8}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {filteredProblems.map((item) => (
            <Marker
              key={item.id}
              position={[item.location?.lat || 23.3441, item.location?.lng || 85.3096]}
            >
              <Popup>
                <div className="p-1 space-y-2 max-w-xs font-sans text-slate-900">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500">{item.id}</span>
                    <span className="text-[10px] uppercase font-bold text-[#2F9E8F]">{item.status}</span>
                  </div>
                  <h4 className="font-bold text-sm leading-tight text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                  <div className="pt-2">
                    <Link
                      to={`/problem/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#16262A] hover:underline"
                    >
                      View Timeline Detail <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}