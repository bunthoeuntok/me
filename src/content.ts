// The single source of profile content. The game and the Résumé view both read
// from here; update a job, skill or link in this file and nothing else.

export interface Job {
  company: string;
  role: string;
  period: string;
  /** One-line summary, shown on the job's card in the game. */
  summary: string;
  /** Full detail, shown in the Résumé view. */
  highlights: string[];
}

export interface Project {
  title: string;
  description: string;
  githubUrl: string;
  liveUrl?: string;
}

export interface Education {
  school: string;
  qualification: string;
  period: string;
}

export interface Certificate {
  name: string;
  issuer: string;
  year: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface Contacts {
  phone: string;
  email: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface Profile {
  name: string;
  title: string;
  summary: string;
  /** Most recent first. */
  jobs: Job[];
  /** At least one: the game's Projects screen features the first. */
  projects: [Project, ...Project[]];
  skills: string[];
  education: Education[];
  certificates: Certificate[];
  languages: Language[];
  contacts: Contacts;
}

export const profile: Profile = {
  name: "Bunthoeun Tok",
  title: "Full-Stack Developer",
  summary:
    "Full-stack developer with 5+ years of experience in C# .NET, ASP.NET MVC, Vue.js & React. Delivered ERP, POS & web solutions across the full development lifecycle.",
  jobs: [
    {
      company: "Techbodia",
      role: "Full-stack Developer",
      period: "Mar 2023 – Present",
      summary:
        "ASP.NET MVC & .NET Core APIs, SQL Server optimization, GitLab CI/CD pipelines. Code reviews & stakeholder coordination.",
      highlights: [],
    },
    {
      company: "Wintech",
      role: "Web Developer",
      period: "2019 – 2022",
      summary:
        "Built school mgmt, POS & registration portals using PHP, Laravel & Vue.js. Created RESTful APIs for mobile apps.",
      highlights: [],
    },
    {
      company: "Blue Technology",
      role: "NAV Consultant",
      period: "Jan – Apr 2019",
      summary:
        "Customized Microsoft Dynamics NAV (ERP) for retail & distribution clients. Bridged business requirements and dev teams.",
      highlights: [],
    },
  ],
  projects: [
    {
      title: "Report Build",
      description: "Customize report layouts and generate documents with real data.",
      githubUrl: "https://github.com/bunthoeuntok",
    },
  ],
  skills: ["C# .NET", "ASP.NET MVC", "Vue.js", "React", "SQL Server", "Laravel"],
  education: [],
  certificates: [],
  languages: [],
  contacts: {
    phone: "(+855) 86 744 606",
    email: "bunthoeun.code@gmail.com",
    githubUrl: "https://github.com/bunthoeuntok",
    linkedinUrl: "https://www.linkedin.com/in/bunthoeun-tok",
  },
};
