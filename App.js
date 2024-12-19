const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const bodyParser = require('body-parser');
const pointsRoute = require('./apii/points');
const trackwithbuddyRoute = require('./apii/trackwithbuddy');
const twilio = require("twilio");
const admin = require("firebase-admin");
const { URL, URLSearchParams } = require('url');
const cors = require('cors');
const path = require('path');


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
const serviceAccount = require("./skillrack-tracker-firebase-adminsdk-yte5e-5c892cb4fe.json"); // Replace with your Firebase Admin SDK key
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://skillrack-tracker-default-rtdb.firebaseio.com/",
});

// Serve the HTML, CSS, and JS files
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>TrackWithBuddy</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
            <style>
                body {
                    font-family: "Courier New", Courier, monospace;
                    margin: 0;
                    padding: 20px;
                    background-color: #f4f4f4;
                    color: #333;
                }
                body.dark {
                    background-color: #333;
                    color: #fff;
                }
                h1 {
                    color: green;
                }
                    h1.title {
            font-family: 'Courier New', Courier, monospace; /* Gives a coder-style font */
            text-align: center;
            margin-top: 50px;
            font-weight: bold;
            font-size: 3rem;
        }
                
                div {
                    margin: 10px 0;
                }
                input[type="url"], button, input[type="date"] {
                    padding: 10px;
                    margin-top: 5px;
                    font-size: 16px;
                }
                button {
                    cursor: pointer;
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                }
                button:hover {
                    background-color: #45a049;
                }
                .dark button {
                    background-color: #555;
                }
                .dark button:hover {
                    background-color: #444;
                }
                #calendar {
                    display: none;
                }
                .editor {
                    background-color: #2d2d2d;
                    color: #f8f8f2;
                    padding: 15px;
                    border-radius: 5px;
                    font-size: 14px;
                    overflow-x: auto;
                    white-space: pre-wrap;
                    line-height: 1.5;
                }
                .keyword {
                    color: #f92672;
                }
                .string {
                    color: #a6e22e;
                }
                .variable {
                    color: #66d9ef;
                }
                .dark .editor {
                    background-color: #272822;
                    color: #f8f8f2;
                }
                .line-numbers {
                    color: lightblue;
                    font-size: 14px;
                    margin-right: 10px;
                    display: inline-block;
                    width: 30px;
                }
                .dark .line-numbers {
                    color: #999;
                }
                .editor-content {
                    display: inline-block;
                }
                .editor-content span {
                    display: block;
                }
                .editor-content .keyword {
                    color: red;
                }
                .editor-content .variable {
                    color: blue;
                }
                .editor-content .string {
                    color: green;
                }
                .qr-container {
            display: flex;
            align-items: center;
            margin-top: 20px;
        }
        .qr-container img {
            width: 150px; /* Adjust size of the QR code */
            height: auto;
            margin-left: 20px;
        }
        .message {
            margin-top: 10px;
            font-size: 16px;
        }
            /* Container to align input and button at the bottom */
.footer {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #1e1e1e;
    padding: 15px;
    border-radius: 10px;
}

/* Input field styling */
#phoneNumber {
    padding: 12px;
    font-size: 18px;
    color: #fff;
    background-color: #121212;
    border: 1px solid #444;
    border-radius: 5px;
    font-family: 'Courier New', Courier, monospace;
    text-align: center;
    outline: none;
}

/* Button styling */
button {
    padding: 15px 30px;
    font-weight: bold;
    color: #fff;
    background-color:rgb(113, 191, 154);
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-family: 'Courier New', Courier, monospace;
    font-size: 18px;
    margin-left: 10px;
}

/* Button hover effect */
button:hover {
    background-color:rgba(10, 198, 89, 0.86);
}

/* Button focus effect */
button:focus {
    outline: none;
}

