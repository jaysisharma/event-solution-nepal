# Project Handover: event-solution-nepal
**Date:** 1/4/2026
**Version:** 0.1.0

## 1. Project Overview
A Next.js application for Event Solution Nepal, managing events, services, and team operations.

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
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory. Copy the structure from the provided exmaple below or the source code's `.env.example`.
    
    **Required Variables:**
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
    NEXT_PUBLIC_CLOUDINARY_API_KEY="your_api_key"
    CLOUDINARY_API_SECRET="your_api_secret"
    # Add any other secrets here
    ```

4.  **Database Setup**
    Push the database schema to your database:
    ```bash
    npx prisma generate
    npx prisma db push
    ```
    *(Optional) Seed initial data if a seed script is provided:*
    ```bash
    npm run prisma:seed
    ```

5.  **Running the Application**
    
    *For Development:*
    ```bash
    npm run dev
    ```
    
    *For Production:*
    ```bash
    npm run build
    npm start
    ```
    The app will typically start at `http://localhost:3000`.

---

## 4. Project Structure
Below is the directory structure of the application source code:

```text
├── app
│   ├── about
│   │   ├── about.module.css
│   │   ├── AboutClient.js
│   │   └── page.js
│   ├── admin
│   │   ├── events
│   │   │   ├── [id]
│   │   │   │   └── page.js
│   │   │   ├── new
│   │   │   │   └── page.js
│   │   │   ├── actions.js
│   │   │   ├── DeleteEventButton.js
│   │   │   ├── EventForm.js
│   │   │   ├── FeaturedToggle.js
│   │   │   └── page.js
│   │   ├── gallery
│   │   │   ├── actions.js
│   │   │   └── page.js
│   │   ├── hero
│   │   │   ├── actions.js
│   │   │   └── page.js
│   │   ├── login
│   │   │   └── page.js
│   │   ├── partners
│   │   │   ├── actions.js
│   │   │   └── page.js
│   │   ├── projects
│   │   │   ├── actions.js
│   │   │   └── page.js
│   │   ├── rentals
│   │   │   ├── [id]
│   │   │   │   └── page.js
│   │   │   ├── new
│   │   │   │   └── page.js
│   │   │   ├── actions.js
│   │   │   ├── DeleteRentalButton.js
│   │   │   ├── page.js
│   │   │   └── RentalForm.js
│   │   ├── services
│   │   │   ├── actions.js
│   │   │   └── page.js
│   │   ├── team
│   │   │   ├── actions.js
│   │   │   ├── page.js
│   │   │   └── plan.txt
│   │   ├── testimonials
│   │   │   ├── [id]
│   │   │   │   └── page.js
│   │   │   ├── new
│   │   │   │   └── page.js
│   │   │   ├── actions.js
│   │   │   ├── DeleteTestimonialButton.js
│   │   │   ├── page.js
│   │   │   └── TestimonialForm.js
│   │   ├── timeline
│   │   │   ├── actions.js
│   │   │   └── page.js
│   │   ├── actions.js
│   │   ├── admin.module.css
│   │   ├── AdminSidebar.js
│   │   ├── error.js
│   │   ├── layout.js
│   │   ├── loading.js
│   │   └── page.js
│   ├── clients
│   │   ├── page.js
│   │   └── page.module.css
│   ├── contact
│   │   ├── contact.module.css
│   │   ├── ContactClient.js
│   │   └── page.js
│   ├── events
│   │   ├── loading.js
│   │   └── page.js
│   ├── gallery
│   │   ├── gallery.module.css
│   │   └── page.js
│   ├── privacy-policy
│   │   └── page.js
│   ├── projects
│   │   ├── loading.js
│   │   ├── page.js
│   │   ├── page.module.css
│   │   ├── plan.txt
│   │   ├── PortfolioClient.js
│   │   ├── projects.module.css
│   │   └── ProjectsClient.js
│   ├── quote
│   │   ├── page.js
│   │   └── quote.module.css
│   ├── rentals
│   │   ├── page.js
│   │   ├── rentals.module.css
│   │   └── RentalsClient.js
│   ├── services
│   │   ├── page.js
│   │   ├── page.module.css
│   │   ├── services.module.css
│   │   └── ServicesClient.js
│   ├── terms-of-service
│   │   └── page.js
│   ├── error.js
│   ├── global-error.js
│   ├── globals.css
│   ├── HomeClient.js
│   ├── icon.js
│   ├── layout.js
│   ├── not-found.js
│   ├── opengraph-image.js
│   ├── page.js
│   ├── page.module.css
│   ├── robots.js
│   └── sitemap.js
├── components
│   ├── admin
│   │   └── ToastContext.js
│   ├── backgrounds
│   ├── AppPromo.js
│   ├── AppPromo.module.css
│   ├── BeforeAfter.js
│   ├── BeforeAfter.module.css
│   ├── Button.js
│   ├── Button.module.css
│   ├── CallToAction.js
│   ├── CallToAction.module.css
│   ├── Card.js
│   ├── Card.module.css
│   ├── Cursor.js
│   ├── Cursor.module.css
│   ├── DraggableGallery.js
│   ├── DraggableGallery.module.css
│   ├── Expertise.js
│   ├── Expertise.module.css
│   ├── Footer.js
│   ├── Footer.module.css
│   ├── GalleryGrid.js
│   ├── GalleryGrid.module.css
│   ├── Header.js
│   ├── Header.module.css
│   ├── Hero.js
│   ├── Hero.module.css
│   ├── JsonLd.js
│   ├── MagneticButton.js
│   ├── Navbar.js
│   ├── Navbar.module.css
│   ├── Preloader.js
│   ├── Preloader.module.css
│   ├── Section.js
│   ├── Section.module.css
│   ├── SelectedWorks.js
│   ├── SelectedWorks.module.css
│   ├── SmoothScroll.js
│   ├── StackingCards.js
│   ├── StackingCards.module.css
│   ├── Testimonials.js
│   ├── Testimonials.module.css
│   ├── TestimonialsClient.js
│   ├── UpcomingEvents.js
│   ├── UpcomingEvents.module.css
│   ├── WhyChooseUs.js
│   └── WhyChooseUs.module.css
├── context
│   └── ThemeContext.js
├── lib
│   ├── auth.js
│   ├── compress.js
│   ├── dateUtils.js
│   ├── db.js
│   ├── env.js
│   ├── eventUtils.js
│   ├── rateLimit.js
│   └── upload.js
├── prisma
│   ├── migrations
│   │   ├── 20251228061945_init
│   │   │   └── migration.sql
│   │   └── migration_lock.toml
│   ├── dev.db
│   ├── schema.prisma
│   └── seed.js
├── public
│   ├── company
│   │   ├── Screenshot 2025-12-28 at 1.24.13 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.27.03 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.27.15 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.27.31 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.27.41 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.28.00 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.28.15 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.28.26 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.28.37 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.28.44 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.28.50 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.29.00 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.29.07 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.29.15 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.29.23 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.29.29 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.29.38 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.29.45 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.29.55 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.30.02 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.30.18 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.30.48 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.30.54 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.31.11 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.31.16 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.31.30 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.31.35 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.31.41 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.31.46 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.31.52 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.31.57 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.32.47 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.32.58 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.33.04 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.33.10 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.33.20 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.33.29 PM.png
│   │   ├── Screenshot 2025-12-28 at 1.33.34 PM.png
│   │   └── Screenshot 2025-12-28 at 1.40.40 PM.png
│   ├── hero
│   │   ├── fashion_week.png
│   │   ├── food_expo.png
│   │   ├── music_fest.png
│   │   └── tech_summit.png
│   ├── logo
│   │   ├── es_logo_white.png
│   │   ├── es_logo.png
│   │   └── favicon.png
│   ├── meet_the_team
│   │   ├── anup.png
│   │   ├── bijay.jpg
│   │   ├── bisal.png
│   │   ├── manjesh.png
│   │   ├── mohan.png
│   │   ├── nabin.png
│   │   ├── narendra.png
│   │   ├── sajan.png
│   │   ├── srijina.png
│   │   ├── sunil.png
│   │   └── vinesh.png
│   ├── rentals
│   │   ├── german_hanger_inside.png
│   │   ├── german_hanger_night.png
│   │   ├── german_hanger.png
│   │   ├── led_wall.png
│   │   ├── luxury_pandal_entry.png
│   │   ├── luxury_pandal.png
│   │   ├── modular_stall.png
│   │   ├── sound_system.png
│   │   ├── stage_setup.png
│   │   ├── stage_side_view.png
│   │   └── vip_seating.png
│   ├── services
│   │   ├── event_management.png
│   │   ├── event_rentals.png
│   │   ├── marketing.png
│   │   ├── marketing2.png
│   │   ├── organizer.png
│   │   ├── organizer2.png
│   │   ├── preandpost.png
│   │   ├── preandpost2.png
│   │   └── production.png
│   ├── uploads
│   │   ├── events
│   │   │   ├── 1766991331291-unnamed.png
│   │   │   ├── 1766992949528-unnamed.png
│   │   │   ├── 1766992989049-unnamed.png
│   │   │   ├── 1766993073074-Screenshot_2025-12-28_at_1.40.40_PM.png
│   │   │   ├── 1766993120488-unnamed.png
│   │   │   ├── 1766993219559-unnamed.png
│   │   │   ├── 1766993460442-unnamed.png
│   │   │   ├── 1766993462826-blob
│   │   │   ├── 1766993469540-unnamed.png
│   │   │   ├── 1766993629397-WhatsApp_Image_2025-12-29_at_12.29.02.jpeg
│   │   │   ├── 1766994627206-1920x1080-aesthetic-glrfk0ntspz3tvxg.jpg
│   │   │   ├── 1766994699187-1920x1080-aesthetic-glrfk0ntspz3tvxg.jpg
│   │   │   ├── 1766995466959-blob
│   │   │   ├── 1766995485286-1920x1080-aesthetic-glrfk0ntspz3tvxg.jpg
│   │   │   ├── 1766995692536-blob
│   │   │   ├── 1766995794348-blob
│   │   │   ├── 1766995844953-1920x1080-aesthetic-glrfk0ntspz3tvxg.jpg
│   │   │   ├── 1767003478039-1920x1080-aesthetic-glrfk0ntspz3tvxg.jpg
│   │   │   ├── 1767003597634-blob
│   │   │   ├── 1767003605700-77tx46x5f5f21.jpg
│   │   │   ├── 1767003609487-blob
│   │   │   └── 1767003694586-1920x1080-aesthetic-glrfk0ntspz3tvxg.jpg
│   │   ├── hero
│   │   │   ├── 1767077985345-77tx46x5f5f21.jpg
│   │   │   ├── 1767078016045-1920x1080-aesthetic-glrfk0ntspz3tvxg.jpg
│   │   │   ├── 1767078596553-77tx46x5f5f21.jpg
│   │   │   ├── 1767079397480-77tx46x5f5f21.jpg
│   │   │   ├── 1767079911076-1920x1080-aesthetic-glrfk0ntspz3tvxg.jpg
│   │   │   ├── 1767194684359-77tx46x5f5f21.jpg
│   │   │   └── 1767426655944-1920x1080-aesthetic-glrfk0ntspz3tvxg.jpg
│   │   ├── rentals
│   │   │   ├── 1766998747440-77tx46x5f5f21.jpg
│   │   │   ├── 1766998747444-1920x1080-aesthetic-glrfk0ntspz3tvxg.jpg
│   │   │   ├── 1766998747445-vo9vm1fcqrp71.jpg
│   │   │   ├── 1766999270807-77tx46x5f5f21.jpg
│   │   │   ├── 1766999270809-1920x1080-aesthetic-glrfk0ntspz3tvxg.jpg
│   │   │   └── 1767000082035-77tx46x5f5f21.jpg
│   │   └── timeline
│   │       ├── 1767187228094-77tx46x5f5f21.jpg
│   │       ├── 1767187274077-1920x1080-aesthetic-glrfk0ntspz3tvxg.jpg
│   │       ├── 1767187281776-IMG_2315.jpg
│   │       ├── 1767187291382-Screenshot-2025-12-30-at-11.50.03-AM.png
│   │       ├── 1767187311061-logo-of-all-9-1.png
│   │       ├── 1767187318093-Screenshot-2025-12-28-at-1.40.40-PM.png
│   │       ├── 1767187323933-1920x1080-aesthetic-glrfk0ntspz3tvxg.jpg
│   │       ├── 1767187348499-WhatsApp-Image-2025-12-29-at-12.29.02.jpeg
│   │       ├── 1767187359237-unnamed.png
│   │       ├── 1767187410407-IMG_1206.PNG
│   │       ├── 1767194888477-blob
│   │       ├── 1767195185628-blob
│   │       └── 1767195434134-blob
│   ├── works
│   │   ├── AD_Concert.PNG
│   │   ├── colors_splash.PNG
│   │   ├── family_baby_expo.PNG
│   │   ├── Global_consumer.jpeg
│   │   └── himalayan_hydro_expo.jpg
│   ├── file.svg
│   ├── globe.svg
│   ├── mobile_app_mockup.png
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── scripts
│   ├── backup_db.sh
│   └── generate-handover.js
├── tests
│   ├── a11y.spec.js
│   ├── admin-login.spec.js
│   └── example.spec.js
├── debug-db.js
├── dev.db
├── eslint.config.mjs
├── jsconfig.json
├── logo_of_all.pdf
├── middleware.js
├── next.config.mjs
├── package.json
├── playwright.config.js
├── prisma.config.ts
├── README.md
└── verify-db.js

```

