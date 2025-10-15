import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-surface p-10 rounded-2xl shadow-sm mb-12">
      <h2 className="text-4xl font-heading mb-4">Product & Technical Program Manager</h2>
      <p className="text-muted mb-6 max-w-2xl">
        I build cross-functional programs and products by balancing technical clarity with human-centered leadership.
        This site is a place to showcase my work and experiments.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/projects" className="btn">
          View My Projects
        </Link>
        <Link href="/contact" className="btn-outline">
          Get In Touch
        </Link>
      </div>
    </section>
  );
}