/* Placeholder text styling for input field */
input::placeholder {
    color: #888;
    font-style: italic;
}

            </style>
            <script type="module">
        // Import the Firebase SDKs
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
        import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-database.js";

        // Firebase configuration
        const firebaseConfig = {
            apiKey: "AIzaSyAX17tGH4g1UaokfMtzMv3SH33zpAbfeV4",
            authDomain: "skillrack-tracker.firebaseapp.com",
            databaseURL: "https://skillrack-tracker-default-rtdb.firebaseio.com",
            projectId: "skillrack-tracker",
            storageBucket: "skillrack-tracker.appspot.com",
            messagingSenderId: "42205378393",
            appId: "1:42205378393:web:c16cc4e17d52c1fcaa7e48",
            measurementId: "G-4YYWY1D43C"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);

        // Define the savePhoneNumber function and attach it to the global window object
        window.savePhoneNumber = function () {
            const phoneNumber = document.getElementById("phoneNumber").value;

            if (!phoneNumber.startsWith("+91") || phoneNumber.length !== 13) {
                alert("Please enter a valid phone number starting with +91 (e.g., +917904896640).");
                return;
            }

            const phoneRef = ref(database, "PhoneNumbers/" + phoneNumber); // Create a reference for the phone number
            set(phoneRef, { number: phoneNumber })
                .then(() => {
                    alert("Phone number stored successfully!");
                })
                .catch((error) => {
                    console.error("Error storing phone number:", error);
                    alert("Failed to store phone number. Please try again.");
                });
        };
    </script>
        </head>
        <body class="dark">
        
            <h1>TrackWithBuddy - Skillrack Profile</h1>
            <div style="display: flex; justify-content: space-between;">
                <button id="darkModeToggle"><i class="fas fa-sun"></i> Light Mode</button>
                <button id="loginBtn">Login</button>
            </div>
            
            <div>
                <label for="profileUrl">Enter Skillrack Profile URL:</label>
                <input type="url" id="profileUrl" placeholder="https://www.skillrack.com/profile/...">
                <button id="fetchProfile">Fetch Profile</button>
            </div>

            <div id="profileData" style="display: none;">
                <h3>Profile Data:</h3>
                <pre id="scheduleOutput" class="editor"></pre>
            </div>
             </div>
            
            <div>
                <label for="phoneNumber">Enter Phone Number For Daily Remainders with (+91):</label>
                <input type="text" id="phoneNumber" placeholder="+91XXXXXXXXXX">
                <button onclick="savePhoneNumber()">Save Phone Number</button>
                <div>
        <img src="/image.png" alt="QR Code">
        <p>Scan it with GLENS and send "join development-acres" msg to receive active notifications on DT,DC Remainders.</p>
    </div>
        
    <!-- QR Code and message container -->
            
       <div>
                <button id="scheduleAiBtn" style="display:none;">Schedule AI</button>
            </div>
            
            <div id="calendar">
                <label for="scheduleDate">Select Date:</label>
                <input type="date" id="scheduleDate">
                <button id="submitDate">Submit</button>
            </div>

            <script>
                document.addEventListener("DOMContentLoaded", () => {
                    // Load saved URL from localStorage if it exists
                    const savedUrl = localStorage.getItem("skillrackUrl");
                    if (savedUrl) {
                        document.getElementById("profileUrl").value = savedUrl;
                        fetchProfileData(savedUrl); // Fetch profile data on page load if URL exists
                        document.getElementById("loginBtn").textContent = "Logout";
                    }

                    // Event listener for dark/light mode toggle
                    document.getElementById("darkModeToggle").addEventListener("click", () => {
                        document.body.classList.toggle("dark");
                        const isDarkMode = document.body.classList.contains("dark");
                        // document.getElementById("darkModeToggle").innerHTML = isDarkMode ? '<i class="fas fa-moon"></i> Dark Mode' : '<i class="fas fa-sun"></i> Light Mode';
                        if (body.classList.contains("dark")) {
                toggleButton.innerHTML = '<i class="fas fa-moon"></i> Light Mode';
            } else {
                toggleButton.innerHTML = '<i class="fas fa-sun"></i> Dark Mode';
            }
                        updateCodeEditorTheme(isDarkMode);
                    });

                    // Event listener for the fetch profile button
                    document.getElementById("fetchProfile").addEventListener("click", async () => {
                        const profileUrl = document.getElementById("profileUrl").value;
                        if (profileUrl) {
                            // Save the URL to localStorage
                            localStorage.setItem("skillrackUrl", profileUrl);
                            document.getElementById("loginBtn").textContent = "Logout";
                            await fetchProfileData(profileUrl);
                        } else {
                            alert("Please enter a valid URL.");
                        }
                    });

                    // Event listener for the login/logout button
                    document.getElementById("loginBtn").addEventListener("click", () => {
                        const currentText = document.getElementById("loginBtn").textContent;
                        if (currentText === "Logout") {
                            localStorage.removeItem("skillrackUrl");
                            document.getElementById("profileUrl").value = '';
                            document.getElementById("profileData").style.display = "none";
                            document.getElementById("loginBtn").textContent = "Login";
                            alert("You have logged out.");
                        }
                    });

                    // Event listener for the schedule AI button
                    document.getElementById("scheduleAiBtn").addEventListener("click", () => {
                        document.getElementById("calendar").style.display = "block";
                    });

                    // Event listener for the submit button in the calendar
                    document.getElementById("submitDate").addEventListener("click", async () => {
                        const selectedDate = document.getElementById("scheduleDate").value;
                        if (selectedDate) {
                            const profileUrl = localStorage.getItem("skillrackUrl");
                            const response = await fetch("/apii/trackwithbuddy", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ url: profileUrl, date: selectedDate })
                            });
                            const scheduleData = await response.json();
                            displaySchedule(scheduleData);
                        } else {
                            alert("Please select a date.");
                        }
                    });
                });

                // Function to fetch profile data and display the schedule
                async function fetchProfileData(url) {
                    try {
                        const response = await fetch("/apii/points", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ url })
                        });

                        if (!response.ok) {
                            throw new Error("Failed to fetch profile data.");
                        }

                        const profileData = await response.json();
                        displayProfile(profileData);
                    } catch (error) {
                        console.error(error);
                        alert("An error occurred while fetching profile data.");
                    }
                }

                // Function to display the profile data
                function displayProfile(data) {
    const profileData = document.getElementById("profileData");
    profileData.innerHTML = ""; // Clear previous content
    profileData.style.color="#00ce21";
    

    // Greeting message
    const greeting = document.createElement("h2");
    greeting.textContent = \`Hi Coder, \${data.name || "N/A"} (\${data.dept || "Unknown Department"}, \${data.college || "Unknown College"})\`;
    greeting.style.textAlign = "center";
    greeting.style.marginBottom = "20px";
    profileData.appendChild(greeting);

    // Create a container for the points and progress details
    const pointsBox = document.createElement("div");
    pointsBox.style.display = "grid";
    pointsBox.style.gridTemplateColumns = "repeat(2, 1fr)";
    pointsBox.style.gap = "15px";
    pointsBox.style.padding = "20px";
    pointsBox.style.backgroundColor = "#1e1e1e";
    pointsBox.style.borderRadius = "10px";
    pointsBox.style.boxShadow = "0 4px 8px rgba(17, 213, 72, 0.95)";

    const pointFields = {
        "code_track": "Programming Tracks Completed 2 points",
        "code_test": "Code Tests 10 points",
        "dc": "Daily Challenges (DC) 2 points",
        "dt": "Daily Tracks (DT) 10 points",
        "points": "Total Points Earned",
        "percentage_completed": "Completion Percentage"
    };

    for (const [key, label] of Object.entries(pointFields)) {
        const pointDetailBox = document.createElement("div");
        pointDetailBox.style.border = "1px solid #ccc";
        pointDetailBox.style.padding = "15px";
        pointDetailBox.style.borderRadius = "8px";
        pointDetailBox.style.backgroundColor = "#e9e9e9";

        const detailLabel = document.createElement("p");
        detailLabel.style.fontWeight = "bold";
        detailLabel.textContent = \`\${label}:\`;

        const detailValue = document.createElement("p");
        detailValue.style.fontSize = "18px";
        detailValue.textContent = data[key] || "0";

        pointDetailBox.appendChild(detailLabel);
        pointDetailBox.appendChild(detailValue);

        pointsBox.appendChild(pointDetailBox);
    }

    profileData.appendChild(pointsBox);

    // Adding a progress bar for percentage completed
    const percentage = Math.min(
        ((data.points / data.required_points) * 100) || 0,
        100
    );

    const progressContainer = document.createElement("div");
    progressContainer.style.marginTop = "20px";
    progressContainer.style.height = "30px";
    progressContainer.style.backgroundColor = "#ddd";
    progressContainer.style.borderRadius = "15px";

    const progressFill = document.createElement("div");
    progressFill.style.width = \`\${percentage}%\`;
    progressFill.style.height = "100%";
    progressFill.style.backgroundColor = "#00ce21";
    progressFill.style.borderRadius = "15px";

    progressContainer.appendChild(progressFill);

    const completionText = document.createElement("span");
    completionText.innerText = \`\${percentage}% Completed\`;
    completionText.style.marginLeft = "15px";
    progressContainer.appendChild(completionText);

    profileData.appendChild(progressContainer);
    profileData.style.display = "block";

    document.getElementById("scheduleAiBtn").style.display = "inline-block";

   // updateCodeEditorTheme(document.body.classList.contains("dark"));
}


                // Function to apply a code editor-like theme for syntax highlighting
                function updateCodeEditorTheme(isDarkMode) {
    const scheduleOutput = document.getElementById("scheduleOutput");

    // Define theme colors based on dark or light mode
    const stringColor = isDarkMode ? "#ffeb3d" : "#f48fb1";
    const keywordColor = isDarkMode ? "#90caf9" : "#1976d2";
    const variableColor = isDarkMode ? "#a5d6a7" : "#388e3c";

    // Apply syntax highlighting to the code editor
    scheduleOutput.innerHTML = scheduleOutput.innerText
        .replace(/"(.*?)"/g, \`<span class="string" style="color:\${stringColor}">"$1"</span>\`) // Strings
        .replace(/\b(true|false)\b/g, \`<span class="keyword" style="color:\${keywordColor}">$1</span>\`) // Booleans
        .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\b/g, \`<span class="variable" style="color:\${variableColor}">$1</span>\`); // Variables

    // Apply theme to pointDetailBox elements
    const pointDetailBoxes = document.querySelectorAll(".pointDetailBox");
    pointDetailBoxes.forEach(box => {
        const backgroundColor = isDarkMode ? "#1e1e1e" : "#e9e9e9";
        const textColor = isDarkMode ? "#FFFFFF" : "#000000";
        const borderColor = isDarkMode ? "#444" : "#ccc";

        pointDetailBox.style.backgroundColor = backgroundColor;
        box.style.color = textColor;
        box.style.borderColor = borderColor;
        box.style.padding = "15px";
        box.style.borderRadius = "8px";
    });
}

                        

                function displaySchedule(data) {
                    console.log(data);
                        const table = document.createElement("table");
                        table.style.width = "100%";
                        table.style.border = "1px solid #ddd";
                        table.style.borderCollapse = "collapse";
                        const Sdata = data.schedule
                        table.innerHTML = \`
                            <thead>     
                                <tr>
                                    <th>Date</th>
                                    <th>Tracks</th>
                                    <th>DT</th>
                                    <th>DC</th>
                                    <th>Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                \${Sdata.map(item => {
                                    return \`
                                        <tr>
                                            <td style="padding: 8px; border: 1px solid #ddd;">\${item.date}</td>
                                            <td style="padding: 8px; border: 1px solid #ddd;">\${item.tracks}</td>
                                            <td style="padding: 8px; border: 1px solid #ddd;">\${item.dt}</td>
                                            <td style="padding: 8px; border: 1px solid #ddd;">\${item.dc}</td>
                                            <td style="padding: 8px; border: 1px solid #ddd;">\${item.points}</td>
                                        </tr>
                                    \`;
                                }).join("")}
                            </tbody>
                        \`;

                        document.getElementById("profileData").appendChild(table);
                    }
            </script>
        </body>
        </html>
    `);
});



