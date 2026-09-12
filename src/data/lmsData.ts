import { LMSSubjectItem, LMSMaterial, LMSAssignment, LMSVideoLecture } from '../types';

export const DEFAULT_LMS_SUBJECTS: LMSSubjectItem[] = [
  {
    id: 'subj_cs_170p',
    subjectCode: '24SACS170P',
    subjectName: 'Cyber Security Techniques and Tools',
    semester: 'Sem - 5',
    type: 'Practical',
    facultyName: 'Prof. Rajesh Sharma',
    facultyEmail: 'rajesh.sharma@edux.edu.in',
    credits: 2,
    roomNo: 'Cyber Defense Lab 2',
    building: 'IT Block, 3rd Floor',
    syllabusProgress: 72,
    totalMaterials: 8,
    totalAssignments: 4,
    totalVideos: 6,
    modules: [
      {
        moduleNo: 1,
        title: 'Network Vulnerability Scanning & Reconnaissance',
        hours: 12,
        description: 'Hands-on practice with Nmap, Wireshark packet dissection, and port scanning methodologies.',
        topics: ['Nmap Port Scanning Commands', 'Wireshark Protocol Analysis', 'TCP/UDP Handshake Inspection', 'Zenmap Graphical Mapping'],
        isCompleted: true
      },
      {
        moduleNo: 2,
        title: 'Penetration Testing Tools & Metasploit Framework',
        hours: 14,
        description: 'Configuring exploit payloads, vulnerability assessment with Nessus, and OpenVAS scans.',
        topics: ['Metasploit Console (msfconsole)', 'Payload Selection & Handlers', 'Nessus Vulnerability Reports', 'Privilege Escalation Techniques'],
        isCompleted: true
      },
      {
        moduleNo: 3,
        title: 'Web Application Security & OWASP Top 10 Exploitation',
        hours: 16,
        description: 'Burp Suite proxy interception, SQL Injection exploitation, and Cross-Site Scripting (XSS) defense.',
        topics: ['Burp Suite Community Edition Setup', 'SQLmap Database Dump Commands', 'XSS Stored vs Reflected Labs', 'CSRF Token Validation'],
        isCompleted: false
      },
      {
        moduleNo: 4,
        title: 'Cryptography & Digital Forensics Toolkits',
        hours: 10,
        description: 'Steganography analysis, hash cracking using Hashcat/John the Ripper, and Autopsy forensic triaging.',
        topics: ['MD5 & SHA-256 Hashing Labs', 'John The Ripper Dictionary Attacks', 'Steghide Hidden Messages Extraction', 'Autopsy Hard Drive Image Analysis'],
        isCompleted: false
      }
    ]
  },
  {
    id: 'subj_cs_170t',
    subjectCode: '24SACS170T',
    subjectName: 'Cyber Security Techniques and Tools',
    semester: 'Sem - 5',
    type: 'Theory',
    facultyName: 'Prof. Rajesh Sharma',
    facultyEmail: 'rajesh.sharma@edux.edu.in',
    credits: 4,
    roomNo: 'Lecture Hall 204',
    building: 'Main Academic Wing',
    syllabusProgress: 80,
    totalMaterials: 11,
    totalAssignments: 3,
    totalVideos: 8,
    modules: [
      {
        moduleNo: 1,
        title: 'Foundations of Information Security & Threat Landscape',
        hours: 10,
        description: 'CIA Triad (Confidentiality, Integrity, Availability), threat actors, attack vectors, and defense-in-depth.',
        topics: ['CIA Triad & Non-Repudiation Principles', 'Malware Taxonomy (Ransomware, Worms, Trojans)', 'Social Engineering & Phishing Tactics', 'Zero-Trust Architecture Model'],
        isCompleted: true
      },
      {
        moduleNo: 2,
        title: 'Symmetric & Asymmetric Cryptographic Algorithms',
        hours: 15,
        description: 'Mathematical foundations of AES, DES, RSA public-key cryptosystems, and Diffie-Hellman Key Exchange.',
        topics: ['AES-256 & DES Block Cipher Modes (CBC, GCM)', 'RSA Key Generation & Prime Factorization', 'Diffie-Hellman Key Agreement Protocol', 'Digital Signatures & PKI Certificates'],
        isCompleted: true
      },
      {
        moduleNo: 3,
        title: 'Network & Perimeter Defense Architectures',
        hours: 15,
        description: 'Firewall topologies, Stateful vs Next-Gen Firewalls, IDS/IPS anomaly detection, and VPN tunneling.',
        topics: ['Packet Filtering vs Stateful Inspection', 'Snort IDS Rule Configuration', 'IPSec & SSL/TLS Handshake Protocols', 'DMZ & Micro-segmentation Design'],
        isCompleted: false
      },
      {
        moduleNo: 4,
        title: 'Cyber Laws, Governance & Compliance Standards',
        hours: 10,
        description: 'IT Act 2000 & 2008 amendments, ISO/IEC 27001 ISMS policies, GDPR data privacy compliance, and incident response.',
        topics: ['Indian IT Act 2000 Sections 43 & 66', 'ISO 27001 Security Controls Framework', 'NIST Cybersecurity Incident Response Lifecycle', 'Cyber Insurance & Liability Assessment'],
        isCompleted: false
      }
    ]
  },
  {
    id: 'subj_cs_180t',
    subjectCode: '24SACS180T',
    subjectName: 'Cloud Security',
    semester: 'Sem - 5',
    type: 'Theory',
    facultyName: 'Dr. Vivek Sengupta',
    facultyEmail: 'v.sengupta@edux.edu.in',
    credits: 3,
    roomNo: 'Room 305',
    building: 'IT Block',
    syllabusProgress: 65,
    totalMaterials: 9,
    totalAssignments: 3,
    totalVideos: 5,
    modules: [
      {
        moduleNo: 1,
        title: 'Cloud Architecture & Shared Responsibility Model',
        hours: 10,
        description: 'IaaS, PaaS, SaaS security models and AWS/GCP/Azure tenant isolation.',
        topics: ['NIST Cloud Computing Definitions', 'Cloud Shared Responsibility Matrix', 'Hypervisor Security & VM Escape Prevention', 'Multi-Tenancy Isolation Challenges'],
        isCompleted: true
      },
      {
        moduleNo: 2,
        title: 'Cloud IAM & Least Privilege Enforcement',
        hours: 12,
        description: 'Role-based access control (RBAC), attribute-based access control (ABAC), MFA, and federated SSO.',
        topics: ['AWS IAM Policies & Permission Boundaries', 'OIDC & SAML 2.0 Identity Federation', 'Privileged Access Management (PAM)', 'Zero-Standing-Privilege Strategies'],
        isCompleted: true
      },
      {
        moduleNo: 3,
        title: 'Cloud Data Protection & Storage Encryption',
        hours: 12,
        description: 'Client-side vs Server-side encryption, Envelope Encryption, KMS key rotation, and data masking.',
        topics: ['KMS & Cloud Hardware Security Modules (HSM)', 'S3 Bucket Security Policies & Public Access Blocks', 'Homomorphic Encryption Concepts', 'Data Loss Prevention (DLP) in Cloud'],
        isCompleted: false
      },
      {
        moduleNo: 4,
        title: 'Container & Kubernetes Security (K8s / DevSecOps)',
        hours: 14,
        description: 'Docker image scanning, Kubernetes pod security standards, CI/CD pipeline security, and service mesh encryption.',
        topics: ['Docker Container Vulnerability Triage (Trivy)', 'Kubernetes RBAC & Network Policies', 'HashiCorp Vault Secrets Management', 'DevSecOps Automated Pipeline Gates'],
        isCompleted: false
      }
    ]
  },
  {
    id: 'subj_cs_192p',
    subjectCode: '24SACS192P',
    subjectName: 'Programming in JAVA',
    semester: 'Sem - 5',
    type: 'Practical',
    facultyName: 'Mrs. Sunita Verma',
    facultyEmail: 'sunita.verma@edux.edu.in',
    credits: 2,
    roomNo: 'Java Programming Lab 1',
    building: 'Computing Annex',
    syllabusProgress: 88,
    totalMaterials: 10,
    totalAssignments: 5,
    totalVideos: 7,
    modules: [
      {
        moduleNo: 1,
        title: 'Object-Oriented Programming Constructs in Java',
        hours: 12,
        description: 'Class blueprints, inheritance polymorphism, abstract classes, and custom interface implementations.',
        topics: ['Method Overloading vs Overriding Labs', 'Abstract Classes & Interface Contracts', 'Package Hierarchy & Access Modifiers', 'Garbage Collection & Finalize Demonstration'],
        isCompleted: true
      },
      {
        moduleNo: 2,
        title: 'Exception Handling & Robust File I/O Streams',
        hours: 12,
        description: 'Try-with-resources, custom unchecked exceptions, byte vs character streams, and object serialization.',
        topics: ['Custom Business Exception Classes', 'Buffered I/O & File Readers/Writers', 'ObjectOutputStream Serialization Labs', 'NIO.2 Path & Files Operations'],
        isCompleted: true
      },
      {
        moduleNo: 3,
        title: 'Java Collections Framework & Generics',
        hours: 15,
        description: 'List, Set, Map hierarchies, Comparable/Comparator interfaces, and Java 8 Lambda Streams.',
        topics: ['ArrayList vs LinkedList Benchmarking', 'HashMap Collision Handling & TreeMap', 'Custom Generic Class & Wildcards (? super / extends)', 'Java Stream API: filter(), map(), reduce()'],
        isCompleted: true
      },
      {
        moduleNo: 4,
        title: 'Multithreading, Concurrency & JDBC Database Connectivity',
        hours: 15,
        description: 'Thread synchronization, ExecutorService thread pools, JDBC prepared statements, and CRUD UI apps.',
        topics: ['Thread Life Cycle & Synchronized Blocks', 'Deadlock Simulation & Prevention', 'JDBC MySQL Connection Pooling', 'JavaFX / Swing GUI Desktop Integration'],
        isCompleted: false
      }
    ]
  },
  {
    id: 'subj_cs_192t',
    subjectCode: '24SACS192T',
    subjectName: 'Programming in JAVA',
    semester: 'Sem - 5',
    type: 'Theory',
    facultyName: 'Mrs. Sunita Verma',
    facultyEmail: 'sunita.verma@edux.edu.in',
    credits: 4,
    roomNo: 'Lecture Hall 102',
    building: 'Main Academic Wing',
    syllabusProgress: 85,
    totalMaterials: 12,
    totalAssignments: 4,
    totalVideos: 9,
    modules: [
      {
        moduleNo: 1,
        title: 'Java Runtime Environment (JVM Architecture)',
        hours: 10,
        description: 'Class Loader subsystems, JVM Memory Areas (Heap, Stack, Method Area, PC Registers), and Bytecode execution.',
        topics: ['Write Once Run Anywhere (WORA) Engine', 'JVM ClassLoader Delegation Model', 'Garbage Collection Algorithms (G1, ZGC)', 'JIT Compiler & HotSpot Optimization'],
        isCompleted: true
      },
      {
        moduleNo: 2,
        title: 'Advanced OOP & Design Patterns in Java',
        hours: 15,
        description: 'SOLID principles, Singleton, Factory, Observer, and Builder design patterns in enterprise Java.',
        topics: ['SOLID Principles Code Review', 'Singleton Pattern with Thread Safety', 'Factory & Abstract Factory Implementations', 'Observer Pattern for Event Listeners'],
        isCompleted: true
      },
      {
        moduleNo: 3,
        title: 'Java Functional Programming & Modern Features (Java 17/21)',
        hours: 15,
        description: 'Records, Pattern Matching for switch, Sealed Classes, Virtual Threads (Project Loom), and Optional API.',
        topics: ['Java Records & Immutability', 'Sealed Classes & Permitted Subclasses', 'Pattern Matching for instanceof & switch', 'Virtual Threads vs OS Platform Threads'],
        isCompleted: true
      },
      {
        moduleNo: 4,
        title: 'Enterprise Frameworks Overview (Spring Boot Basics)',
        hours: 10,
        description: 'Dependency Injection (IoC), Spring Beans lifecycle, and RESTful API controller design.',
        topics: ['Inversion of Control (IoC) Containers', '@Autowired & @Component Annotations', 'Building REST Controllers with @GetMapping', 'Spring Data JPA ORM Mapping Basics'],
        isCompleted: false
      }
    ]
  },
  {
    id: 'subj_cs_202t',
    subjectCode: '24SACS202T',
    subjectName: 'Digital Forensic',
    semester: 'Sem - 5',
    type: 'Theory',
    facultyName: 'Dr. Anand Ramanathan',
    facultyEmail: 'anand.r@edux.edu.in',
    credits: 3,
    roomNo: 'Room 208',
    building: 'IT Block',
    syllabusProgress: 60,
    totalMaterials: 7,
    totalAssignments: 3,
    totalVideos: 5,
    modules: [
      {
        moduleNo: 1,
        title: 'Digital Forensic Fundamentals & Chain of Custody',
        hours: 10,
        description: 'Locard Exchange Principle, legal admissibility of electronic evidence (Section 65B), and evidence sealing.',
        topics: ['Locard Principle in Digital Domains', 'Evidence Handling & Chain of Custody Forms', 'Section 65B Indian Evidence Act Certificate', 'Forensic Acquisition with Write Blockers'],
        isCompleted: true
      },
      {
        moduleNo: 2,
        title: 'Disk & File System Forensics',
        hours: 14,
        description: 'FAT32, NTFS, EXT4 structures, Master File Table (MFT) parsing, Slack space analysis, and deleted file carving.',
        topics: ['NTFS $MFT, $LogFile & $UsnJrnl Artifacts', 'File Carving by Hex Header/Footer Signatures', 'Volume Shadow Copies & System Restore Points', 'RAID Array Reassembly & Bit-Stream Images (E01/DD)'],
        isCompleted: true
      },
      {
        moduleNo: 3,
        title: 'Operating System & Memory Forensics (RAM)',
        hours: 14,
        description: 'Volatility 3 framework, Windows Registry hives, Prefetch execution traces, and Browser artifact analysis.',
        topics: ['RAM Acquisition with LiME & FTK Imager', 'Volatility Plugins (pslist, malfind, netscan)', 'Windows Registry SAM & SOFTWARE Analysis', 'LNK Shortcuts & Jump Lists Timelines'],
        isCompleted: false
      },
      {
        moduleNo: 4,
        title: 'Mobile Forensics & Network Triage',
        hours: 10,
        description: 'Android/iOS physical vs logical extraction, SQLite database forensics (WhatsApp/SMS), and PCAP network replay.',
        topics: ['Android ADB & JTAG Extraction Overview', 'WhatsApp msgstore.db SQLite Decryption', 'Call Detail Records (CDR) Mapping & Cell Towers', 'Network Forensics: Reconstructing Email & HTTP Streams'],
        isCompleted: false
      }
    ]
  },
  {
    id: 'subj_cs_210p',
    subjectCode: '24SACS210P',
    subjectName: 'Minor Project',
    semester: 'Sem - 5',
    type: 'Project',
    facultyName: 'Project Evaluation Committee',
    facultyEmail: 'projects.hod@edux.edu.in',
    credits: 4,
    roomNo: 'Project Incubation Center',
    building: 'Innovation & Research Wing',
    syllabusProgress: 50,
    totalMaterials: 6,
    totalAssignments: 3,
    totalVideos: 4,
    modules: [
      {
        moduleNo: 1,
        title: 'Problem Formulation, Literature Survey & SRS Document',
        hours: 15,
        description: 'Identifying industry problems, IEEE paper survey, System Requirement Specification (SRS), and feasibility analysis.',
        topics: ['IEEE Research Paper Survey Synthesis', 'SRS Document in IEEE Format (UML, Use-Cases)', 'Architecture Design & Data Flow Diagrams (DFD)', 'Milestone Tracking & Git Repository Setup'],
        isCompleted: true
      },
      {
        moduleNo: 2,
        title: 'System Design & Prototype Development (Sprint 1)',
        hours: 25,
        description: 'Database schema design, core backend logic implementation, API endpoints, and initial UI wireframes.',
        topics: ['ER Diagrams & 3NF Database Normalization', 'RESTful API Contracts & Postman Collections', 'Frontend Component Wireframing (Figma)', 'Unit Testing & Continuous Integration Setup'],
        isCompleted: true
      },
      {
        moduleNo: 3,
        title: 'Integration, Security Hardening & Beta Testing (Sprint 2)',
        hours: 20,
        description: 'End-to-end data flow, authentication implementation, edge case bug fixes, and security audit.',
        topics: ['JWT Authentication & Password Hashing', 'Load Testing & Query Optimization', 'Cross-Browser & Responsive Validation', 'Plagiarism Check & Code Documentation'],
        isCompleted: false
      },
      {
        moduleNo: 4,
        title: 'Final Demonstration, Report Preparation & Viva Voce',
        hours: 15,
        description: 'Final project report submission, PPT presentation deck, live system deployment, and external examiner viva.',
        topics: ['Final Project Thesis Binding & Formatting', 'Demonstration Video & Live Cloud Deployment', 'Defense Slide Deck Preparation', 'External Examiner Viva Voce Rubric'],
        isCompleted: false
      }
    ]
  },
  // Senior Secondary Subjects
  {
    id: 'subj_phy_042',
    subjectCode: '042',
    subjectName: 'Physics (Theory & Practical)',
    semester: 'Class 12 - Term 1',
    type: 'Core',
    facultyName: 'Mr. Rajesh Sharma',
    facultyEmail: 'rajesh.sharma@stxaviers.edu.in',
    credits: 4,
    roomNo: 'Physics Lab 1 / Room 101',
    building: 'Senior Science Wing',
    syllabusProgress: 82,
    totalMaterials: 14,
    totalAssignments: 4,
    totalVideos: 8,
    modules: [
      {
        moduleNo: 1,
        title: 'Electrostatics & Electric Fields',
        hours: 14,
        description: 'Coulomb law, electric field lines, electric dipole, and Gauss theorem applications.',
        topics: ['Coulomb Law & Superposition Principle', 'Electric Dipole in Uniform Electric Field', 'Gauss Law & Field due to Infinite Wire/Sheets', 'Electric Potential & Equipotential Surfaces'],
        isCompleted: true
      },
      {
        moduleNo: 2,
        title: 'Current Electricity & Circuit Laws',
        hours: 12,
        description: 'Ohm law, drift velocity, Kirchhoff laws, Wheatstone bridge, and potentiometer.',
        topics: ['Drift Velocity & Electrical Resistivity', 'Kirchhoff Voltage & Current Laws', 'Wheatstone Bridge Balance Condition', 'Cells in Series and Parallel'],
        isCompleted: true
      },
      {
        moduleNo: 3,
        title: 'Magnetic Effects of Current & Magnetism',
        hours: 14,
        description: 'Biot-Savart law, Ampere circuital law, moving coil galvanometer, and Earth magnetism.',
        topics: ['Biot-Savart Law for Circular Loops', 'Ampere Law for Solenoids and Toroids', 'Moving Coil Galvanometer Conversion to Ammeter/Voltmeter', 'Bar Magnet & Magnetic Dipole Moment'],
        isCompleted: false
      }
    ]
  },
  {
    id: 'subj_chem_043',
    subjectCode: '043',
    subjectName: 'Chemistry (Theory & Lab)',
    semester: 'Class 12 - Term 1',
    type: 'Core',
    facultyName: 'Mrs. Sunita Verma',
    facultyEmail: 'sunita.verma@stxaviers.edu.in',
    credits: 4,
    roomNo: 'Chemistry Lab / Room 101',
    building: 'Senior Science Wing',
    syllabusProgress: 78,
    totalMaterials: 12,
    totalAssignments: 4,
    totalVideos: 6,
    modules: [
      {
        moduleNo: 1,
        title: 'Solutions & Colligative Properties',
        hours: 12,
        description: 'Raoult law, ideal/non-ideal solutions, osmotic pressure, and Van\'t Hoff factor.',
        topics: ['Raoult Law for Volatile Liquids', 'Elevation of Boiling Point & Depression of Freezing Point', 'Osmotic Pressure & Reverse Osmosis', 'Van\'t Hoff Factor Abnormal Molar Masses'],
        isCompleted: true
      },
      {
        moduleNo: 2,
        title: 'Electrochemistry & Chemical Kinetics',
        hours: 14,
        description: 'Nernst equation, Kohlrausch law, rate constants, and Arrhenius activation energy.',
        topics: ['Galvanic Cells & Nernst Equation Calculations', 'Conductivity & Kohlrausch Law of Independent Migration', 'Zero & First Order Rate Laws and Half-life', 'Arrhenius Equation & Catalyst Impact'],
        isCompleted: true
      }
    ]
  },
  {
    id: 'subj_math_041',
    subjectCode: '041',
    subjectName: 'Mathematics',
    semester: 'Class 12 - Term 1',
    type: 'Core',
    facultyName: 'Mr. Vikram Singh',
    facultyEmail: 'vikram.singh@stxaviers.edu.in',
    credits: 4,
    roomNo: 'Room 101',
    building: 'Senior Science Wing',
    syllabusProgress: 86,
    totalMaterials: 15,
    totalAssignments: 5,
    totalVideos: 9,
    modules: [
      {
        moduleNo: 1,
        title: 'Matrices & Determinants',
        hours: 12,
        description: 'Matrix algebra, inverse by adjoint method, solving linear equations, and properties of determinants.',
        topics: ['Matrix Multiplication & Transpose Properties', 'Adjoint & Inverse of 3x3 Matrices', 'Cramer Rule vs Matrix Inversion Method', 'Consistency of Linear System Equations'],
        isCompleted: true
      },
      {
        moduleNo: 2,
        title: 'Calculus: Continuity & Differentiability',
        hours: 16,
        description: 'Chain rule, implicit differentiation, logarithmic differentiation, and parametric forms.',
        topics: ['Continuity at a Point & Piecewise Functions', 'Chain Rule & Derivative of Inverse Trig Functions', 'Logarithmic Differentiation for Variable Powers', 'Second Order Derivatives'],
        isCompleted: true
      }
    ]
  },
  {
    id: 'subj_cs_083',
    subjectCode: '083',
    subjectName: 'Computer Science',
    semester: 'Class 12 - Term 1',
    type: 'Core',
    facultyName: 'Mr. Amit Kumar',
    facultyEmail: 'amit.kumar@stxaviers.edu.in',
    credits: 4,
    roomNo: 'Computer Lab 1',
    building: 'IT Wing, 2nd Floor',
    syllabusProgress: 90,
    totalMaterials: 13,
    totalAssignments: 4,
    totalVideos: 7,
    modules: [
      {
        moduleNo: 1,
        title: 'Python Functions, Scope & Recursion',
        hours: 10,
        description: 'Positional vs default arguments, global vs local variables, and recursive algorithms.',
        topics: ['Function Definition & Return Tuples', 'Mutable vs Immutable Arguments Passing', 'Global Keyword & Scope Resolution (LEGB Rule)', 'Recursive Factorial & Fibonacci Implementations'],
        isCompleted: true
      },
      {
        moduleNo: 2,
        title: 'Data Structures: Linear Stack in Python',
        hours: 10,
        description: 'LIFO principle, push, pop, peek, is_empty operations using Python lists.',
        topics: ['Stack Concept & Real-World Applications', 'List Implementation of Stack Operations', 'Stack Overflow & Underflow Conditions', 'Infix to Postfix Evaluation Concepts'],
        isCompleted: true
      },
      {
        moduleNo: 3,
        title: 'Relational Database Management with SQL',
        hours: 14,
        description: 'DDL/DML queries, Primary/Foreign keys, GROUP BY, HAVING, and multi-table Joins.',
        topics: ['CREATE TABLE with PRIMARY KEY & FOREIGN KEY', 'Aggregate Functions (SUM, AVG, COUNT, MAX, MIN)', 'GROUP BY & HAVING Clauses Filtering', 'Cartesian Product vs Equi-Join Queries'],
        isCompleted: true
      }
    ]
  },
  {
    id: 'subj_eng_301',
    subjectCode: '301',
    subjectName: 'English Core',
    semester: 'Class 12 - Term 1',
    type: 'Elective',
    facultyName: 'Mrs. Rekha Sharma',
    facultyEmail: 'rekha.sharma@stxaviers.edu.in',
    credits: 3,
    roomNo: 'Room 101',
    building: 'Senior Science Wing',
    syllabusProgress: 92,
    totalMaterials: 10,
    totalAssignments: 3,
    totalVideos: 5,
    modules: [
      {
        moduleNo: 1,
        title: 'Reading Comprehension & Advanced Writing Skills',
        hours: 10,
        description: 'Note-making, official letters to editor, applications for job, and article writing format.',
        topics: ['Unseen Passage Fast Answering Techniques', 'Note Making & Title/Subheading Abbreviation Keys', 'Formal Job Application with Bio-Data / Resume', 'Articles & Editorials on Contemporary Social Issues'],
        isCompleted: true
      },
      {
        moduleNo: 2,
        title: 'Flamingo (Prose & Poetry Analysis)',
        hours: 14,
        description: 'Deep line-by-line literary analysis of The Last Lesson, Lost Spring, and My Mother at Sixty-Six.',
        topics: ['The Last Lesson: Themes of Linguistic Chauvinism & Patriotism', 'Lost Spring: Child Labor & Perpetuated Poverty in Seemapuri/Firozabad', 'My Mother at Sixty-Six: Fear of Aging & Maternal Separation', 'Keeping Quiet: Quiet Introspection & Universal Brotherhood'],
        isCompleted: true
      }
    ]
  }
];

