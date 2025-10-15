import Link from 'next/link';

export default function Contact() {
  return (
    <section className="bg-surface p-10 rounded-2xl shadow-sm">
      <h2 className="text-3xl font-heading mb-6">Let&#39;s Connect</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <p className="text-muted mb-6">
            I&#39;m always interested in new opportunities, collaborations, or just having 
            a conversation about technology and product management.
          </p>
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-medium text-accent mb-1">LinkedIn</h3>
              <a 
                href="https://linkedin.com/in/mmitrik" 
                className="text-muted hover:text-accent"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin.com/in/mmitrik
              </a>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center space-y-4">
          <Link href="/contact" className="btn">
            Full Contact Page
          </Link>
        </div>
      </div>
    </section>
  );
}