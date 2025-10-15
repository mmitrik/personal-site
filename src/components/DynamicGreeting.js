"use client";

import { useEffect, useState } from "react";

export default function DynamicGreeting() {
    const [greeting, setGreeting] = useState("");
    const [theme, setTheme] = useState("day"); // "morning" | "day" | "evening" | "night"
    const [isAutoThemeEnabled, setIsAutoThemeEnabled] = useState(true);
    const [showSettings, setShowSettings] = useState(false);

    const themes = [
        { name: "morning", label: "Morning ☀️", emoji: "☀️" },
        { name: "day", label: "Day 👋", emoji: "👋" },
        { name: "evening", label: "Evening 🌇", emoji: "🌇" },
        { name: "night", label: "Night 🌙", emoji: "🌙" }
    ];

    useEffect(() => {
        if (isAutoThemeEnabled) {
            const hour = new Date().getHours();

            if (hour < 12) {
                setGreeting("Good morning ☀️");
                setTheme("morning");
            } else if (hour < 17) {
                setGreeting("Good afternoon 👋");
                setTheme("day");
            } else if (hour < 21) {
                setGreeting("Good evening 🌇");
                setTheme("evening");
            } else {
                setGreeting("Good night 🌙");
                setTheme("night");
            }
        }
    }, [isAutoThemeEnabled]);

    // Apply theme to body element
    useEffect(() => {
        if (theme) {
            document.body.setAttribute('data-theme', theme);
        }
        
        // Cleanup function to remove attribute when component unmounts
        return () => {
            document.body.removeAttribute('data-theme');
        };
    }, [theme]);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
        setIsAutoThemeEnabled(false);
        
        // Update greeting based on manual theme selection
        const themeGreetings = {
            morning: "Good morning ☀️",
            day: "Good afternoon 👋",
            evening: "Good evening 🌇",
            night: "Good night 🌙"
        };
        setGreeting(themeGreetings[newTheme]);
    };

    const toggleAutoTheme = () => {
        setIsAutoThemeEnabled(!isAutoThemeEnabled);
        if (!isAutoThemeEnabled) {
            // Re-enable auto theme and update immediately
            const hour = new Date().getHours();
            if (hour < 12) {
                setGreeting("Good morning ☀️");
                setTheme("morning");
            } else if (hour < 17) {
                setGreeting("Good afternoon 👋");
                setTheme("day");
            } else if (hour < 21) {
                setGreeting("Good evening 🌇");
                setTheme("evening");
            } else {
                setGreeting("Good night 🌙");
                setTheme("night");
            }
        }
    };

    return (
        <div className="bg-surface p-6 rounded-2xl shadow-sm mb-12 transition-colors duration-700 relative">
            {/* Settings button */}
            <button
                onClick={() => setShowSettings(!showSettings)}
                className="absolute top-4 right-4 text-muted hover:text-accent transition-colors p-2 rounded-md hover:bg-bg"
                title="Theme settings"
            >
                ⚙️
            </button>

            <h2 className="text-2xl font-heading mb-2 pr-12">{greeting}</h2>

            {/* Theme controls */}
            {showSettings && (
                <div className="mt-4 p-4 bg-bg rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-text font-medium">Auto Theme</span>
                        <button
                            onClick={toggleAutoTheme}
                            className={`w-12 h-6 rounded-full transition-colors ${
                                isAutoThemeEnabled ? "bg-accent" : "bg-border"
                            }`}
                        >
                            <div
                                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                    isAutoThemeEnabled ? "translate-x-6" : "translate-x-0.5"
                                }`}
                            />
                        </button>
                    </div>
                    
                    <div className="space-y-2">
                        <span className="text-sm text-muted">Manual Theme Selection:</span>
                        <div className="grid grid-cols-2 gap-2">
                            {themes.map((themeOption) => (
                                <button
                                    key={themeOption.name}
                                    onClick={() => handleThemeChange(themeOption.name)}
                                    className={`p-2 rounded-md text-left transition-colors ${
                                        theme === themeOption.name && !isAutoThemeEnabled
                                            ? "bg-accent text-white"
                                            : "bg-surface hover:bg-border text-text"
                                    }`}
                                    disabled={isAutoThemeEnabled}
                                >
                                    <span className="text-sm">{themeOption.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
