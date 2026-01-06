"use client";

import React, { useState, useRef } from 'react';

interface EventFormProps {
  onAdd: (date: string, title: string, file: File | null) => Promise<void>;
}

export default function EventForm({ onAdd }: EventFormProps) {
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!date || !title) {
      alert("请填写完整的日期和标题哦~");
      return;
    }
    
    setUploading(true);
    try {
      await onAdd(date, title, file);
      setTitle(''); 
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      console.error(e);
      alert("添加失败，请重试");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="add-box bg-white/90 p-5 rounded-[20px] shadow-[var(--card-shadow)] border border-white/30">
      <div className="section-header text-[18px] font-bold text-[#555] mb-[5px] flex items-center gap-[10px] pl-[5px] relative">
        <span className="w-1 h-[18px] bg-[var(--primary-color)] rounded-[2px] block"></span>
        记录美好瞬间
      </div>
      <div className="h-[15px]"></div>
      <div className="flex flex-col gap-3">
        <div className="add-form flex gap-[10px] flex-wrap">
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 min-w-[120px] p-3 border-2 border-[#ffe0e6] rounded-[12px] text-sm outline-none bg-[rgba(255,250,250,0.8)] transition-all duration-300 focus:border-[var(--primary-color)] focus:bg-white"
          />
          <input 
            type="text" 
            placeholder="例如：第一次一起看海..." 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-[2] min-w-[150px] p-3 border-2 border-[#ffe0e6] rounded-[12px] text-sm outline-none bg-[rgba(255,250,250,0.8)] transition-all duration-300 focus:border-[var(--primary-color)] focus:bg-white"
          />
        </div>
        
        <div className="flex gap-[10px] items-center">
            <div className="flex-1 relative">
                <input 
                    type="file" 
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                />
                <label 
                    htmlFor="image-upload"
                    className={`block w-full text-center p-2 border-2 border-dashed rounded-[12px] text-sm cursor-pointer transition-colors ${file ? 'border-[#ff758c] bg-pink-50 text-[#ff758c]' : 'border-[#ffe0e6] text-gray-400 hover:border-[#ff758c]'}`}
                >
                    {file ? `📸 已选择: ${file.name.substring(0, 15)}...` : '📸 点击添加照片 (可选)'}
                </label>
            </div>
            
            <button 
            onClick={handleSubmit}
            disabled={uploading}
            className="btn-add bg-[var(--primary-color)] text-white border-none px-[25px] py-[2.5] h-[42px] rounded-[12px] font-bold cursor-pointer shrink-0 transition-all duration-200 shadow-[0_5px_15px_rgba(255,117,140,0.3)] hover:opacity-95 hover:-translate-y-[2px] active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
            >
            {uploading ? '上传中...' : '添加'}
            </button>
        </div>
      </div>
    </div>
  );
}