export const EXTENDED_LMS_MATERIALS: LMSMaterial[] = [
  // 24SACS170P (Cyber Security Practical)
  {
    id: 'mat_cs170p_1',
    subjectCode: '24SACS170P',
    subjectName: 'Cyber Security Techniques and Tools',
    title: 'Lab Manual 1: Nmap Scanning, Port Triaging & Wireshark Packet Dissection',
    module: 'Unit 1: Network Reconnaissance',
    fileType: 'pdf',
    fileSize: '4.2 MB',
    uploadedDate: '2026-08-10',
    facultyName: 'Prof. Rajesh Sharma',
    description: 'Comprehensive step-by-step laboratory experiment guide for running SYN scans, OS fingerprinting, and capturing unencrypted HTTP authentication headers.',
    downloadCount: 312,
    unitNo: 1,
    topics: ['Nmap Commands', 'Wireshark Filters', 'TCP Handshake', 'Port 80/443 Analysis']
  },
  {
    id: 'mat_cs170p_2',
    subjectCode: '24SACS170P',
    subjectName: 'Cyber Security Techniques and Tools',
    title: 'Metasploit Cheat Sheet & Payload Handler Config Script (.rc / .sh)',
    module: 'Unit 2: Penetration Testing Tools',
    fileType: 'code',
    fileSize: '1.8 MB',
    uploadedDate: '2026-08-07',
    facultyName: 'Prof. Rajesh Sharma',
    description: 'Ready-to-use exploit resource scripts for Kali Linux covering msfconsole resource scripts, meterpreter reverse shells, and post-exploitation dumping.',
    downloadCount: 245,
    unitNo: 2,
    topics: ['Meterpreter', 'Reverse TCP', 'Auxiliary Scanners', 'Staged Payloads']
  },
  {
    id: 'mat_cs170p_3',
    subjectCode: '24SACS170P',
    subjectName: 'Cyber Security Techniques and Tools',
    title: 'OWASP Juice Shop Web Security Lab Exercises (SQLi & XSS PoC)',
    module: 'Unit 3: Web Security Exploitation',
    fileType: 'pdf',
    fileSize: '3.6 MB',
    uploadedDate: '2026-08-03',
    facultyName: 'Prof. Rajesh Sharma',
    description: 'Guided walkthrough of solving 15 OWASP Juice Shop challenges including Union-based SQL injection, admin account takeover, and reflected XSS.',
    downloadCount: 198,
    unitNo: 3,
    topics: ['SQL Injection', 'XSS Exploits', 'Burp Suite Repeater', 'CSRF Tokens']
  },

  // 24SACS170T (Cyber Security Theory)
  {
    id: 'mat_cs170t_1',
    subjectCode: '24SACS170T',
    subjectName: 'Cyber Security Techniques and Tools',
    title: 'Lecture Slides 1 to 4: Threat Models, Attack Trees & Zero Trust Security',
    module: 'Unit 1: Foundations of InfoSec',
    fileType: 'slides',
    fileSize: '6.4 MB',
    uploadedDate: '2026-08-11',
    facultyName: 'Prof. Rajesh Sharma',
    description: 'Presentation slides detailing CIA triad violations in modern breaches, ransomware business models, and microsegmentation strategies.',
    downloadCount: 420,
    unitNo: 1,
    topics: ['CIA Triad', 'Ransomware', 'Attack Vectors', 'Defense in Depth']
  },
  {
    id: 'mat_cs170t_2',
    subjectCode: '24SACS170T',
    subjectName: 'Cyber Security Techniques and Tools',
    title: 'Complete Cryptography Handouts: RSA Math, AES Modes & Diffie-Hellman',
    module: 'Unit 2: Cryptographic Algorithms',
    fileType: 'pdf',
    fileSize: '5.1 MB',
    uploadedDate: '2026-08-05',
    facultyName: 'Prof. Rajesh Sharma',
    description: 'Detailed mathematical derivations of RSA modular exponentiation, Euler Totient Function, and AES Galois/Counter Mode (GCM) authentication.',
    downloadCount: 380,
    unitNo: 2,
    topics: ['RSA Keygen', 'Diffie-Hellman', 'AES Modes', 'Digital Signatures']
  },

  // 24SACS180T (Cloud Security)
  {
    id: 'mat_cs180t_1',
    subjectCode: '24SACS180T',
    subjectName: 'Cloud Security',
    title: 'AWS & GCP Security Architecture Reference Guide & IAM Policy Templates',
    module: 'Unit 1: Cloud Architecture & IAM',
    fileType: 'pdf',
    fileSize: '4.8 MB',
    uploadedDate: '2026-08-09',
    facultyName: 'Dr. Vivek Sengupta',
    description: 'Reference architecture diagram for secure VPC setups, Bastion hosts, PrivateLink, and least-privilege IAM JSON policies.',
    downloadCount: 290,
    unitNo: 1,
    topics: ['AWS IAM JSON', 'VPC Peering', 'Security Groups vs NACL', 'Least Privilege']
  },
  {
    id: 'mat_cs180t_2',
    subjectCode: '24SACS180T',
    subjectName: 'Cloud Security',
    title: 'Kubernetes Pod Security Standards & Docker Hardening Checklist',
    module: 'Unit 4: Container Security',
    fileType: 'pdf',
    fileSize: '3.1 MB',
    uploadedDate: '2026-08-04',
    facultyName: 'Dr. Vivek Sengupta',
    description: 'Hardening guide for Kubernetes clusters covering non-root container enforcement, read-only root filesystems, and Trivy image scanning in CI/CD.',
    downloadCount: 215,
    unitNo: 4,
    topics: ['Docker Hardening', 'K8s NetworkPolicy', 'Secrets Management', 'CIS Benchmarks']
  },

  // 24SACS192P (Java Practical)
  {
    id: 'mat_cs192p_1',
    subjectCode: '24SACS192P',
    subjectName: 'Programming in JAVA',
    title: 'Java 17/21 Collections & Multithreading Lab Programs Source Code (.zip)',
    module: 'Unit 3: Collections & Streams',
    fileType: 'zip',
    fileSize: '2.9 MB',
    uploadedDate: '2026-08-08',
    facultyName: 'Mrs. Sunita Verma',
    description: 'Complete Eclipse / IntelliJ project directory with 25 solved laboratory problems covering Streams, Custom Comparators, and Producer-Consumer threads.',
    downloadCount: 450,
    unitNo: 3,
    topics: ['Java Collections', 'Stream API', 'Thread Synchronization', 'Generics']
  },
  {
    id: 'mat_cs192p_2',
    subjectCode: '24SACS192P',
    subjectName: 'Programming in JAVA',
    title: 'JDBC MySQL Database CRUD Connection Template & PreparedStatements',
    module: 'Unit 4: JDBC & Concurrency',
    fileType: 'code',
    fileSize: '1.1 MB',
    uploadedDate: '2026-08-02',
    facultyName: 'Mrs. Sunita Verma',
    description: 'Clean Java DAO pattern code snippets with connection pooling (HikariCP) and secure parameterized queries to prevent SQL injection.',
    downloadCount: 360,
    unitNo: 4,
    topics: ['JDBC Connection', 'PreparedStatements', 'Transaction Rollback', 'DAO Pattern']
  },

  // 24SACS192T (Java Theory)
  {
    id: 'mat_cs192t_1',
    subjectCode: '24SACS192T',
    subjectName: 'Programming in JAVA',
    title: 'JVM Internal Architecture & Memory Management (Garbage Collection)',
    module: 'Unit 1: JVM Deep Dive',
    fileType: 'pdf',
    fileSize: '5.6 MB',
    uploadedDate: '2026-08-06',
    facultyName: 'Mrs. Sunita Verma',
    description: 'Detailed illustrated diagrams of Heap generation spaces (Eden, Survivor, Tenured), JIT compilation stages, and Garbage Collection tuning flags.',
    downloadCount: 490,
    unitNo: 1,
    topics: ['JVM Memory Model', 'G1 GC Garbage Collector', 'ClassLoader Subsystem', 'Bytecode Inspection']
  },
  {
    id: 'mat_cs192t_2',
    subjectCode: '24SACS192T',
    subjectName: 'Programming in JAVA',
    title: 'Design Patterns in Java: Gang of Four (GoF) Illustrated Handbook',
    module: 'Unit 2: Design Patterns',
    fileType: 'pdf',
    fileSize: '6.2 MB',
    uploadedDate: '2026-08-01',
    facultyName: 'Mrs. Sunita Verma',
    description: 'Comprehensive study guide with UML diagrams and clean code examples for Singleton, Factory, Observer, Decorator, and Builder design patterns.',
    downloadCount: 520,
    unitNo: 2,
    topics: ['Singleton Pattern', 'Observer Pattern', 'Factory Method', 'SOLID Principles']
  },

  // 24SACS202T (Digital Forensic)
  {
    id: 'mat_cs202t_1',
    subjectCode: '24SACS202T',
    subjectName: 'Digital Forensic',
    title: 'Volatility 3 RAM Analysis Playbook & Windows Artifact Cheat Sheet',
    module: 'Unit 3: Memory Forensics',
    fileType: 'pdf',
    fileSize: '4.5 MB',
    uploadedDate: '2026-08-07',
    facultyName: 'Dr. Anand Ramanathan',
    description: 'Step-by-step triage commands for analyzing memory dumps, detecting code injection via malfind, and recovering deleted browser history from RAM.',
    downloadCount: 280,
    unitNo: 3,
    topics: ['Volatility 3 Commands', 'Process Tree Triage', 'DLL Injections', 'Prefetch Files']
  },
  {
    id: 'mat_cs202t_2',
    subjectCode: '24SACS202T',
    subjectName: 'Digital Forensic',
    title: 'Indian Evidence Act Section 65B Electronic Certificate Format & Guidelines',
    module: 'Unit 1: Legal Admissibility',
    fileType: 'doc',
    fileSize: '1.4 MB',
    uploadedDate: '2026-07-30',
    facultyName: 'Dr. Anand Ramanathan',
    description: 'Standard court-admissible electronic evidence certificate templates with forensic hash logging protocols for digital investigators.',
    downloadCount: 230,
    unitNo: 1,
    topics: ['Section 65B Certificate', 'Chain of Custody', 'Hash Integrity (SHA-256)', 'Expert Testimony']
  },

  // 24SACS210P (Minor Project)
  {
    id: 'mat_cs210p_1',
    subjectCode: '24SACS210P',
    subjectName: 'Minor Project',
    title: 'IEEE Project Synopsis, SRS Template & Milestone Evaluation Rubrics',
    module: 'Unit 1: Project Formulation & SRS',
    fileType: 'doc',
    fileSize: '2.1 MB',
    uploadedDate: '2026-08-01',
    facultyName: 'Project Evaluation Committee',
    description: 'Mandatory documentation guidelines for Project Phase 1, covering literature survey format, UML diagrams standard, and git commit history tracking.',
    downloadCount: 370,
    unitNo: 1,
    topics: ['IEEE SRS Format', 'UML Use Case Diagrams', 'Gantt Chart Milestones', 'Git Branching Strategy']
  },
  {
    id: 'mat_cs210p_2',
    subjectCode: '24SACS210P',
    subjectName: 'Minor Project',
    title: 'Sample Presentation PPT Deck for Mid-Term Defense & Evaluation',
    module: 'Unit 4: Project Defense',
    fileType: 'slides',
    fileSize: '5.2 MB',
    uploadedDate: '2026-08-05',
    facultyName: 'Project Evaluation Committee',
    description: 'Official 12-slide template for Minor Project progress presentation before the faculty review panel.',
    downloadCount: 410,
    unitNo: 4,
    topics: ['Mid-Term Defense PPT', 'System Architecture Slides', 'Live Demo Guidelines', 'Q&A Prep']
  },

  // CBSE Physics
  {
    id: 'mat_phy_042_1',
    subjectCode: '042',
    subjectName: 'Physics (Theory & Practical)',
    title: 'Electrostatics & Gauss Law Handwritten Derivation Notes',
    module: 'Unit 1: Electrostatics',
    fileType: 'pdf',
    fileSize: '4.7 MB',
    uploadedDate: '2026-08-08',
    facultyName: 'Mr. Rajesh Sharma',
    description: 'Full NCERT chapter derivations including electric field due to dipole at axial/equatorial points and spherical shells.',
    downloadCount: 420,
    unitNo: 1,
    topics: ['Gauss Law', 'Dipole Field', 'Capacitors', 'Equipotential Surfaces']
  },
  // CBSE Chemistry
  {
    id: 'mat_chem_043_1',
    subjectCode: '043',
    subjectName: 'Chemistry (Theory & Lab)',
    title: 'Solutions, Raoult Law & Colligative Properties Solved Numericals',
    module: 'Unit 1: Solutions',
    fileType: 'pdf',
    fileSize: '3.9 MB',
    uploadedDate: '2026-08-05',
    facultyName: 'Mrs. Sunita Verma',
    description: '50 essential CBSE board numerical problems with step-by-step formula substitutions and Van\'t Hoff calculations.',
    downloadCount: 390,
    unitNo: 1,
    topics: ['Raoult Law', 'Elevation in BP', 'Depression in FP', 'Osmotic Pressure']
  },
  // CBSE Mathematics
  {
    id: 'mat_math_041_1',
    subjectCode: '041',
    subjectName: 'Mathematics',
    title: 'Matrices & Determinants Board Exam 10-Year Question Bank',
    module: 'Unit 1: Matrices',
    fileType: 'pdf',
    fileSize: '5.4 MB',
    uploadedDate: '2026-08-04',
    facultyName: 'Mr. Vikram Singh',
    description: 'Systematic compilation of previous years\' matrix inversion and system of linear equation problems with marking schemes.',
    downloadCount: 480,
    unitNo: 1,
    topics: ['Matrix Inverse', 'Adjoint 3x3', 'Linear Equations', 'Determinant Properties']
  },
  // CBSE Computer Science
  {
    id: 'mat_cs_083_1',
    subjectCode: '083',
    subjectName: 'Computer Science',
    title: 'Python File Handling & Stack Data Structure Master Handbook',
    module: 'Unit 1: Python Data Structures',
    fileType: 'pdf',
    fileSize: '3.3 MB',
    uploadedDate: '2026-08-06',
    facultyName: 'Mr. Amit Kumar',
    description: 'Complete Python scripts demonstrating push, pop, peek stack functions and CSV/text file reader-writer patterns.',
    downloadCount: 360,
    unitNo: 1,
    topics: ['Python Stacks', 'Text & CSV Files', 'Pickle Module', 'Recursion']
  },
  // CBSE English Core
  {
    id: 'mat_eng_301_1',
    subjectCode: '301',
    subjectName: 'English Core',
    title: 'Flamingo Literature Character Sketches, Themes & Literary Devices',
    module: 'Unit 2: Flamingo Prose & Poetry',
    fileType: 'pdf',
    fileSize: '2.8 MB',
    uploadedDate: '2026-08-02',
    facultyName: 'Mrs. Rekha Sharma',
    description: 'Comprehensive literary analysis for The Last Lesson, Lost Spring, and Deep Water with recurring exam questions.',
    downloadCount: 310,
    unitNo: 2,
    topics: ['The Last Lesson', 'Lost Spring', 'Poetic Devices', 'Question Answers']
  }
];