// Helper function to scrape Skillrack profile
async function scrapeSkillrackProfile(url) {
    const profileData = {
        id: '',
        name: '',
        dept: '',
        year: '',
        college: '',
        code_tutor: 0,
        code_track: 0,
        code_test: 0,
        dt: 0,
        dc: 0,
        points: 0,
        required_points: 5000,
        deadline: '30-04-2024',
        percentage: 100,
        last_fetched: new Date().toISOString().replace('T', ' ').slice(0, 19),
        url: url
    };

    try {
        // Fetch page content
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Extract profile ID from URL
        const parsedUrl = new URL(url);
        profileData.id = new URLSearchParams(parsedUrl.search).get('id') || url.split('/')[4];

        // Extract name and remove any newline characters
        const nameDiv = $('div.ui.big.label.black');
        if (nameDiv.length) {
            profileData.name = nameDiv.text().trim().replace(/\n/g, " ").replace(/\s+/g, ' ').replace('PROGRAMMING SUMMARY','').replace(/\b([1-9]|[1-9][0-9]|100)\b/g, '').replace('CERTIFICATE(S)','').trim();
        }

        // Extract department, year, and college
        const profileDiv = $('div.ui.four.wide.center.aligned.column');
        if (profileDiv.length) {
            const rawText = profileDiv.text().trim().split('\n');
            if (rawText.length > 8) {
                profileData.dept = rawText[4].trim();
                profileData.college = rawText[6].trim();
                profileData.year = rawText[8].trim().slice(-4);
            }
        }

        // Extract statistics
        const statisticsDiv = $('div.statistic');
        const labelsToExtract = {
            'CODE TUTOR': 'code_tutor',
            'CODE TEST': 'code_test',
            'CODE TRACK': 'code_track',
            'DC': 'dc',
            'DT': 'dt',
            'Points': 'points',
            'Required Points': 'required_points',
            'Deadline': 'deadline',
            'Percentage': 'percentage'
        };

        statisticsDiv.each((_, stat) => {
            const label = $(stat).find('div.label').text().trim();
            const value = $(stat).find('div.value').text().trim();

            if (label && labelsToExtract[label]) {
                if (label === 'Percentage') {
                    profileData.percentage = parseInt(value.replace('%', '')) || 100;
                } else if (label === 'Deadline') {
                    profileData.deadline = '30-04-2024';
                } else {
                    profileData[labelsToExtract[label]] = parseInt(value) || value;
                }
            }
        });

        // Calculate points and percentage completed
        profileData.points =
            profileData.code_test * 30 +
            profileData.dc * 2 +
            profileData.dt * 20 +
            profileData.code_track * 2;

        profileData.percentage_completed =
            (profileData.points / profileData.required_points) * 100+"%";

        // Return the cleaned-up profile data
        return profileData;

    } catch (error) {
        throw new Error('Failed to fetch or parse the profile data.');
    }
}


