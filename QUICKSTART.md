# Team Setup & Git Quickstart

Welcome to Commu-nect! Before you write any code, you must set up your local development environment exactly as outlined below to avoid merge conflicts and CORS errors.

## Step 1: IDE Setup (VS Code)
We are using Visual Studio Code as our standard editor. 
1. Download and install [VS Code](https://code.visualstudio.com/).
2. Open VS Code and go to the **Extensions** tab (`Ctrl+Shift+X`).
3. Search for and install **Live Server** (by Ritwick Dey). 
   * *Why? We are using ES6 Modules for Firebase. Opening the HTML files directly in your browser will break the app. You MUST use Live Server to test your code.*

## Step 2: Git Setup & Cloning
1. Open your terminal (or Git Bash) in the folder where you want to store the project.
2. Clone the repository to your local machine:
   ```bash
   git clone [https://github.com/](https://github.com/)[YOUR-USERNAME]/commu-nect.git

### How to test the app locally:
1. Ensure your `js/auth.js` has the correct Firebase keys.
2. Open `index.html` in VS Code.
3. Right-click and select **"Open with Live Server"**. The app will open at `http://127.0.0.1:5500`.
4. **Register**: Use a valid email. Select either "Resident" or "Non-Resident".
5. **Verify**: You must click the verification link sent to your email within 3 minutes.
6. **Login**: Log in to access the Dashboard.