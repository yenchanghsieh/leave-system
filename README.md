# Leave Management System

A comprehensive leave management application built with Next.js, Tailwind CSS, and TypeScript.

## Features

-   **Role-Based Access**:
    -   **Employees**: Apply for leave, view history, check balances.
    -   **Managers**: Approve/Reject requests from direct reports.
    -   **Admins**: Manage all users, departments, and system settings.
-   **Leave Types**: Annual, Sick, Personal, Family Care, Parental, Menstrual.
-   **Localization**: English, Traditional Chinese (zh-TW), and Japanese (ja).
-   **Dark Mode**: Fully supported via Tailwind CSS.
-   **Responsive Design**: Mobile-friendly UI.

## Getting Started

1.  Iinstall dependencies:
    ```bash
    npm install
    ```

2.  Run the development server:
    ```bash
    npm run dev
    ```

3.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Mock Data

The application uses local mock data for demonstration.
-   **Reset Data**: You can clear or reset data in `src/lib/mock-data.ts`.
-   **Admins**: Users in the **HR** department are automatically granted Admin privileges.
-   **Root User**: A default root admin is available (ID: `root`).

## Tech Stack

-   **Framework**: Next.js 14 (App Router)
-   **Styling**: Tailwind CSS
-   **Components**: shadcn/ui + Lucide Icons
-   **State**: React Context + LocalStorage Persistence
