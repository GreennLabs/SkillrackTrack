const express = require('express');
const { scrapeSkillrackProfile } = require('./points'); // Assuming `scrapeSkillrackProfile` is defined in points.js or you can define it here
const router = express.Router();

// Endpoint: /api/trackwithbuddy
// router.post('/',
module.exports= async (req, res) => {
    const { url, date } = req.body; // Only URL and date are expected in the request body

    if (!url || !date) {
        return res.status(400).json({ error: 'URL and date are required' });
    }

    try {
        // Fetch profile data based on the provided URL (Assuming scrapeSkillrackProfile function to fetch data)
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
};

// module.exports = router;
