const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const event = require("../models/events"); // Ensure the correct model is imported

// Set storage engine for multer
const storage = multer.diskStorage({
    destination: path.join(__dirname, '../uploads/'), // Ensure the correct path to the uploads folder
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // Limit file size to 5MB
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('file'); // 'file' should match the name of the input field in the frontend

// Check file type
function checkFileType(file, cb) {
    // Allowed file extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Images Only!'));
    }
}

// @route   POST api/events
// @desc    Create an event
// @access  Public
router.post("/", (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file is selected!' });
        }

        // Access form data
        const { title, summary, venue, date, content, userId } = req.body;
        const cover = path.join('uploads', req.file.filename); // Path to the uploaded file

        try {
            // Create a new event
            const newEvent = await event.create({
                title,
                summary,
                venue,
                date,
                content,
                cover,
                userId, // Save userId with the event
            });

            // Send a success response
            res.status(201).json({ message: 'Event created successfully', data: newEvent });
        } catch (error) {
            console.error('Error creating event:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
});

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Public
router.put("/:id", (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        // Access form data
        const { title, summary, venue, date, content, userId } = req.body;
        const updateData = { title, summary, venue, date, content };

        if (req.file) {
            updateData.cover = path.join('uploads', req.file.filename); // Path to the uploaded file
        }

        try {
            // Update the event
            const updatedEvent = await event.findByIdAndUpdate(req.params.id, updateData, { new: true });

            if (!updatedEvent) {
                return res.status(404).json({ message: 'Event not found' });
            }

            // Send a success response
            res.status(200).json({ message: 'Event updated successfully', data: updatedEvent });
        } catch (error) {
            console.error('Error updating event:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });
});

router.get("/", async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        res.status(200).json(
            await event.find({ date: { $gte: today } })
                .sort({ date: 1 })
                .limit(30)
        );
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const eventDoc = await event.findById(id);
        if (!eventDoc) {
            return res.status(404).json({ message: "Event not found" });
        }
        res.json(eventDoc);
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;