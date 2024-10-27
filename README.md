# Wiki Website
📚 A Simple Wiki Website for Devastate Roleplay

![Website Scrennshot](https://i.ibb.co/0QvyqFW/forum.png)

## Features
- **Admin Edit Console**: Quick access for administrators to edit or delete announcements without the need of a login/register system.
- **2FA Security**: Secure password-based access for authorized actions.
- **User-Friendly Navigation**: Simple browsing for server announcements.
- **Easy Setup**: The website uses simple JSON storing method. Everything should work normally once the website is up!

## How to use?
This wiki was designed to offer an organized, accessible space for server information, making it easy for users to browse and for admins to edit. Users can simply visit the website and click on any announcement they wish to read. Admins, however, need to type `editconsole` on the main page to open the edit console at the bottom of the screen. When the edit console is active, options to edit or delete existing announcements become available. For security, admins must enter two passwords to perform these actions. More details on password usage are provided later on this page.

## How to setup?
This project uses Express.js along with HTML, CSS, and JavaScript. To run it on your own machine, follow these steps:
1. Download node.js on your machine
2. Run the following command to install dependencies: `npm i express fs path body-parser uuid bcrypt jsonwebtoken cors`
3. Set your preferred port for the web server in the `server.js` file.
4.Generate a BCrypt password and store it in the `.env` file. (You can use my BCrypt Encryptor on GitHub to create this password.) This password is required as the "2FA Password" whenever the website requests it.
5. Add an Admin Password in the public/script.js in the `const adminPassword = "YOUR_ADMIN_PASSWORD";` line (not encrypted). You will need to type that password whenever the website asks you for an `Admin Password`
6. Run `node server.js`
7. The website should now be running on the URL displayed in the console. Refer to the *How to Use* section for instructions.

## Developer Notes
1. This code may seem a bit disorganized, as it was developed in just three days. Some parts may lack clarity or structure.
2. The drag-and-drop feature for images in the edit console is currently non-functional. To display images, simply include `.png` links within each announcement's content. The website will automatically display the images when such links are detected.
3. Announcements are saved in the `announcements.json` file, which works well for smaller wikis with around 1,000 announcements or fewer. For larger projects, consider alternative data storage solutions.
4. The 2FA Password is secure and stored on the backend. However, **note that the Admin Password is not encrypted and serves as a basic secondary security measure.**

### 🧡 Made by Skell! Please do not redistribute without permission! You can contact me on Discord `skellgreco` to aquire permission! Thanks!
![Node Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)
