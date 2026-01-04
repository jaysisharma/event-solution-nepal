const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = 'HANDOVER.md';
const PROJECT_ROOT = process.cwd();

// --- Configuration ---
const IGNORE_DIRS = ['.git', 'node_modules', '.next', '.gemini', '.idea', '.vscode', 'playwright-report', 'test-results', 'coverage'];
const IGNORE_FILES = ['.DS_Store', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'];
// Optional: Add specific files you want to dump correctly into the "Source Code" section if needed.
// For now, we will focus on the structure and key configuration files.

function getProjectInfo() {
    try {
        const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        }
    } catch (e) {
        console.warn("Could not read package.json", e);
    }
    return { name: 'Unknown Project', dependencies: {}, devDependencies: {} };
}

function getPrismaSchema() {
    const schemaPath = path.join(PROJECT_ROOT, 'prisma', 'schema.prisma');
    if (fs.existsSync(schemaPath)) {
        return fs.readFileSync(schemaPath, 'utf8');
    }
    return "// No prisma/schema.prisma found";
}

function generateTree(dir, prefix = '') {
    let output = '';
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // Sort: Directories first, then files
    entries.sort((a, b) => {
        if (a.isDirectory() && !b.isDirectory()) return -1;
        if (!a.isDirectory() && b.isDirectory()) return 1;
        return a.name.localeCompare(b.name);
    });

    const filtered = entries.filter(e =>
        !IGNORE_DIRS.includes(e.name) &&
        !IGNORE_FILES.includes(e.name) &&
        !e.name.startsWith('.') // Ignore hidden files by default unless important
    );

    filtered.forEach((entry, index) => {
        const isLast = index === filtered.length - 1;
        const marker = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';

        output += `${prefix}${marker}${entry.name}\n`;

        if (entry.isDirectory()) {
            output += generateTree(path.join(dir, entry.name), prefix + childPrefix);
        }
    });

    return output;
}

function generateHandover() {
    const info = getProjectInfo();
    const schema = getPrismaSchema();
    const tree = generateTree(PROJECT_ROOT);
    const now = new Date().toLocaleDateString();

    const content = `# Project Handover: ${info.name || 'Event Solution Nepal'}
**Date:** ${now}
**Version:** ${info.version || '1.0.0'}

## 1. Project Overview
${info.description || 'A Next.js application for Event Solution Nepal, managing events, services, and team operations.'}

This document contains all necessary technical details, setup instructions, and database schemas required for the maintenance and deployment of the application.

---

## 2. Technology Stack

### Core Framework
- **Next.js**: Full-stack React framework (App Router)
- **React**: UI Library
- **Node.js**: Runtime environment

### Database & Backend
- **Prisma ORM**: Database interaction and modeling
- **PostgreSQL** (Recommended): Production database
- **SQLite** (Dev/Local): Used for local development (if applicable)

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
- **GSAP**: Advanced animations
- **Framer Motion**: React animations
- **Lucide React / React Icons**: Icon sets

---

## 3. Installation & Setup

### Prerequisites
Ensure the deployment machine has the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** (Node Package Manager)

### Step-by-Step Installation

1.  **Unzip/Clone the Project Source Code**
    Extract the provided source code to a folder on your server or local machine.

2.  **Install Dependencies**
    Open a terminal in the project directory and run:
    \`\`\`bash
    npm install
    \`\`\`

3.  **Environment Configuration**
    Create a \`.env\` file in the root directory. Copy the structure from the provided exmaple below or the source code's \`.env.example\`.
    
    **Required Variables:**
    \`\`\`env
    DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
    NEXT_PUBLIC_CLOUDINARY_API_KEY="your_api_key"
    CLOUDINARY_API_SECRET="your_api_secret"
    # Add any other secrets here
    \`\`\`

4.  **Database Setup**
    Push the database schema to your database:
    \`\`\`bash
    npx prisma generate
    npx prisma db push
    \`\`\`
    *(Optional) Seed initial data if a seed script is provided:*
    \`\`\`bash
    npm run prisma:seed
    \`\`\`

5.  **Running the Application**
    
    *For Development:*
    \`\`\`bash
    npm run dev
    \`\`\`
    
    *For Production:*
    \`\`\`bash
    npm run build
    npm start
    \`\`\`
    The app will typically start at \`http://localhost:3000\`.

---

## 4. Project Structure
Below is the directory structure of the application source code:

\`\`\`text
${tree}
\`\`\`

---

## 5. Database Schema
The database is managed using **Prisma**. Below is the complete schema defining implementation of data models (Users, Events, Services, etc.).

\`\`\`prisma
${schema}
\`\`\`

---

## 6. Admin & Key Features
*(Add specific instructions for the client here, e.g., default admin login)*

- **Admin Login Route**: \`/admin/login\` (or similar)
- **Default Credentials**: *(You should provide these securely or instruct how to create the first admin)*

---

## 7. Additional Scripts
- **\`npm run lint\`**: Check for code issues.
- **\`npx prisma studio\`**: Open a visual database editor in the browser.

---

*Generated automatically by Antigravity Assistant.*
`;

    fs.writeFileSync(OUTPUT_FILE, content);
    console.log(`Successfully generated ${OUTPUT_FILE}`);
}

generateHandover();