// Endpoint: /api/trackwithbuddy
app.post('/apii/trackwithbuddy', async (req, res) => {
    const { url, date } = req.body; // Only url and date are expected in the request body

    if (!url || !date) {
        return res.status(400).json({ error: 'URL and date are required' });
    }

    try {
        // Fetch profile data based on the provided URL (Assuming there's a function `fetchProfileData` to fetch this)
        const profileData = await scrapeSkillrackProfile(url); 
        console.log(profileData);
        // Ensure profile data is available
        if (!profileData) {
            return res.status(400).json({ error: 'Profile data not found or invalid format' });
        }

        // Use profileData directly
        const { code_track, dt, dc, points, code_test, required_points, deadline } = profileData;

        const today = new Date();
        const finishDate = new Date(date);

        // Calculate the number of days left until the finish date
        const daysToFinish = Math.ceil((finishDate - today) / (24 * 60 * 60 * 1000));
        if (daysToFinish <= 0) {
            return res.status(400).json({ error: 'Finish date must be in the future!' });
        }

        const target = required_points; // Directly using required_points from profileData
        const dailyPoints = (target - points) / daysToFinish;
        let trackInc = Math.ceil(dailyPoints / 2);

        let scheduleList = [];
        for (let i = 0; i < daysToFinish; i++) {
            today.setDate(today.getDate() + 1);
            const updatedDt = dt + i;
            const updatedDc = dc + i;
            const updatedCodeTrack = code_track + trackInc * i;
            const updatedPoints = Math.floor(updatedCodeTrack) * 2 + Math.floor(updatedDt) * 20 + Math.floor(updatedDc) * 2 + Math.floor(code_test) * 30;

            scheduleList.push({
                date: today.toLocaleDateString(),
                tracks: Math.floor(updatedCodeTrack),
                dt: updatedDt,
                dc: updatedDc,
                points: Math.floor(updatedPoints),
            });

            if (updatedPoints >= target) break;
        }

        const trackIncrement = trackInc;
        console.log(scheduleList);
        res.json({
            schedule: scheduleList,
            trackIncrement,
            status: 'Success'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint: /api/points
app.post('/apii/points', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'No URL provided in the request body' });
    }

    try {
        const decodedUrl = decodeURIComponent(url);
        if (!decodedUrl.startsWith('http')) {
            return res.status(400).json({ error: 'Invalid URL provided' });
        }

        const profileData = await scrapeSkillrackProfile(decodedUrl);
        res.json(profileData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// app.use('/api/points', pointsRoute); // Route for /api/points
// app.use('/api/trackwithbuddy', trackwithbuddyRoute); // Route for /api/trackwithbuddy

// Twilio Configuration
const accountSid = "AC552749b30556d245c1890649d28fce3f"; // Replace with your Twilio Account SID
const authToken = "2c758760f7645cfc0efdf6b58aadd21f"; // Replace with your Twilio Auth Token
const client = twilio(accountSid, authToken);
const fromWhatsAppNumber = "whatsapp:+14155238886"; // Replace with your Twilio WhatsApp sandbox number

// // API Endpoint: Send WhatsApp Messages
// app.post("/api/sendwhatsapp", async (req, res) => {
//   try {
//     // Fetch phone numbers from Firebase
//     const db = admin.database();
//     const phoneNumbersRef = db.ref("PhoneNumbers");
//     const snapshot = await phoneNumbersRef.once("value");

//     if (!snapshot.exists()) {
//       return res.status(404).json({ message: "No phone numbers found in the database." });
//     }

//     // Fetch the DC, DT, and Level from Firebase
//     const contentRef = admin.database().ref('Content');
//     const contentSnapshot = await contentRef.once('value');
//     const content = contentSnapshot.val();

//     if (!content) {
//       return res.status(404).send('No content found in Firebase');
//     }
//     const phoneNumbers = snapshot.val();
//     console.log(phoneNumbers)
    
//     // Assuming we get a single entry in Content, extract the values
//     const dtValue = content.DT || '';
//     const dcValue = content.DC || '';
//     const levelValue = content.Level || '';
//     // Determine the color-coded level
//     let levelEmoji = '';
//     if (levelValue.toLowerCase() === 'easy') {
//       levelEmoji = '🟢'; // Green for Easy
//     } else if (levelValue.toLowerCase() === 'medium') {
//       levelEmoji = '🟡'; // Yellow for Medium
//     } else if (levelValue.toLowerCase() === 'hard') {
//       levelEmoji = '🔴'; // Red for Hard
//     }
//     // Construct the message
//     const messageBody = `🚨 Hey there, superstar! 🚨

//     🔍 Today, the DT challenge is: *${dtValue}* 🧩 
//     🧠 Your DC puzzle is: *${dcValue}* 🏆
//     ✨ Both puzzles are at the *${levelValue}* level! ${levelEmoji} 💪 Ready to crack 'em? 😎
    
//     Let's get to work and show those puzzles who's boss! 💥
    
//     Good luck! 🍀`
    
//     if (!messageBody) {
//       return res.status(400).json({ message: "Message body is required." });
//     }

//     // Send WhatsApp messages to all phone numbers
//     const sendPromises = Object.values(phoneNumbers).map((entry) => {
//       const toWhatsAppNumber = entry.number; // Phone number from Firebase
//       return client.messages.create({
//         body: messageBody,
//         from: fromWhatsAppNumber,
//         to: `whatsapp:${toWhatsAppNumber}`,
//       });
//     });

//     // Wait for all messages to be sent
//     await Promise.all(sendPromises);

//     res.status(200).json({ message: "WhatsApp messages sent successfully!" });
//   } catch (error) {
//     console.error("Error sending WhatsApp messages:", error);
//     res.status(500).json({ message: "Failed to send WhatsApp messages.", error });
//   }
// });
// Function to fetch and send messages
async function sendWhatsAppMessage() {
    try {
      // Fetch phone numbers from Firebase
      const db = admin.database();
      const phoneNumbersRef = db.ref("PhoneNumbers");
      const snapshot = await phoneNumbersRef.once("value");
  
      if (!snapshot.exists()) {
        console.log("No phone numbers found in the database.");
        return;
      }
  
      // Fetch the DC, DT, and Level from Firebase
      const contentRef = admin.database().ref('Content');
      const contentSnapshot = await contentRef.once('value');
      const content = contentSnapshot.val();
  
      if (!content) {
        console.log('No content found in Firebase');
        return;
      }
  
      const phoneNumbers = snapshot.val();
      const dtValue = content.DT || '';
      const dcValue = content.DC || '';
      const levelValue = content.Level || '';
      
      // Determine the color-coded level
      let levelEmoji = '';
      if (levelValue.toLowerCase() === 'easy') {
        levelEmoji = '🟢'; // Green for Easy
      } else if (levelValue.toLowerCase() === 'medium') {
        levelEmoji = '🟡'; // Yellow for Medium
      } else if (levelValue.toLowerCase() === 'hard') {
        levelEmoji = '🔴'; // Red for Hard
      }
  
      // Construct the message
      const messageBody = `🚨 Hey there, superstar! 🚨
  
      🔍 Today, the DT challenge is: *${dtValue}* 🧩 
      🧠 Your DC puzzle is: *${dcValue}* 🏆
      ✨ Both puzzles are at the *${levelValue}* level! ${levelEmoji} 💪 Ready to crack 'em? 😎
  
      Let's get to work and show those puzzles who's boss! 💥
  
      Good luck! 🍀`;
  
      // Send WhatsApp messages to all phone numbers
      const sendPromises = Object.values(phoneNumbers).map((entry) => {
        const toWhatsAppNumber = entry.number; // Phone number from Firebase
        return client.messages.create({
          body: messageBody,
          from: fromWhatsAppNumber,
          to: `whatsapp:${toWhatsAppNumber}`,
        });
      });
  
      // Wait for all messages to be sent
      await Promise.all(sendPromises);
      console.log("WhatsApp messages sent successfully!");
    } catch (error) {
      console.error("Error sending WhatsApp messages:", error);
    }
  }
  app.post("/apii/sendwhatsapp", async (req, res) => {
    try {
      await sendWhatsAppMessage();
      res.status(200).json({ message: "WhatsApp messages sent successfully!" });
    } catch (error) {
      res.status(500).json({ message: "Failed to send WhatsApp messages.", error });
    }
  });  
function scheduleWhatsAppMessages() {
    // Define the times for sending messages (24-hour format: HH:MM)
    const times = ['07:00', '12:00', '18:15', '00:00', '23:30']; // You can modify this list as needed
  
    // Function to calculate the time difference between now and the next time
    function getTimeDifference(targetTime) {
      const now = new Date();
      const target = new Date(now);
      const [hours, minutes] = targetTime.split(':').map(num => parseInt(num, 10));
  
      target.setHours(hours, minutes, 0, 0);
      if (target < now) {
        target.setDate(target.getDate() + 1); // Schedule for the next day if the time has passed today
      }
  
      return target - now; // Return time difference in milliseconds
    }
  
    // Schedule the API call at the defined times
    times.forEach(time => {
      const timeDifference = getTimeDifference(time);
  
      setTimeout(() => {
        sendWhatsAppMessage(); // Call the API when the time arrives
        setInterval(sendWhatsAppMessage, 24 * 60 * 60 * 1000); // Call the API every 24 hours after the first call
      }, timeDifference);
    });
  }

// // Endpoint to send WhatsApp message
// app.post('/api/sendwhatsapp', async (req, res) => {
//     try {
//       // Fetch the DC, DT, and Level from Firebase
//       const contentRef = admin.database().ref('Content');
//       const contentSnapshot = await contentRef.once('value');
//       const content = contentSnapshot.val();
  
//       if (!content) {
//         return res.status(404).send('No content found in Firebase');
//       }
  
//       // Assuming we get a single entry in Content, extract the values
//       const dtValue = content.DT || '';
//       const dcValue = content.DC || '';
//       const levelValue = content.Level || '';
  
//       // Construct the message
//       const message = `🚨 Hey there, superstar! 🚨

//       🔍 Today, the DT challenge is: *${dtValue}* 🧩 
//       🧠 Your DC puzzle is: *${dcValue}* 🏆
//       ✨ Both puzzles are at the *${levelValue}* level! 💪 Ready to crack 'em? 😎
      
//       Let's get to work and show those puzzles who's boss! 💥
      
//       Good luck! 🍀`
      
//       // Get phone numbers from Firebase
//       const phoneNumbersRef = admin.database().ref('PhoneNumbers');
//       const phoneNumbersSnapshot = await phoneNumbersRef.once('value');
//       const phoneNumbers = phoneNumbersSnapshot.val();
  
//       if (!phoneNumbers) {
//         return res.status(404).send('No phone numbers found in Firebase');
//       }
  
//       // Send message to each phone number
//       const promises = Object.keys(phoneNumbers).map(async (key) => {
//         const phoneNumber = phoneNumbers[key].number;
//         try {
//           const messageResponse = await twilioClient.messages.create({
//             body: message,
//             from: 'whatsapp:+14155238886', // Replace with your Twilio WhatsApp-enabled number
//             to: `whatsapp:${phoneNumber}` // Ensure this includes the WhatsApp prefix
//           });
//           console.log(`Message sent to ${phoneNumber}:`, messageResponse.sid);
//         } catch (error) {
//           console.error('Error sending WhatsApp message:', error);
//         }
//       });
  
//       // Wait for all messages to be sent
//       await Promise.all(promises);
  
//       res.status(200).send('Messages sent successfully!');
//     } catch (error) {
//       console.error('Error sending messages:', error);
//       res.status(500).send('Error sending messages');
//     }
//   });
// Start the server
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//     scheduleWhatsAppMessages(); 
// });
// curl -X POST http://127.0.0.1:3000/api/points -H "Content-Type: application/json" -d "{\"url\": \"http://www.skillrack.com/profile/466648/ca102ea9fcbf53b1a5fe134f6d13364e723aab47\"}"
module.exports = app;
// curl -X POST http://127.0.0.1:4000/api/points -H "Content-Type: application/json" -d "{\"url\": \"http://www.skillrack.com/profile/466648/ca102ea9fcbf53b1a5fe134f6d13364e723aab47\"}"