# FIAP blog default prompt

## Prompt Identification

- **Name**: FIAP blog default prompt
- **Version**: 0.1
- **Created By**: MauGx3
- **Last Modified**: 2025-10-14
- **Category**: Web and mobile app

## Purpose and Goals

- **Primary Goal**: Create a basic web and mobile app using TypeScript, Vite, React and Docker, primarily focused on functionality, that contains the features stated on the SCAFF structure below.
- **Use Cases**: web development, mobile development, blogging
- **Expected Output**: A simple blog with user authentication, role-based access control, CRUD operations for posts, and responsive design, for both web and mobile.

## Technical Configuration

- **Target Model**: GitHub Copilot using GPT-5 mini
- **Parameters**:
  - Temperature: 0.5
  - Token Limit: 4000 tokens
  - Top-K: N/A
  - Top-P: N/A

## S.C.A.F.F. Structure

### Situation

This code is written primarily in TypeScript, using Vite and React, and is to be deployed using Docker. The backend is a Node.js/Express.js API, has JWT authentication, and role-based access control. The frontend uses React with styled-components for theming and axios for API calls. The database is MongoDB with Mongoose ODM.

### Challenge

Implement a feature-rich blog application with user authentication, role-based access control, and CRUD operations for posts, while ensuring a responsive design for both web and mobile platforms.

### Audience

The primary users of this application are bloggers and readers who want to create, manage, and read blog posts. The secondary audience includes developers who will maintain and extend the application.

### Format

- **Code Style**: Follow Mozilla's TypeScript style guide.
- **Documentation**: Use Swagger for API documentation and README.md for project documentation.
- **Project Template**: Use a monorepo structure with separate folders for frontend and backend.
- **Formatter**: Prettier and ESLint.
- **Testing**: Use Vitest and React Testing Library for frontend tests, and Jest for backend tests.
- **Local Development**: Use `docker-compose` for local development and testing.
- **Version Control**: Use `git` for version control using Conventional Commits.
- **Branching Strategy**: Use `main` as production-ready, `dev` as the main development branch, and feature branches for specific features or bug fixes.
- **Coding Style**:

### Foundations

This code will be mostly deployed as a Docker container, so there should be a focus on maintaining security and performance for a Docker app. For my personal use, I will run the app on a QNAP NAS running QTS 5. A large amount of data will be expected to be used as the app develops and the user collects more data, so consider best practices for following Big Data performance.

## Usage Guidelines

- **For Security-Critical Components**:

  - Set temperature: 0.0-0.2
  - Include explicit security requirements
  - Request detailed documentation of security measures
- **For Performance-Sensitive Components**:

  - Specify performance constraints
  - Request optimization techniques
  - Require complexity analysis
- **For UI Components**:

  - Include accessibility requirements
  - Specify responsive design needs
  - Reference design system patterns

## Effectiveness Metrics

- **Success Rate**: 85% usable on first attempt
- **Iteration Count**: Usually 3 to 5 iterations
- **Issues Found**: Integration between frontend and backend has the most issues
- **Time Savings**: Approximately 5 to 7 hours per implementation

## Documentation

- **Related Components**: N/A
- **Security Review**: CodeQL scans, GitHub Copilot automated reviews.
- **Notes and Insights**: This prompt was created based on the Vibe Coding Framework and follows the S.C.A.F.F. Prompt Structure. Refer to this docs regarding AI coding: [https://docs.vibe-coding-framework.com/](https://docs.vibe-coding-framework.com/)
- **Improvement History**:
  - 0.1: initial prompt
