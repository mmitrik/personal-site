import Link from "next/link";
import Header from "../../components/Header";

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-bg text-text">
            <div className="max-w-4xl mx-auto p-8 pt-16">
                <Header />

                <section className="bg-surface p-10 rounded-2xl shadow-sm">
                    <h1 className="text-4xl font-heading mb-8 text-center">Contact Me</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Contact Information */}
                        <div className="card">
                            <h2 className="text-2xl font-heading mb-6">Get in Touch</h2>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-muted">Email</h3>
                                    <a 
                                        href="mailto:mmitrik@gmail.com?subject=Let's Connect!"
                                        className="text-muted hover:text-accent"
                                    >
                                        mmitrik@gmail.com
                                    </a>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-muted">LinkedIn</h3>
                                    <a 
                                        href="https://linkedin.com/in/mmitrik" 
                                        className="text-muted hover:text-accent"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        linkedin.com/in/mmitrik
                                    </a>
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-muted">GitHub</h3>
                                    <a 
                                        href="https://github.com/mmitrik" 
                                        className="text-muted hover:text-accent"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        github.com/mmitrik
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="card">
                            <h2 className="text-2xl font-heading mb-6">Send a Message</h2>
                            <form className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium mb-2 text-text">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="w-full px-3 py-2 bg-bg border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium mb-2 text-text">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        className="w-full px-3 py-2 bg-bg border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium mb-2 text-text">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows="4"
                                        className="w-full px-3 py-2 bg-bg border border-border rounded-md text-text focus:outline-none focus:ring-2 focus:ring-accent"
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn w-full">
                                    Send Message
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="text-center mt-8">
                        <Link href="/" className="btn-outline">
                            Back to Home
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}