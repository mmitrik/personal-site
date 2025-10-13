'use client';

import Link from 'next/link';
import Header from '../components/Header';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="max-w-4xl mx-auto p-8 pt-16">
        <Header />

        <section className="bg-surface p-10 rounded-2xl shadow-sm">
          <h2 className="text-4xl font-heading mb-4">Product & Technical Program Manager</h2>
          <p className="text-muted mb-6 max-w-2xl">
            I build cross-functional programs and products by balancing technical clarity with human-centered leadership.
            This site is a place to showcase my work and experiments.
          </p>

          <div className="flex gap-4">
            <a
              href="/projects"
              className="btn"
            >
              View Projects
            </a>
            <a href="/contact" className="btn-outline">
              Get in Touch
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}