import Link from 'next/link';

const featuredProjects = [
  {
    title: "Posts",
    description: "A micro-blogging platform with real-time authentication, markdown support, and character limits for quick thoughts.",
    link: "/apps/posts",
    tech: "Next.js, Supabase, TypeScript, React"
  },
  {
    title: "Text Adventure",
    description: "An interactive text-based adventure game where your choices shape the story in a mysterious world.",
    link: "/apps/text-adventure",
    tech: "React, JavaScript, Interactive Fiction"
  }
];

export default function Projects() {
  return (
    <section className="bg-surface p-10 rounded-2xl shadow-sm mb-12">
      <h2 className="text-3xl font-heading mb-6">Featured Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {featuredProjects.map((project, index) => (
          <div key={index} className="card">
            <h3 className="text-xl font-heading mb-2">{project.title}</h3>
            <p className="text-muted mb-3">{project.description}</p>
            <p className="text-sm text-accent mb-4">{project.tech}</p>
            <Link href={project.link} className="btn">
              View Project
            </Link>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Link href="/projects" className="btn-outline">
          View All Projects
        </Link>
      </div>
    </section>
  );
}