export const EXTENDED_LMS_ASSIGNMENTS: LMSAssignment[] = [
  {
    id: 'asg_cs170p_1',
    subjectCode: '24SACS170P',
    subjectName: 'Cyber Security Techniques and Tools',
    title: 'Lab Assignment 1: Nmap Scanning & Port Assessment Report',
    assignedDate: '2026-08-08',
    dueDate: '2026-08-20',
    totalMarks: 25,
    status: 'Pending',
    instructions: 'Perform SYN scan (-sS) and Service Version detection (-sV) on the designated lab target (192.168.10.15). Capture screenshots of open ports, identify running Apache/SSH versions, and submit a PDF report.'
  },
  {
    id: 'asg_cs170p_2',
    subjectCode: '24SACS170P',
    subjectName: 'Cyber Security Techniques and Tools',
    title: 'Lab Assignment 2: Metasploit Exploit Verification & Session Log',
    assignedDate: '2026-08-01',
    dueDate: '2026-08-14',
    totalMarks: 30,
    status: 'Submitted',
    submissionDate: '2026-08-13',
    fileSubmitted: 'Piyush_Panwar_Metasploit_Lab2.pdf',
    instructions: 'Deploy an auxiliary port scanner, identify vulnerable vsftpd 2.3.4 backdoor on target machine, run exploit and document meterpreter shell interaction.'
  },
  {
    id: 'asg_cs170t_1',
    subjectCode: '24SACS170T',
    subjectName: 'Cyber Security Techniques and Tools',
    title: 'Theory Assignment 1: RSA Key Generation & Digital Signature Math Problem',
    assignedDate: '2026-08-05',
    dueDate: '2026-08-18',
    totalMarks: 20,
    status: 'Pending',
    instructions: 'Given prime numbers p=61 and q=53, compute n, phi(n), choose public key e=17, compute private key d, and encrypt message M=65. Show all modular arithmetic calculations.'
  },
  {
    id: 'asg_cs180t_1',
    subjectCode: '24SACS180T',
    subjectName: 'Cloud Security',
    title: 'Case Study: Multi-Tier AWS VPC Security Group & IAM Boundary Design',
    assignedDate: '2026-08-07',
    dueDate: '2026-08-22',
    totalMarks: 25,
    status: 'Pending',
    instructions: 'Design a highly available 3-tier architecture with public web subnets, private app subnets, and isolated DB subnets. Write the IAM JSON trust policy for Lambda functions accessing S3.'
  },
  {
    id: 'asg_cs192p_1',
    subjectCode: '24SACS192P',
    subjectName: 'Programming in JAVA',
    title: 'Practical Exercise 3: Multithreaded Banking Transaction System',
    assignedDate: '2026-08-04',
    dueDate: '2026-08-16',
    totalMarks: 20,
    status: 'Graded',
    obtainedMarks: 19,
    submissionDate: '2026-08-12',
    fileSubmitted: 'BankTransactionMultithreading.java',
    instructions: 'Create a thread-safe BankAccount class with deposit() and withdraw() methods utilizing synchronized blocks and ReentrantLock to prevent race conditions during concurrent withdrawals.'
  },
  {
    id: 'asg_cs192t_1',
    subjectCode: '24SACS192T',
    subjectName: 'Programming in JAVA',
    title: 'Written Assignment 2: JVM Memory Model & Garbage Collection Lifecycle',
    assignedDate: '2026-08-06',
    dueDate: '2026-08-19',
    totalMarks: 20,
    status: 'Pending',
    instructions: 'Illustrate and explain the internal architecture of JVM with memory divisions (Heap, Stack, Metaspace). Contrast Mark-Sweep-Compact with G1 Garbage Collector algorithms.'
  },
  {
    id: 'asg_cs202t_1',
    subjectCode: '24SACS202T',
    subjectName: 'Digital Forensic',
    title: 'Forensic Report: Analyzing $MFT File Slack & Prefetch Artefacts',
    assignedDate: '2026-08-03',
    dueDate: '2026-08-17',
    totalMarks: 25,
    status: 'Pending',
    instructions: 'Inspect the provided disk image sample in Autopsy. Identify the timestamp when malware.exe was executed using Windows Prefetch files and calculate SHA-256 hash of carved documents.'
  },
  {
    id: 'asg_cs210p_1',
    subjectCode: '24SACS210P',
    subjectName: 'Minor Project',
    title: 'Milestone 1 Submission: IEEE SRS Document & System Architecture Diagram',
    assignedDate: '2026-08-01',
    dueDate: '2026-08-15',
    totalMarks: 50,
    status: 'Submitted',
    submissionDate: '2026-08-14',
    fileSubmitted: 'Minor_Project_SRS_Document_Final.pdf',
    instructions: 'Submit the formal Software Requirements Specification document according to IEEE standard 830-1998 including use-case diagram, database schema in 3NF, and Gantt chart.'
  }
];

