'use client';
import dynamic from 'next/dynamic';

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-[#fff8fa] text-[#ff758c]">
      <p>地图加载中...</p>
    </div>
  ),
});

export default LeafletMap;
