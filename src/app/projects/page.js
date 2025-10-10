import Link from "next/link";

const projects = [
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
        <div className="min-h-screen bg-gray-900 text-white font-sans p-8">
            <h1 className="text-4xl font-bold text-center mb-8">Projects</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                        <h2 className="text-2xl font-semibold mb-2 text-white">{project.title}</h2>
                        <p className="text-gray-400 mb-4">{project.description}</p>
                        <Link href={project.link} className="text-blue-400 hover:text-blue-300">
                            Open Project
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}