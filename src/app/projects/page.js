import Link from "next/link";
import Header from "../../components/Header";

const projects = [
    {
        title: "Idea Spinner",
        description: "An AI-powered idea generator that uses Azure OpenAI's GPT-4o-mini model to create innovative website feature suggestions. Includes customizable prompts and secure API integration.",
        link: "/apps/idea-spinner",
    },
    {
        title: "Compliment Generator",
        description: "A cheerful React app that generates random compliments with smooth animations to brighten your day. Built with Framer Motion and a vibrant gradient design.",
        link: "/apps/compliments",
    },
    {
        title: "Project Two",
        description: "This is a short description of Project Two.",
        link: "/apps/project-two",
    },
    {
        title: "Project Three",
        description: "This is a short description of Project Three.",
        link: "/apps/project-three",
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