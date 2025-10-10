"use client";

import { useState } from "react";
import { motion } from "framer-motion";


const compliments = [
    "You're doing amazing!",
    "You have a great sense of humor!",
    "Your positivity is infectious!",
    "You light up the room!",
    "You're a fantastic problem solver!",
];

export default function ComplimentGenerator() {
    const [compliment, setCompliment] = useState(compliments[0]);

    const getRandomCompliment = () => {
        const randomIndex = Math.floor(Math.random() * compliments.length);
        setCompliment(compliments[randomIndex]);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300">
            <div className="p-6 bg-white rounded-lg shadow-lg text-center max-w-md">
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