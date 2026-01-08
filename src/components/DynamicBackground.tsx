"use client";

import React, { useEffect, useState } from "react";

export default function DynamicBackground() {
  const [gradient, setGradient] = useState("linear-gradient(to bottom, #ff9a9e, #fad0c4)");

  useEffect(() => {
    const updateTheme = () => {
      const hour = new Date().getHours();
      let newGradient = "";

      if (hour >= 6 && hour < 10) {
        // Morning: Sunrise Pink
        newGradient = "linear-gradient(to bottom, #ff9a9e, #fad0c4)";
      } else if (hour >= 10 && hour < 17) {
        // Noon: Sky Blue
        newGradient = "linear-gradient(to bottom, #a1c4fd, #c2e9fb)";
      } else if (hour >= 17 && hour < 20) {
        // Evening: Sunset Gold
        newGradient = "linear-gradient(to bottom, #f6d365, #fda085)";
      } else {
        // Night: Starry Purple
        newGradient = "linear-gradient(to bottom, #243949, #517fa4)";
      }

      setGradient(newGradient);
    };

    updateTheme();
    const interval = setInterval(updateTheme, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{ background: gradient }}
      className="fixed inset-0 -z-50 transition-colors duration-[2000ms] ease-in-out"
    />
  );
}
