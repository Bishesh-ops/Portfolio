export const resumeData = {
  header: {
      name: "Bishesh Shrestha",
      title: "Software Developer",
      location: "Bharatpur, Nepal",
      tagline: "I built a C compiler from scratch, a Barnes-Hut gravity sim, a WASM physics engine, and a gesture-controlled portfolio. I love bridging heavy, complex backend systems with creative, interactive frontend experiences."
  },
  skills: [
    "C++17", "Python", "Javascript", "Java", "Azure", "Azure Data Factory", "Data Engineering" ,"Azure Functions", "Rust", "SQL", "Go", "TypeScript", "React", "Next.js", "PostgreSQL", "Docker", "OpenMP", "WebAssembly", "GSAP"
  ],
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
    title: "C++ ECS Roguelike",
    description: "A systems-driven terminal roguelike utilizing a custom Entity Component System (ECS) and procedural dungeon generation.",
    tech: ["C++17", "ECS Architecture", "ProcGen"],
    link: "https://github.com/Bishesh-ops/entropy-descent" 
  },
  {
    title: "2D Falling Sand Engine",
    description: "A high-performance physics engine built in Go. Utilizes Ebitengine to handle granular thermodynamics and fluid simulations at a high frame rate.",
    tech: ["Go", "Ebitengine", "Physics Simulation"],
    link: "https://github.com/Bishesh-ops/pixel-sim" 
  },
  {
    title: "N-Body Gravity Simulation",
    description: "A high-performance Barnes-Hut N-body simulation engine. Utilizes a custom Quadtree and OpenMP multi-threading to compute gravitational forces for massive particle counts.",
    tech: ["C++17", "OpenMP", "SFML", "Barnes-Hut"],
    link: "https://github.com/Bishesh-ops/nbody-sim"
  },
  {
    title: "C-Compiler Visualization",
    description: "Built a custom C++17 compiler engine from scratch and wired it up to an interactive dashboard to visualize the syntax trees in real-time.",
    tech: ["C++17", "React", "FastAPI"],
    link: "https://github.com/Bishesh-ops/software-engineering-project"
  },
  {
    title: "Personal Finance Tracker",
    description: "A full-stack financial dashboard utilizing secure authentication and deployed via a containerized pipeline.",
    tech: ["Next.js", "PostgreSQL", "Docker"],
    link: "https://github.com/Bishesh-ops/Finance-Tracking-App"
  }
 ]
};