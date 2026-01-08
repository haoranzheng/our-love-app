'use client';

import React, { useEffect, useState } from 'react';
import { Solar, Lunar } from 'lunar-typescript';
import { motion, AnimatePresence } from 'framer-motion';

import { START_DATE_STR, calculateDaysDifference } from '@/utils/date';

// --- Configuration ---
// Her Solar Birthday: November 15
// We assume a birth year to calculate the stable Lunar Birthday Month/Day.
// You can change this year to her actual birth year for 100% accuracy on leap months etc.
const BIRTH_YEAR = 2000; 
const BIRTH_MONTH = 11;
const BIRTH_DAY = 15;

// Anniversary: October 8
const ANNIVERSARY_MONTH = 10;
const ANNIVERSARY_DAY = 8;

// Debug Mode: Set to a date string like "2025-11-15" to test effects. Set null to disable.
// const DEBUG_DATE = "2025-11-15"; 
const DEBUG_DATE = null;

type HolidayType = 'BIRTHDAY' | 'VALENTINE' | 'NEW_YEAR' | 'ANNIVERSARY' | 'NONE';

interface HolidayInfo {
    type: HolidayType;
    message: string;
    icon: string; // Emoji or specific identifier
    audio: string; // Path to audio file
}

export default function HolidayManager() {
    const [holiday, setHoliday] = useState<HolidayInfo | null>(null);
    const [isOpened, setIsOpened] = useState(false); // Has the user clicked "Open"?
    const [isPlaying, setIsPlaying] = useState(false); // Is audio playing?
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
    const [showAudioControls, setShowAudioControls] = useState(false); // Only show if audio successfully loads

    useEffect(() => {
        checkHoliday();
        return () => {
            if (audioElement) {
                audioElement.pause();
                audioElement.src = "";
            }
        }
    }, []);

    // Audio Fade-in Logic
    useEffect(() => {
        if (holiday && isOpened && holiday.audio) {
            const audio = new Audio(holiday.audio);
            audio.loop = true;
            audio.volume = 0;
            audio.play().catch(e => console.log("Autoplay prevented:", e));
            setAudioElement(audio);
            setIsPlaying(true);

            // Fade in
            let vol = 0;
            const interval = setInterval(() => {
                if (vol < 0.6) {
                    vol += 0.03; // 0.6 / (2000ms / 100ms) approx
                    audio.volume = Math.min(vol, 0.6);
                } else {
                    clearInterval(interval);
                }
            }, 100);

            return () => {
                clearInterval(interval);
                audio.pause();
            };
        }
    }, [holiday, isOpened]);

    // Toggle Play/Mute
    const toggleAudio = () => {
        if (!audioElement) return;
        if (isPlaying) {
            audioElement.pause();
        } else {
            audioElement.play();
        }
        setIsPlaying(!isPlaying);
    };

    const checkHoliday = () => {
        // 1. Determine "Today"
        let now = new Date();
        if (DEBUG_DATE) {
            now = new Date(DEBUG_DATE);
        }

        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1-12
        const currentDay = now.getDate();
        const todayStr = `${currentYear}-${currentMonth}-${currentDay}`;

        // 2. Check LocalStorage (Only show once per day)
        // If debugging, ignore this check
        if (!DEBUG_DATE) {
            const lastSeen = localStorage.getItem('last_holiday_egg');
            if (lastSeen === todayStr) {
                return; 
            }
        }

        // 3. Logic for Holidays
        let detectedHoliday: HolidayInfo | null = null;

        // --- A. Solar Birthday Check (11-15) ---
        if (currentMonth === BIRTH_MONTH && currentDay === BIRTH_DAY) {
            detectedHoliday = {
                type: 'BIRTHDAY',
                message: '今天是你的专属日子，生日快乐 ❤️',
                icon: '🎂',
                audio: '/audio/birthday_song.mp3'
            };
        }

        // --- B. Lunar Birthday Check ---
        // Calculate her Lunar Birthday Month/Day from the Birth Year
        // 1. Get Lunar object for her birth date
        const birthSolar = Solar.fromYmd(BIRTH_YEAR, BIRTH_MONTH, BIRTH_DAY);
        const birthLunar = birthSolar.getLunar();
        const targetLunarMonth = birthLunar.getMonth();
        const targetLunarDay = birthLunar.getDay();

        // 2. Get Today's Lunar date
        const todaySolar = Solar.fromYmd(currentYear, currentMonth, currentDay);
        const todayLunar = todaySolar.getLunar();
        
        // Compare Lunar Month/Day
        // Note: lunar-typescript handles leap months. If birth month was leap, we might need stricter logic.
        // For simplicity, we match Month and Day.
        if (todayLunar.getMonth() === targetLunarMonth && todayLunar.getDay() === targetLunarDay) {
             detectedHoliday = {
                type: 'BIRTHDAY',
                message: '农历生日快乐！愿你岁岁平安 🌙',
                icon: '🎂',
                audio: '/audio/birthday_song.mp3'
            };
        }

        // --- C. Valentine's Day (2-14) ---
        if (currentMonth === 2 && currentDay === 14) {
             detectedHoliday = {
                type: 'VALENTINE',
                message: '情人节快乐！每一天都想和你在一起 🌹',
                icon: '💑',
                audio: '/audio/celebration.mp3'
            };
        }

        // --- D. New Year's Eve (12-31) ---
        if (currentMonth === 12 && currentDay === 31) {
            detectedHoliday = {
                type: 'NEW_YEAR',
                message: '跨年快乐！明年也要一起走下去 🎆',
                icon: '🎉',
                audio: '/audio/celebration.mp3'
            };
        }

        // --- E. Anniversary Check (10-08) ---
        if (currentMonth === ANNIVERSARY_MONTH && currentDay === ANNIVERSARY_DAY) {
            const startDate = new Date(START_DATE_STR);
            const daysCount = calculateDaysDifference(now, startDate) + 1; // +1 to match main card logic
            
            detectedHoliday = {
                type: 'ANNIVERSARY',
                message: `在一起的第 ${daysCount} 天，故事仍在继续...`,
                icon: '💍',
                audio: '/audio/our_song.mp3'
            };
        }

        // 4. Trigger Effect if Holiday Found
        if (detectedHoliday) {
            setHoliday(detectedHoliday);
            // Don't show modal immediately, wait for user interaction
            if (!DEBUG_DATE) {
                localStorage.setItem('last_holiday_egg', todayStr);
            }
        }
    };

    const handleOpenSurprise = () => {
        setIsOpened(true);
    };

    const handleClose = () => {
        setIsOpened(false); // Or keep it open? Usually close implies done.
        setHoliday(null);
        if (audioElement) {
            audioElement.pause();
        }
    };

    if (!holiday) return null;

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
            
            {/* 1. Pre-Open: Surprise Button */}
            {!isOpened && (
                <div className="pointer-events-auto">
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        onClick={handleOpenSurprise}
                        className="bg-white/80 backdrop-blur-md border-2 border-[#ff758c] text-[#ff758c] px-8 py-4 rounded-full font-bold text-xl shadow-lg flex items-center gap-2 hover:bg-[#ff758c] hover:text-white transition-colors"
                    >
                        <span>🎁</span> 点击开启今日惊喜
                    </motion.button>
                </div>
            )}

            {/* 2. Opened: Full Effects */}
            {isOpened && (
                <>
                    {/* Background Particles */}
                    <ParticleEffects type={holiday.type} />
                    
                    {/* Audio Controls */}
                    {showAudioControls && (
                        <div className="fixed top-20 right-4 pointer-events-auto z-[101]">
                            <button 
                                onClick={toggleAudio}
                                className="bg-white/50 backdrop-blur-md p-3 rounded-full shadow-md hover:bg-white/80 transition-colors"
                            >
                                {isPlaying ? (
                                    <span className="animate-pulse">🎵</span>
                                ) : (
                                    <span className="text-gray-400">🔇</span>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Glassmorphism Card Modal */}
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            transition={{ type: "spring", duration: 0.8 }}
                            className="pointer-events-auto bg-white/30 backdrop-blur-xl border border-white/60 p-8 rounded-3xl shadow-2xl max-w-sm text-center mx-4 relative overflow-hidden"
                        >
                            {/* Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/40 to-transparent opacity-50 pointer-events-none" />
                            
                            <div className="text-6xl mb-4 animate-bounce">{holiday.icon}</div>
                            <h2 className="text-2xl font-bold text-[#ff758c] mb-2 drop-shadow-sm">惊喜时刻</h2>
                            <p className="text-gray-700 font-medium text-lg leading-relaxed mb-6">
                                {holiday.message}
                            </p>
                            
                            <button
                                onClick={handleClose}
                                className="bg-[#ff758c] text-white px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                            >
                                收下祝福
                            </button>
                        </motion.div>
                    </AnimatePresence>
                </>
            )}
        </div>
    );
}

// --- Particle System ---

function ParticleEffects({ type }: { type: HolidayType }) {
    // Generate particles
    // Birthday -> Rose Petals (🌸 or 🌹 image/emoji)
    // Others -> Confetti/Hearts (🎉 or ❤️)
    
    const count = 50;
    const particles = Array.from({ length: count });
    
    const isBirthday = type === 'BIRTHDAY';
    const emojis = isBirthday ? ['🌸', '🌹', '✨'] : ['❤️', '🎉', '✨', '🍬'];

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((_, i) => (
                <Particle key={i} emoji={emojis[i % emojis.length]} />
            ))}
        </div>
    );
}

function Particle({ emoji }: { emoji: string }) {
    // Randomize start position and animation
    const randomX = Math.random() * 100; // vw
    const duration = 5 + Math.random() * 5; // 5-10s
    const delay = Math.random() * 5;
    const size = 20 + Math.random() * 20; // 20-40px

    return (
        <motion.div
            initial={{ 
                y: -100, 
                x: `${randomX}vw`, 
                rotate: 0,
                opacity: 0 
            }}
            animate={{ 
                y: '110vh', 
                x: `${randomX + (Math.random() - 0.5) * 20}vw`, // Drift
                rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                opacity: [0, 1, 1, 0]
            }}
            transition={{ 
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "linear"
            }}
            style={{ 
                position: 'absolute', 
                fontSize: size,
                top: 0,
                left: 0
            }}
        >
            {emoji}
        </motion.div>
    );
}
