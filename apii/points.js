const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { URL, URLSearchParams } = require('url');
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser');

// Set up the cors options
const corsOptions = {
  origin: '*', // Allow all origins (you can restrict it to specific domains)
};
// Scrape Skillrack profile data
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
            (profileData.points / profileData.required_points) * 100 + "%";

        // Return the cleaned-up profile data
        return profileData;

    } catch (error) {
        throw new Error('Failed to fetch or parse the profile data.');
    }
}

// Handle POST request to /api/points
// router.post('/',
module.exports =  async (req, res) => {
    console.log(req);
    console.log(req);
    cors(corsOptions)(req, res, async () => {
        if (req.method === 'POST') {
          // Ensure the request body contains 'url'
          const { url } = req.body;
    
          if (!url) {
            return res.status(400).json({ error: 'No URL provided in the request body' });
          }
    
          try {
            // Decode the URL to handle any encoded characters
            const decodedUrl = decodeURIComponent(url);
    
            // Validate the URL
            if (!decodedUrl.startsWith('http')) {
              return res.status(400).json({ error: 'Invalid URL provided' });
            }
    
            // Assume scrapeSkillrackProfile is a function to scrape profile data
            const profileData = await scrapeSkillrackProfile(decodedUrl);
            res.json(profileData); // Send the profile data as a JSON response
    
          } catch (error) {
            res.status(500).json({ error: error.message }); // Handle any errors during scraping
          }
        } else {
          // If the method is not POST, respond with a 405 Method Not Allowed
          res.status(405).json({ error: 'Method Not Allowed' });
        }
      });
    };