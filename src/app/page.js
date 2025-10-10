'use client';

import Link from 'next/link';


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center p-6 bg-gray-800">
        <h1 className="text-2xl font-bold">Matt Mitrik</h1>
        <ul className="flex space-x-6">
          <li>
            <Link href="/projects" className="hover:text-gray-400">
              Projects
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-gray-400">
              Contact
            </Link>
          </li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header className="flex flex-col items-center justify-center text-center py-20 px-6">
        <h2 className="text-4xl font-extrabold mb-4">Welcome to My Personal Website</h2>
        <p className="text-lg text-gray-400 max-w-2xl">
          Hi, I'm Matt, a passionate software developer specializing in building modern web applications. I love creating clean, efficient, and user-friendly solutions.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link href="/projects" className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-500">
            View My Projects
          </Link>
          <Link href="/contact" className="px-6 py-3 bg-gray-700 text-white rounded-lg text-lg font-medium hover:bg-gray-600">
            Get In Touch
          </Link>
        </div>
      </header>
    </div>
  );
}