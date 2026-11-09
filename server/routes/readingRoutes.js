
const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
    addReading,
    getReadings,
    updateReading,
    deleteReading,
    getDailyReport,
     getMonthToDateReport,
      getPreviousMonthReport
} = require("../controllers/readingController");
// All reading routes require login
router.use(authMiddleware);

// Create
router.post("/", addReading);

// Read
router.get("/", getReadings);

// Update
router.put("/:id", updateReading);

// Delete
router.delete("/:id", deleteReading);

// DAILY REPORT
router.get("/daily-report", getDailyReport);

// MONTH-TO-DATE REPORT
router.get("/month-to-date-report", getMonthToDateReport);


// PREVIOUS MONTH REPORT
router.get("/previous-month-report", getPreviousMonthReport);
module.exports = router;