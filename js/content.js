/* ==========================================================================
   SITE CONTENT
   Almost everything you'd want to change lives in this file. The projects,
   experience, skills and terminal commands are all generated from it.

   Adding a screenshot to a project flow:
     1. Drop the image in assets/projects/
     2. Set `image` on that flow step, e.g. image: "assets/projects/wildfire-admin.png"
     3. Optionally add `alt` to describe the image for screen readers.
   Steps with `image: null` show the animated NO SIGNAL screen instead.
   ========================================================================== */

window.PORTFOLIO = {
  name: "Walton Prest",
  title: "Software Engineer",
  location: "Knoxville, TN",
  email: "wprest@icloud.com",

  // Anything added here appears in the contact section and the terminal.
  links: [
    // { label: "GitHub", url: "https://github.com/your-name" },
    // { label: "LinkedIn", url: "https://www.linkedin.com/in/your-name" },
  ],

  // The lines that get typed out on the big monitor.
  taglines: [
    "software engineer",
    "C# / ASP.NET MVC / SQL",
    "full-stack web applications",
    "UTK computer science, class of 2026",
    "cybersecurity + business minors",
  ],

  /* ------------------------------------------------------------------------
     PROJECTS
     banner: "fire" | "awning"   the animated header on the project window
     widget: "migration" | "receipt"   the toy in the lower right of the window
     ------------------------------------------------------------------------ */
  projects: [
    {
      id: "wildfire",
      file: "WILDFIRE.EXE",
      name: "Wildfire Mitigation App",
      short: "Wildfire Mitigation App",
      disk: "Wildfire App",
      kicker: "Vantage Point Solutions",
      role: "Software Development Intern",
      dates: "April 2025 – August 2026",
      where: "Knoxville, TN (Remote)",
      accent: "#f2542d",
      onAccent: "#14110d",
      banner: "fire",
      widget: "migration",
      summary:
        "A full-stack web application behind customer wildfire mitigation assessments and the admin workflows that review them. It changed over from WordPress to a complete, in-house application with over 800 user accounts.",
      stack: ["C#", "Entity Framework", "SQL", "HTML", "CSS"],
      highlights: [
        "Developed the full-stack application in C#, Entity Framework, SQL, HTML and CSS, supporting customer assessments and administrative workflows.",
        "Designed and implemented database-driven features for over 800 user accounts, assessment data and admin review processes.",
        "Turned business requirements into application features through development reviews, troubleshooting and refining the system architecture.",
        "Debugged and tested application functionality, resolving defects and improving the experience for users and admins.",
      ],
      flow: [
        {
          title: "User accounts",
          caption: "Database-driven features for over 800 user accounts, in a complete in-house application instead of WordPress.",
          image: null,
        },
        {
          title: "Assessments",
          caption: "Customer wildfire mitigation assessments and the data behind them.",
          image: null,
        },
        {
          title: "Admin review",
          caption: "The admin side of the application, where assessments are reviewed and workflows are managed.",
          image: null,
        },
      ],
    },
    {
      id: "storefront",
      file: "STORE.EXE",
      name: "Storefront + Admin Dashboard",
      short: "Senior Design Storefront",
      disk: "Senior Design",
      kicker: "Senior Design, University of Tennessee",
      role: "Full-Stack Software Engineer",
      dates: "August 2025 – May 2026",
      where: "Knoxville, TN",
      accent: "#ff5fa8",
      onAccent: "#14110d",
      banner: "awning",
      widget: "receipt",
      summary:
        "A full-stack e-commerce application built for a Knoxville business, with a customer storefront on one side and an admin dashboard on the other. Both were deployed as their own websites.",
      stack: ["C#", "Python", "Firebase", "CSS"],
      highlights: [
        "Developed a full-stack e-commerce web application in C#, Python, Firebase and CSS, including a customer storefront and admin dashboard.",
        "Engineered database functionality for inventory and employee management, product listings, order tracking, and vendor and volunteer coordination.",
        "Deployed both the customer website and the admin website.",
        "Worked directly with the business owners to gather requirements and prioritize features, with the team given technical freedom to design the dashboard.",
      ],
      flow: [
        { title: "Storefront", caption: "The customer-facing website.", image: null },
        { title: "Product listings", caption: "Products as customers browse them, managed from the database.", image: null },
        { title: "Order tracking", caption: "Following orders once they've been placed.", image: null },
        { title: "Admin dashboard", caption: "The separate admin website. The team had technical freedom to design this one.", image: null },
        { title: "Inventory + staff", caption: "Inventory and employee management for the business.", image: null },
        { title: "Vendors + volunteers", caption: "Coordinating the vendors and volunteers the business works with.", image: null },
      ],
      receipt: [
        ["Customer storefront", 1],
        ["Admin dashboard", 1],
        ["Product listings", 1],
        ["Inventory mgmt", 1],
        ["Employee mgmt", 1],
        ["Order tracking", 1],
        ["Vendor coordination", 1],
        ["Volunteer coordination", 1],
      ],
    },
  ],

  /* ------------------------------------------------------------------------
     EXPERIENCE
     from / to are [year, month] and position the branches on the git graph.
     lane is the vertical position on the graph (top to bottom).
     ------------------------------------------------------------------------ */
  experience: [
    {
      id: "vantage",
      branch: "vantage-point",
      company: "Vantage Point Solutions",
      role: "Software Development Intern",
      dates: "April 2025 – August 2026",
      where: "Knoxville, Tennessee (Remote)",
      from: [2025, 4],
      to: [2026, 8],
      lane: 176,
      color: "#d4351c",
      project: "wildfire",
      bullets: [
        "Developed a full-stack wildfire mitigation web application using C#, Entity Framework, SQL, HTML and CSS, supporting customer assessments and administrative workflows.",
        "Designed and implemented database-driven features for over 800 user accounts, assessment data and admin review processes, changing over from WordPress to a complete, in-house web application.",
        "Worked through business requirements into application features through development reviews, troubleshooting technical issues and refining system architecture.",
        "Debugged and tested application functionality, resolving defects and improving the user and admin experience.",
      ],
    },
    {
      id: "stowers",
      branch: "stowers-cat",
      company: "Stowers Caterpillar Machinery Corporation",
      role: "Information Technology Intern",
      dates: "May 2025 – August 2025",
      where: "Knoxville, Tennessee",
      from: [2025, 5],
      to: [2025, 8],
      lane: 228,
      color: "#c26a00",
      bullets: [
        "Diagnosed and resolved hardware, software, network and account access issues across all devices, from in-office to field employees, and worked on internal business applications.",
        "Supported device configuration, system maintenance, company software updates and new technology rollouts, working tickets through remote connections and in person.",
      ],
    },
    {
      id: "crye",
      branch: "crye-leike",
      company: "Crye-Leike Real Estate Services",
      role: "Information Technology Consultant",
      dates: "June 2022 – July 2026",
      where: "Memphis, Tennessee",
      from: [2022, 6],
      to: [2026, 7],
      lane: 44,
      color: "#2353d6",
      bullets: [
        "Troubleshot operating system, software, device and connectivity issues for a real estate office, maintaining reliable daily operations, and configured new software and devices for all employees.",
        "Communicated technical solutions in clear, practical terms to help users and reduce recurring issues.",
      ],
    },
  ],

  // Project branch drawn on the git graph alongside the jobs.
  graphExtras: [
    {
      id: "senior",
      branch: "senior-design",
      dates: "Aug 2025 – May 2026",
      from: [2025, 8],
      to: [2026, 5],
      lane: 280,
      color: "#c81f7c",
      dashed: true,
      project: "storefront",
    },
  ],

  education: {
    school: "The University of Tennessee, Knoxville",
    degree: "Bachelor of Science in Computer Science",
    minors: "Minors in Cybersecurity and Business Administration",
    graduated: "May 2026",
    graduatedAt: [2026, 5],
    tag: "v2026.05",
    tagLabel: "BS Computer Science",
    activity:
      "Online Engagement Officer and Volunteer Coordinator of the UTK Women's Health Advocacy Team, August 2024 – May 2026. Award recipient of Best New Campus Organization.",
  },

  /* ------------------------------------------------------------------------
     SKILLS
     used: project ids this skill shows up in. note: extra line for the readout.
     side: which side of the circuit board the group sits on.
     ------------------------------------------------------------------------ */
  skills: [
    {
      group: "Languages",
      side: "left",
      items: [
        { name: "C#", used: ["wildfire", "storefront"] },
        { name: "Java" },
        { name: "Python", used: ["storefront"] },
        { name: "C++" },
        { name: "SQL", used: ["wildfire"] },
        { name: "HTML", used: ["wildfire"] },
        { name: "CSS", used: ["wildfire", "storefront"] },
      ],
    },
    {
      group: "Frameworks",
      side: "left",
      items: [
        { name: "ASP.NET MVC", note: "Core part of my stack." },
        { name: "Entity Framework", used: ["wildfire"] },
      ],
    },
    {
      group: "Databases",
      side: "left",
      items: [
        { name: "SQL Server" },
        { name: "SSMS" },
        { name: "Firebase Studio", used: ["storefront"] },
      ],
    },
    {
      group: "Developer Tools",
      side: "right",
      items: [{ name: "Git" }, { name: "Azure DevOps" }, { name: "Visual Studio" }],
    },
    {
      group: "Operating Systems",
      side: "right",
      items: [{ name: "Windows" }, { name: "Linux" }, { name: "MacOS" }],
    },
    {
      group: "Other Areas",
      side: "right",
      items: [
        { name: "Application Security", note: "Paired with a minor in Cybersecurity." },
        { name: "Data Analysis" },
        { name: "UI Design", used: ["storefront"] },
      ],
    },
  ],
};