export const DEFAULT_LMS_VIDEOS: LMSVideoLecture[] = [
  {
    id: 'vid_1',
    subjectCode: '24SACS170P',
    subjectName: 'Cyber Security Techniques and Tools',
    title: 'Live Lab: Wireshark Packet Sniffing & TCP 3-Way Handshake Dissection',
    topic: 'Packet Analysis with Wireshark',
    module: 'Unit 1: Network Reconnaissance',
    duration: '42 mins',
    facultyName: 'Prof. Rajesh Sharma',
    uploadedDate: '2026-08-10',
    viewsCount: 284,
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80',
    summary: 'Detailed screen-recording walkthrough of capturing network traffic, applying display filters (tcp.flags.syn==1), reconstructing HTTP conversations, and spotting plaintext credentials.'
  },
  {
    id: 'vid_2',
    subjectCode: '24SACS170T',
    subjectName: 'Cyber Security Techniques and Tools',
    title: 'Lecture 4: RSA Public Key Cryptography, Modulo Arithmetic & Prime Math',
    topic: 'Asymmetric Key Cryptography',
    module: 'Unit 2: Cryptographic Algorithms',
    duration: '55 mins',
    facultyName: 'Prof. Rajesh Sharma',
    uploadedDate: '2026-08-08',
    viewsCount: 310,
    thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80',
    summary: 'In-depth blackboard lecture explaining the mathematics behind RSA keypair generation, trapdoor one-way functions, Euler Totient calculation, and digital signature verification.'
  },
  {
    id: 'vid_3',
    subjectCode: '24SACS180T',
    subjectName: 'Cloud Security',
    title: 'Cloud Security Masterclass: AWS IAM Roles, Policies & Instance Profiles',
    topic: 'Identity & Access Management in AWS',
    module: 'Unit 2: Cloud IAM & RBAC',
    duration: '48 mins',
    facultyName: 'Dr. Vivek Sengupta',
    uploadedDate: '2026-08-09',
    viewsCount: 195,
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80',
    summary: 'Live AWS console demonstration constructing fine-grained IAM JSON policies, assuming cross-account STS roles, and attaching IAM instance profiles to EC2 instances safely.'
  },
  {
    id: 'vid_4',
    subjectCode: '24SACS192P',
    subjectName: 'Programming in JAVA',
    title: 'Java 17 Concurrency & Thread Synchronization Hands-on Coding',
    topic: 'Multithreading & Synchronization in Java',
    module: 'Unit 4: Multithreading & JDBC',
    duration: '50 mins',
    facultyName: 'Mrs. Sunita Verma',
    uploadedDate: '2026-08-06',
    viewsCount: 342,
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=80',
    summary: 'Live IntelliJ coding tutorial building a producer-consumer queue with wait() and notifyAll(), followed by modern java.util.concurrent.BlockingQueue alternatives.'
  },
  {
    id: 'vid_5',
    subjectCode: '24SACS202T',
    subjectName: 'Digital Forensic',
    title: 'Memory Forensics with Volatility 3: Detecting Injected DLLs in RAM',
    topic: 'RAM Forensics & Process Triage',
    module: 'Unit 3: Memory Forensics',
    duration: '38 mins',
    facultyName: 'Dr. Anand Ramanathan',
    uploadedDate: '2026-08-07',
    viewsCount: 220,
    thumbnailUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=500&auto=format&fit=crop&q=80',
    summary: 'Step-by-step terminal walkthrough parsing memory raw dumps, identifying orphan processes with windows.pslist and windows.pstree, and dumping malicious DLLs with windows.malfind.'
  }
];
