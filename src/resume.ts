export const resumeData = {
  header: {
      name: "Bishesh Shrestha",
      title: "Software Developer",
      location: "Bharatpur, Nepal",
      tagline: "Recent CS grad with a minor in AI. I like bridging complex backend logic with creative, interactive frontends."
  },
  experience: [
  {
    role: "Software Development Intern",
    company: "Cambridge Investment Research",
    date: "May 2025 - Dec 2025",
    bullets: [
      "Helped migrate the enterprise data pipeline from legacy Pentaho to Azure Data Factory.",
      "Optimized SQL scripts to cut down query execution time and memory consumption.",
      "Got hands-on experience with Agile, CI/CD, and infrastructure as code using Terraform."
    ]
  }
  ],
 projects: [
  {
    title: "2D Falling Sand Engine",
    description: "A high-performance physics engine built in Go. Utilizes Ebitengine to handle granular thermodynamics and fluid simulations at a high frame rate.",
    tech: ["Go", "Ebitengine", "Physics Simulation"],
    link: "https://github.com/Bishesh-ops/pixel-sim" 
  },
  {
    title: "Interactive Biometric Portfolio",
    description: "The site you are on right now. Used Google's MediaPipe Tasks API to build a client-side gesture authentication system.",
    tech: ["TypeScript", "MediaPipe", "Vite"],
    link: "https://github.com/Bishesh-ops/Portfolio"
  },
  {
    title: "C-Compiler Visualization",
    description: "Built a custom C++17 compiler engine from scratch and wired it up to an interactive React dashboard to visualize the syntax trees in real-time.",
    tech: ["C++17", "React", "FastAPI"],
    link: "https://github.com/Bishesh-ops/software-engineering-project" // <-- Update with actual repo name
  },
  {
    title: "Personal Finance Tracker",
    description: "A full-stack financial dashboard utilizing secure authentication and deployed via a containerized pipeline.",
    tech: ["Next.js", "PostgreSQL", "Docker"],
    link: "https://github.com/Bishesh-ops/Finance-Tracking-App" // <-- Update with actual repo name
  }
]
}