---

## 5. Database Schema
The database is managed using **Prisma**. Below is the complete schema defining implementation of data models (Users, Events, Services, etc.).

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model AdminUser {
  id        String   @id @default(uuid())
  username  String   @unique
  password  String   
  createdAt DateTime @default(now())
}

model Event {
  id        Int      @id @default(autoincrement())
  title     String
  date      String   
  month     String
  year      String   @default("2025")
  location  String
  time      String
  image     String
  status    String   @default("UPCOMING") // UPCOMING, COMPLETED
  organizer String?
  managedBy String?
  description String?
  isFeatured Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Partner {
  id        Int      @id @default(autoincrement())
  name      String
  image     String?
  order     Int      @default(0) 
  createdAt DateTime @default(now())
}

model WorkProject {
  id          Int      @id @default(autoincrement())
  title       String
  category    String
  year        String
  images      String   // Stored as JSON string of array
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Service {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  image       String
  tags        String   // Stored as JSON string or comma-separated
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model FAQ {
  id          Int      @id @default(autoincrement())
  question    String
  answer      String
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model TeamMember {
  id          Int      @id @default(autoincrement())
  name        String
  role        String
  image       String
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model GalleryItem {
  id          Int      @id @default(autoincrement())
  title       String
  category    String
  size        String   // 'normal', 'wide', 'tall', 'large'
  src         String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model RentalItem {
  id             Int      @id @default(autoincrement())
  title          String
  category       String
  price          String
  images         String   // Stored as JSON string of array
  size           String?  // General size description like "large", "standard"
  availableSizes String   // Stored as JSON string of array of string (Legacy/Simplified)
  variants       String?  // Stored as JSON string of array of objects { size, image }
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Testimonial {
  id        Int      @id @default(autoincrement())
  name      String
  role      String
  quote     String
  avatar    String?
  rating    Int      @default(5)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model HeroSlide {
  id        Int      @id @default(autoincrement())
  image     String
  label     String
  title     String
  order     Int      @default(0)
  
  // Per-Slide Stats
  rating        String   @default("4.9")
  ratingLabel   String   @default("Average Rating")
  capacity      String   @default("Handling events up to 10k guests.")
  capacityLabel String   @default("Capacity")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model HeroSettings {
  id            Int      @id @default(autoincrement())
  rating        String   @default("4.9")
  ratingLabel   String   @default("Average Rating")
  capacity      String   @default("Handling events up to 10k guests.")
  capacityLabel String   @default("Capacity")
  
  // Text Content
  tagline           String @default("Be a guest at your own event")
  headingPrefix     String @default("Events that")
  headingHighlight1 String @default("Inspire")
  headingHighlight2 String @default("Delight")
  subtext           String @default("Founded in 2014 A.D , Event Solution Nepal has been creating meaningful and memorable events for over a decade bringing your vision to life with care, creativity, and professionalism.")
  
  updatedAt     DateTime @updatedAt
}

model TimelineMemory {
  id        Int      @id @default(autoincrement())
  image     String
  alt       String
  year      String
  size      String   @default("normal")
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

```

---

## 6. Admin & Key Features
*(Add specific instructions for the client here, e.g., default admin login)*

- **Admin Login Route**: `/admin/login` (or similar)
- **Default Credentials**: *(You should provide these securely or instruct how to create the first admin)*

---

## 7. Additional Scripts
- **`npm run lint`**: Check for code issues.
- **`npx prisma studio`**: Open a visual database editor in the browser.

---

*Generated automatically by Antigravity Assistant.*
