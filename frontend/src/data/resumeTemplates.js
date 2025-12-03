export const fresherResume = {
    personalInfo: {
        fullName: "Jordan Lee",
        email: "jordan.lee@example.com",
        phone: "+1 (555) 987-6543",
        linkedin: "linkedin.com/in/jordanlee",
        portfolio: "jordanlee.dev",
        address: "New York, NY",
        summary: "Motivated Computer Science graduate with a strong foundation in software development principles. Passionate about building user-centric web applications and eager to launch a career as a Full Stack Developer. Quick learner with excellent problem-solving skills and a collaborative mindset."
    },
    experience: [], // Minimal experience for fresher
    education: [
        {
            id: "1",
            degree: "Bachelor of Science in Computer Science",
            school: "State University of New York",
            location: "Albany, NY",
            startDate: "2019-09",
            endDate: "2023-05"
        }
    ],
    skills: [
        { category: "Languages", items: ["JavaScript (ES6+)", "Python", "Java", "HTML5", "CSS3"] },
        { category: "Frameworks", items: ["React", "Node.js", "Express"] },
        { category: "Tools", items: ["Git", "VS Code", "MongoDB"] }
    ],
    projects: [
        {
            id: "1",
            title: "Task Management App",
            link: "github.com/jordanlee/task-manager",
            description: "Developed a full-stack task management application using MERN stack. Implemented user authentication, CRUD operations, and real-time updates."
        },
        {
            id: "2",
            title: "Weather Dashboard",
            link: "github.com/jordanlee/weather-app",
            description: "Built a responsive weather dashboard that fetches real-time data from OpenWeatherMap API. Features include location search and 5-day forecast."
        }
    ],
    certifications: [
        {
            id: "1",
            name: "Full Stack Web Development Bootcamp",
            issuer: "Udemy",
            date: "2023-08"
        }
    ]
};

export const seniorResume = {
    personalInfo: {
        fullName: "Sarah Jenkins",
        email: "sarah.jenkins@example.com",
        phone: "+1 (555) 234-5678",
        linkedin: "linkedin.com/in/sarahjenkins",
        portfolio: "sarahjenkins.io",
        address: "Seattle, WA",
        summary: "Results-driven Senior Software Engineer with 8+ years of experience in designing and architecting scalable distributed systems. Expert in cloud-native technologies, microservices, and DevOps practices. Proven track record of leading cross-functional teams and mentoring junior developers."
    },
    experience: [
        {
            id: "1",
            jobTitle: "Staff Software Engineer",
            company: "CloudScale Systems",
            location: "Seattle, WA",
            startDate: "2019-06",
            endDate: "Present",
            current: true,
            description: "Architected and led the migration of core platform services to AWS, resulting in 99.99% availability and 30% cost reduction. Mentored a team of 5 engineers and established coding standards and best practices."
        },
        {
            id: "2",
            jobTitle: "Senior Backend Developer",
            company: "DataFlow Inc.",
            location: "Austin, TX",
            startDate: "2016-03",
            endDate: "2019-05",
            current: false,
            description: "Designed and implemented high-performance data processing pipelines using Apache Kafka and Spark. Optimized database queries, reducing latency by 60%."
        },
        {
            id: "3",
            jobTitle: "Software Engineer",
            company: "WebSolutions LLC",
            location: "Austin, TX",
            startDate: "2014-07",
            endDate: "2016-02",
            current: false,
            description: "Developed and maintained RESTful APIs for a high-traffic e-commerce platform. Collaborated with product managers to define requirements and deliver features on time."
        }
    ],
    education: [
        {
            id: "1",
            degree: "Master of Science in Software Engineering",
            school: "University of Washington",
            location: "Seattle, WA",
            startDate: "2012-09",
            endDate: "2014-06"
        }
    ],
    skills: [
        { category: "Backend", items: ["Java", "Go", "Python", "Node.js"] },
        { category: "Cloud & DevOps", items: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"] },
        { category: "Databases", items: ["PostgreSQL", "DynamoDB", "Redis"] },
        { category: "Architecture", items: ["Microservices", "Event-Driven", "System Design"] }
    ],
    projects: [], // Senior resumes often focus more on work experience
    certifications: [
        {
            id: "1",
            name: "AWS Certified Solutions Architect - Professional",
            issuer: "Amazon Web Services",
            date: "2022-11"
        }
    ]
};
