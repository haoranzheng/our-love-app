'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { createClient } from '@/utils/supabase/client';
import Toast from '@/components/Toast';
import { formatDate } from '@/utils/date';
import { wgs84togcj02, gcj02towgs84 } from '@/utils/coordTransform';

// --- Custom Icons ---

const pinkHeartIcon = new L.DivIcon({
  className: 'custom-icon',
  html: `<div style="font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); transform: translate(-50%, -50%);">💗</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const goldenStarIcon = new L.DivIcon({
  className: 'custom-icon',
  html: `<div style="font-size: 32px; filter: drop-shadow(0 0 8px gold); transform: translate(-50%, -50%); animation: pulse 2s infinite;">🌟</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// --- Types ---

interface Footprint {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  visit_date: string;
  image_url?: string;
}

// Tianjin Wanda Plaza (WGS-84)
const START_POINT_WGS84: [number, number] = [39.1414, 117.7655];

// Helper to convert WGS-84 (DB) to GCJ-02 (AMap Display)
// Input: [lat, lng], Output: [lat, lng]
const toDisplay = (lat: number, lng: number): [number, number] => {
    const [gLng, gLat] = wgs84togcj02(lng, lat);
    return [gLat, gLng];
};

// Helper to convert GCJ-02 (AMap Click) to WGS-84 (DB Storage)
// Input: [lat, lng], Output: [lat, lng]
const toStorage = (lat: number, lng: number): [number, number] => {
    const [wLng, wLat] = gcj02towgs84(lng, lat);
    return [wLat, wLng];
};

const START_POINT_DISPLAY = toDisplay(START_POINT_WGS84[0], START_POINT_WGS84[1]);

// --- Sub-components ---

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Custom hook to handle map resizing and flying
function MapController({ coords }: { coords: [number, number] | null }) {
    const map = useMap();
    
    // Fly to location when coords change
    useEffect(() => {
        if (coords) {
            map.flyTo(coords, 14, { duration: 1.5 });
        }
    }, [coords, map]);

    return null;
}

export default function LeafletMap() {
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newCoords, setNewCoords] = useState<{lat: number, lng: number} | null>(null);
  const [flyToCoords, setFlyToCoords] = useState<[number, number] | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedFootprintId, setSelectedFootprintId] = useState<string | null>(null); // For photo gallery highlight

  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDesc, setFormDesc] = useState("");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // Debounce delete

  const supabase = createClient();

  const fetchFootprints = useCallback(async () => {
    const { data, error } = await supabase
      .from('footprints')
      .select('*');
    
    if (error) {
      console.error("Error fetching footprints:", error);
    } else {
      // Sort by date ascending for time line
      const sorted = (data || []).sort((a: any, b: any) => new Date(a.visit_date).getTime() - new Date(b.visit_date).getTime());
      setFootprints(sorted);
    }
  }, [supabase]);

  useEffect(() => {
    fetchFootprints();
  }, [fetchFootprints]);

  const handleMapClick = (lat: number, lng: number) => {
    // Only trigger add form if not dragging existing marker
    // Leaflet click event propogation can be tricky, relying on map container click
    
    // Convert Map Click (GCJ-02) -> Storage (WGS-84)
    const [sLat, sLng] = toStorage(lat, lng);
    setNewCoords({ lat: sLat, lng: sLng });
    setShowForm(true);
  };

  const handleMarkerDragEnd = async (id: string, e: L.DragEndEvent) => {
      const marker = e.target;
      const position = marker.getLatLng();
      const { lat, lng } = position;
      
      // Convert Map Drag (GCJ-02) -> Storage (WGS-84)
      const [sLat, sLng] = toStorage(lat, lng);

      const { error } = await supabase
          .from('footprints')
          .update({ latitude: sLat, longitude: sLng })
          .eq('id', id);

      if (error) {
          setToast({ message: "更新位置失败", type: "error" });
          fetchFootprints(); // Revert
      } else {
          setToast({ message: "位置已更新", type: "success" });
          // Update local state with WGS-84 coords
          setFootprints(prev => prev.map(fp => fp.id === id ? { ...fp, latitude: sLat, longitude: sLng } : fp));
      }
  };

  const handleDeleteFootprint = async (id: string, visitDate: string) => {
      // 1. Special Protection for Start Point
      if (visitDate === '2025-10-08') {
          setToast({ message: "这是故事的起点，无法删除 ❤️", type: "error" });
          return;
      }

      // 2. Debounce Check
      if (isDeleting) return;

      // 3. Confirm Dialog Logic
      if (window.confirm("确定要删除这个足迹吗？")) {
          setIsDeleting(true);
          
          try {
              const { error } = await supabase.from('footprints').delete().eq('id', id);
              
              if (error) {
                  throw error;
              } else {
                  setToast({ message: "足迹已删除", type: "success" });
                  setFootprints(prev => prev.filter(fp => fp.id !== id));
                  if (selectedFootprintId === id) {
                      setSelectedFootprintId(null);
                  }
              }
          } catch (err) {
              setToast({ message: "删除失败，请重试", type: "error" });
              console.error(err);
          } finally {
              setIsDeleting(false);
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoords) return;

    if (loading) return; // Prevent double submission
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        setToast({ message: "请先登录", type: "error" });
        setLoading(false);
        return;
    }

    const { error } = await supabase
      .from('footprints')
      .insert([
        {
          title: formTitle,
          description: formDesc,
          latitude: newCoords.lat,
          longitude: newCoords.lng,
          visit_date: formDate,
          user_id: user.id
        }
      ]);

    if (error) {
      setToast({ message: "添加足迹失败: " + error.message, type: "error" });
    } else {
      setToast({ message: "足迹添加成功！✨", type: "success" });
      setShowForm(false);
      setFormTitle("");
      setFormDesc("");
      fetchFootprints();
    }
    setLoading(false);
  };

  const handleFootprintClick = (fp: Footprint) => {
      // Fly to Display Coordinates (GCJ-02)
      const displayCoords = toDisplay(fp.latitude, fp.longitude);
      setFlyToCoords(displayCoords);
      setSelectedFootprintId(fp.id);
      // Close sidebar on mobile after selection for better view
      if (window.innerWidth < 768) {
          setIsSidebarOpen(false);
      }
  };

  // Prepare line coordinates (WGS-84 -> GCJ-02)
  const polylinePositions = footprints.map(fp => toDisplay(fp.latitude, fp.longitude));

  return (
    <div className="w-full h-full relative flex flex-col">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Sidebar Toggle Button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-[500] bg-white/90 backdrop-blur p-3 rounded-full shadow-lg text-[#ff758c] hover:scale-105 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Sidebar */}
      <div 
        className={`absolute top-0 left-0 h-full w-full md:w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-[400] transform transition-transform duration-300 ease-in-out flex flex-col ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 pt-20 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#ff758c]">我们的足迹 ({footprints.length})</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {footprints.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">
                    <p>还没有足迹哦</p>
                    <p className="text-sm mt-2">点击地图去添加第一个吧！</p>
                </div>
            ) : (
                footprints.map(fp => (
                    <div 
                        key={fp.id}
                        onClick={() => handleFootprintClick(fp)}
                        className="bg-white rounded-xl p-4 shadow-sm border border-pink-50 cursor-pointer hover:border-[#ff758c] hover:shadow-md transition-all group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-800 group-hover:text-[#ff758c] transition-colors">{fp.title}</h3>
                            <span className="text-xs text-gray-400">{formatDate(new Date(fp.visit_date))}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{fp.description}</p>
                    </div>
                ))
            )}
        </div>
      </div>

      <MapContainer 
        center={START_POINT_DISPLAY} 
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 0, flex: 1, touchAction: 'none' }}
        zoomControl={false}
      >
        <MapController coords={flyToCoords} />
        <TileLayer
          attribution='&copy; <a href="https://www.amap.com/">高德地图</a>'
          url="https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
          subdomains={['1', '2', '3', '4']}
          eventHandlers={{
            tileerror: (e) => {
                console.warn("Map tile load error:", e);
                // Optional: Fallback logic or user notification could go here
            }
          }}
        />
        
        <MapEvents onMapClick={handleMapClick} />

        {/* Time Connection Line */}
        {footprints.length > 1 && (
            <Polyline 
                positions={polylinePositions} 
                pathOptions={{ 
                    color: 'rgba(255, 117, 140, 0.6)', 
                    weight: 3, 
                    dashArray: '10, 10',
                    className: 'animated-line' // We'll add css for animation
                }} 
            />
        )}

        {/* Start Point Marker (Anniversary) */}
        {/* You can adjust coordinates to your actual start location */}
        <Marker 
            position={START_POINT_DISPLAY} 
            icon={goldenStarIcon}
            draggable={false} // Fixed position
        >
            <Popup className="custom-popup">
                <div className="text-center p-2">
                    <h3 className="font-bold text-[#ff758c]">故事的开始</h3>
                    <p className="text-xs text-gray-500">2025.10.08</p>
                    <p className="text-sm mt-1">我们的爱，从这里起航 ✨</p>
                </div>
            </Popup>
        </Marker>

        {/* User Footprints */}
        {footprints.map(fp => {
            const displayPos = toDisplay(fp.latitude, fp.longitude);
            return (
            <Marker 
                key={fp.id} 
                position={displayPos} 
                icon={pinkHeartIcon}
                draggable={true} // Enable drag always, but logic could be refined
                eventHandlers={{
                    click: () => {
                        setSelectedFootprintId(fp.id);
                    },
                    dragend: (e) => handleMarkerDragEnd(fp.id, e)
                }}
            >
                <Popup className="custom-popup">
                    <div className="text-center min-w-[150px]">
                        <h3 className="font-bold text-gray-800">{fp.title}</h3>
                        <p className="text-xs text-[#ff758c] mb-1">{formatDate(new Date(fp.visit_date))}</p>
                        {fp.description && <p className="text-sm text-gray-600 mb-2">{fp.description}</p>}
                        {fp.image_url && (
                            <img src={fp.image_url} alt={fp.title} className="w-full h-24 object-cover rounded-lg" />
                        )}
                        <div className="mt-2 border-t border-gray-100 pt-2">
                            <button 
                                onClick={() => handleDeleteFootprint(fp.id, fp.visit_date)}
                                disabled={isDeleting}
                                className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                                    isDeleting ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600 hover:bg-red-50'
                                }`}
                            >
                                {isDeleting ? '删除中...' : '删除此足迹'}
                            </button>
                        </div>
                    </div>
                </Popup>
            </Marker>
        )})}

        {/* Temporary Marker for New Selection */}
        {showForm && newCoords && (
            <Marker position={toDisplay(newCoords.lat, newCoords.lng)} icon={pinkHeartIcon} opacity={0.6} />
        )}
      </MapContainer>

      {/* Photo Gallery Bottom Bar */}
      {footprints.some(fp => fp.image_url) && (
          <div className="h-32 bg-white/90 backdrop-blur-xl border-t border-gray-200 p-2 overflow-x-auto flex gap-3 z-[450] shrink-0">
              {footprints.filter(fp => fp.image_url).map(fp => (
                  <div 
                    key={fp.id}
                    onClick={() => handleFootprintClick(fp)}
                    className={`relative min-w-[100px] h-full rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${selectedFootprintId === fp.id ? 'ring-4 ring-[#ff758c] scale-105' : 'opacity-80 hover:opacity-100'}`}
                  >
                      <img src={fp.image_url} alt={fp.title} className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                          <p className="text-white text-[10px] truncate text-center">{fp.title}</p>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Add Footprint Modal Form */}
      {showForm && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-white/60">
                <h2 className="text-xl font-bold text-[#ff758c] mb-4 text-center">记录新足迹</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">地点名称</label>
                        <input 
                            type="text" 
                            required
                            value={formTitle}
                            onChange={e => setFormTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-pink-100 bg-white focus:border-[#ff758c] focus:outline-none"
                            placeholder="例如：第一次看海的地方"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">日期</label>
                        <input 
                            type="date" 
                            required
                            value={formDate}
                            onChange={e => setFormDate(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-pink-100 bg-white focus:border-[#ff758c] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">心情感言</label>
                        <textarea 
                            value={formDesc}
                            onChange={e => setFormDesc(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-pink-100 bg-white focus:border-[#ff758c] focus:outline-none h-20 resize-none"
                            placeholder="那天我们..."
                        />
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button 
                            type="button" 
                            onClick={() => setShowForm(false)}
                            className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-500 font-medium active:scale-95 transition-transform"
                        >
                            取消
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-1 py-2 rounded-xl bg-[#ff758c] text-white font-bold shadow-md active:scale-95 transition-transform disabled:opacity-50"
                        >
                            {loading ? '保存中...' : '标记'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
