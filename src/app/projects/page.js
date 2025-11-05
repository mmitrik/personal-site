import Link from "next/link";
import Header from "../../components/Header";

const projects = [
    {
        title: "HOA AI Assistant",
        description: "An AI-powered chatbot for homeowners associations that answers questions about bylaws, policies, and procedures. Built with Azure AI Foundry and provides real-time assistance for community living.",
        link: "/apps/hoa-ai",
    },
    {
        title: "Posts",
        description: "A micro-blogging platform with user authentication, markdown support, and real-time posts. Share your thoughts, ideas, and updates with the community using Supabase backend.",
        link: "/apps/posts",
    },
    {
        title: "Compliment Generator",
        description: "A cheerful React app that generates random compliments with smooth animations to brighten your day. Built with Framer Motion and a vibrant gradient design.",
        link: "/apps/compliments",
    },
    {
        title: "Idea Spinner",
        description: "An AI-powered idea generator that uses Azure OpenAI's GPT-4o-mini model to create innovative website feature suggestions. Includes customizable prompts and secure API integration.",
        link: "/apps/idea-spinner",
    },
    {
        title: "Ore Miner",
        description: "A simple and addictive clicking game where you mine ore by clicking a button. Track your progress and watch your mining level increase as you collect more ore.",
        link: "/apps/ore-miner",
    },
    {
        title: "Text Adventure",
        description: "A classic text-based adventure game with a retro terminal interface. Explore different areas, collect items, and interact with objects using traditional commands like 'look', 'go', and 'take'.",
        link: "/apps/text-adventure",
    },
];

export default function ProjectsPage() {
    return (
        <main className="min-h-screen bg-bg text-text">
            <div className="max-w-4xl mx-auto p-8 pt-16">
                <Header />

                <section className="bg-surface p-10 rounded-2xl shadow-sm">
                    <h1 className="text-4xl font-heading mb-8 text-center">Projects</h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, index) => (
                            <div key={index} className="card">
                                <h2 className="text-2xl font-heading mb-2">{project.title}</h2>
                                <p className="text-muted mb-4">{project.description}</p>
                                <Link href={project.link} className="btn">
                                    Open Project
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}