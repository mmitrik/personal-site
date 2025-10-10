"use client";

import { useState } from "react";
import { motion } from "framer-motion";


const compliments = [
    "You're doing amazing!",
    "You have a great sense of humor!",
    "Your positivity is infectious!",
    "You light up the room!",
    "You're a fantastic problem solver!",
    "You have incredible creative energy!",
    "Your kindness makes a real difference!",
    "You're stronger than you realize!",
    "You inspire others just by being yourself!",
    "Your perspective brings such valuable insight!",
];

const gradients = [
    "bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300",
    "bg-gradient-to-r from-blue-400 via-cyan-300 to-green-300",
    "bg-gradient-to-r from-pink-400 via-red-300 to-orange-300",
    "bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-300",
    "bg-gradient-to-r from-green-400 via-teal-300 to-cyan-300",
    "bg-gradient-to-r from-orange-400 via-yellow-300 to-lime-300",
    "bg-gradient-to-r from-rose-400 via-pink-300 to-fuchsia-300",
    "bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300",
];

const emojis = [
    "✨", // sparkles - for amazing/magical
    "😄", // grinning face - for humor
    "🌟", // star - for positivity/infectious
    "💡", // light bulb - for lighting up the room
    "🧩", // puzzle piece - for problem solving
    "🎨", // artist palette - for creative energy
    "💝", // gift with heart - for kindness
    "💪", // flexed biceps - for strength
    "🌈", // rainbow - for inspiration
    "🔍", // magnifying glass - for insight/perspective
];

export default function ComplimentGenerator() {
    const [compliment, setCompliment] = useState(compliments[0]);
    const [gradient, setGradient] = useState(gradients[0]);
    const [emoji, setEmoji] = useState(emojis[0]);

    const getRandomCompliment = () => {
        const randomIndex = Math.floor(Math.random() * compliments.length);
        setCompliment(compliments[randomIndex]);
        setEmoji(emojis[randomIndex]); // Use the same index for matching emoji
        
        const randomGradientIndex = Math.floor(Math.random() * gradients.length);
        setGradient(gradients[randomGradientIndex]);
    };

    return (
        <div className={`flex items-center justify-center min-h-screen ${gradient}`}>
            <div className="p-6 bg-white rounded-lg shadow-lg text-center max-w-md">
                <motion.div
                    key={emoji}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
                    className="mb-4"
                >
                    <span className="text-6xl">{emoji}</span>
                </motion.div>
                <motion.div
                    key={compliment}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <p className="text-xl font-semibold text-gray-800">{compliment}</p>
                </motion.div>
                <button
                    onClick={getRandomCompliment}
                    className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg shadow hover:bg-pink-600 transition"
                >
                    Give me another!
                </button>
            </div>
        </div>
    );
}