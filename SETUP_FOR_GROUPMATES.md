# Team Setup Guide

Welcome to the Commu-nect project! Follow these exact steps to set up your local environment so we don't encounter merge conflicts or CORS errors.

### 1. IDE Requirements
* Install **Visual Studio Code**.
* Go to Extensions (`Ctrl+Shift+X`) and install **Live Server** (by Ritwick Dey). *You must use this to run the app because we are using ES6 Modules for Firebase.*

### 2. Git Setup
1. Open terminal and run: `git clone https://github.com/[YOUR-USERNAME]/commu-nect.git`
2. Open the folder in VS Code: `code .`
3. **NEVER CODE ON MAIN.** Always create a branch for your task: `git checkout -b feature/your-task-name`

### 3. Firebase Configuration
We use Firebase for our backend. Do not push actual API keys directly to the main branch if the repo is public. 
1. Ask the backend lead for the `firebaseConfig` keys.
2. Paste them into the designated area inside `js/auth.js`.