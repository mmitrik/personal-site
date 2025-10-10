import Link from "next/link";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            {/* Navigation Bar */}
            <nav className="flex justify-between items-center p-6 bg-gray-800">
                <Link href="/" className="text-2xl font-bold hover:text-gray-400">
                    Matt Mitrik
                </Link>
                <ul className="flex space-x-6">
                    <li>
                        <Link href="/" className="hover:text-gray-400">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href="/projects" className="hover:text-gray-400">
                            Projects
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Contact Content */}
            <div className="max-w-4xl mx-auto p-8">
                <h1 className="text-4xl font-bold text-center mb-8">Contact Me</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium text-blue-400">Email</h3>
                                <a 
                                    href="mailto:mmitrik@gmail.com?subject=Let's Connect!"
                                    className="text-gray-400 hover:text-blue-300"
                                >
                                    mmitrik@gmail.com
                                </a>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-blue-400">LinkedIn</h3>
                                <a 
                                    href="https://linkedin.com/in/mmitrik" 
                                    className="text-gray-400 hover:text-blue-300"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    linkedin.com/in/mmitrik
                                </a>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-blue-400">GitHub</h3>
                                <a 
                                    href="https://github.com/mmitrik" 
                                    className="text-gray-400 hover:text-blue-300"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    github.com/mmitrik
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h2 className="text-2xl font-semibold mb-6">Send a Message</h2>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="4"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-500 transition-colors"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-8">
                    <Link href="/" className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}