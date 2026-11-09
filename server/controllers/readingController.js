

const pool = require("../config/db");

const allowedSlots = [
    "Morning (fasting)",
    "After breakfast",
    "After lunch",
    "After dinner"
];

// HELPER: Validate date format and actual calendar date
const isValidDate = (date) => {
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00Z`);

    return (
        !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date
    );
};

// HELPER: Calculate report statistics
const calculateStats = (readings) => {
    const values = readings.map((r) => Number(r.glucose_value));
    const totalReadings = values.length;

    return {
        totalReadings,
        highestGlucose: totalReadings ? Math.max(...values) : null,
        lowestGlucose: totalReadings ? Math.min(...values) : null,
        averageGlucose: totalReadings
            ? Number(
                (values.reduce((sum, value) => sum + value, 0) / totalReadings).toFixed(1)
            )
            : null
    };
};

// ADD READING
const addReading = async (req, res) => {
    try {
        const { reading_date, time_slot, glucose_value } = req.body;
        const userId = req.user.id;

        if (
            !reading_date ||
            !time_slot ||
            glucose_value === undefined ||
            glucose_value === null ||
            glucose_value === ""
        ) {
            return res.status(400).json({
                message: "Please enter all reading details."
            });
        }

        if (!isValidDate(reading_date)) {
            return res.status(400).json({
                message: "Please enter a valid date."
            });
        }

        const today = new Date().toLocaleDateString("en-CA");

        if (reading_date > today) {
            return res.status(400).json({
                message: "Date cannot be in the future."
            });
        }

        const value = Number(glucose_value);

        if (!Number.isInteger(value) || value < 40 || value > 600) {
            return res.status(400).json({
                message: "Value must be between 40 and 600 mg/dl."
            });
        }

        if (!allowedSlots.includes(time_slot)) {
            return res.status(400).json({
                message: "Invalid time slot."
            });
        }

        const countResult = await pool.query(
            `SELECT COUNT(*) FROM readings
             WHERE user_id = $1 AND reading_date = $2`,
            [userId, reading_date]
        );

        if (Number(countResult.rows[0].count) >= 4) {
            return res.status(400).json({
                message: "You can add only 4 readings per day."
            });
        }

        const existing = await pool.query(
            `SELECT id FROM readings
             WHERE user_id = $1
             AND reading_date = $2
             AND time_slot = $3`,
            [userId, reading_date, time_slot]
        );

        if (existing.rows.length > 0) {
            return res.status(409).json({
                message: `You already have an ${time_slot} reading for this date.`
            });
        }

        const result = await pool.query(
            `INSERT INTO readings
             (user_id, reading_date, time_slot, glucose_value)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [userId, reading_date, time_slot, value]
        );

        res.status(201).json({
            message: "Reading added successfully!",
            reading: result.rows[0]
        });

    } catch (error) {
        console.error("Add reading error:", error);

        res.status(500).json({
            message: "Failed to add reading."
        });
    }
};


// GET ALL READINGS
const getReadings = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT id, reading_date, time_slot, glucose_value
             FROM readings
             WHERE user_id = $1
             ORDER BY reading_date DESC, id DESC`,
            [userId]
        );

        res.status(200).json({
            count: result.rows.length,
            readings: result.rows
        });

    } catch (error) {
        console.error("Get readings error:", error);

        res.status(500).json({
            message: "Failed to fetch readings."
        });
    }
};


// UPDATE READING
const updateReading = async (req, res) => {
    try {
        const { id } = req.params;
        const { reading_date, time_slot, glucose_value } = req.body;
        const userId = req.user.id;

        if (
            !reading_date ||
            !time_slot ||
            glucose_value === undefined ||
            glucose_value === null ||
            glucose_value === ""
        ) {
            return res.status(400).json({
                message: "Please enter all reading details."
            });
        }

        if (!isValidDate(reading_date)) {
            return res.status(400).json({
                message: "Please enter a valid date."
            });
        }

        const today = new Date().toLocaleDateString("en-CA");

        if (reading_date > today) {
            return res.status(400).json({
                message: "Date cannot be in the future."
            });
        }

        const value = Number(glucose_value);

        if (!Number.isInteger(value) || value < 40 || value > 600) {
            return res.status(400).json({
                message: "Value must be between 40 and 600 mg/dl."
            });
        }

        if (!allowedSlots.includes(time_slot)) {
            return res.status(400).json({
                message: "Invalid time slot."
            });
        }

        const existing = await pool.query(
            `SELECT id FROM readings
             WHERE id = $1 AND user_id = $2`,
            [id, userId]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found."
            });
        }

        const result = await pool.query(
            `UPDATE readings
             SET reading_date = $1,
                 time_slot = $2,
                 glucose_value = $3
             WHERE id = $4 AND user_id = $5
             RETURNING *`,
            [reading_date, time_slot, value, id, userId]
        );

        res.status(200).json({
            message: "Reading updated successfully!",
            reading: result.rows[0]
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "You already have a reading for this time slot and date."
            });
        }

        console.error("Update reading error:", error);

        res.status(500).json({
            message: "Failed to update reading."
        });
    }
};


// DELETE READING
const deleteReading = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await pool.query(
            `DELETE FROM readings
             WHERE id = $1 AND user_id = $2
             RETURNING id`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Reading not found."
            });
        }

        res.status(200).json({
            message: "Reading deleted successfully!"
        });

    } catch (error) {
        console.error("Delete reading error:", error);

        res.status(500).json({
            message: "Failed to delete reading."
        });
    }
};


// DAILY REPORT
const getDailyReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const reportDate = req.query.date || new Date().toLocaleDateString("en-CA");

        if (!isValidDate(reportDate)) {
            return res.status(400).json({
                message: "Please enter a valid date."
            });
        }

        const result = await pool.query(
            `SELECT reading_date, time_slot, glucose_value
             FROM readings
             WHERE user_id = $1 AND reading_date = $2
             ORDER BY
                CASE time_slot
                    WHEN 'Morning (fasting)' THEN 1
                    WHEN 'After breakfast' THEN 2
                    WHEN 'After lunch' THEN 3
                    WHEN 'After dinner' THEN 4
                END`,
            [userId, reportDate]
        );

        res.status(200).json({
            report: "Daily",
            date: reportDate,
            ...calculateStats(result.rows),
            readings: result.rows
        });

    } catch (error) {
        console.error("Daily report error:", error);

        res.status(500).json({
            message: "Failed to generate daily report."
        });
    }
};


// MONTH-TO-DATE REPORT
const getMonthToDateReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const selectedDate = req.query.date || new Date().toLocaleDateString("en-CA");

        if (!isValidDate(selectedDate)) {
            return res.status(400).json({
                message: "Please enter a valid date."
            });
        }

        const startDate = `${selectedDate.slice(0, 7)}-01`;

        const result = await pool.query(
            `SELECT reading_date, time_slot, glucose_value
             FROM readings
             WHERE user_id = $1
             AND reading_date >= $2
             AND reading_date <= $3
             ORDER BY reading_date ASC,
                CASE time_slot
                    WHEN 'Morning (fasting)' THEN 1
                    WHEN 'After breakfast' THEN 2
                    WHEN 'After lunch' THEN 3
                    WHEN 'After dinner' THEN 4
                END`,
            [userId, startDate, selectedDate]
        );

        res.status(200).json({
            report: "Month-to-date",
            startDate,
            endDate: selectedDate,
            ...calculateStats(result.rows),
            readings: result.rows
        });

    } catch (error) {
        console.error("Month-to-date report error:", error);

        res.status(500).json({
            message: "Failed to generate month-to-date report."
        });
    }
};


// PREVIOUS MONTH REPORT
const getPreviousMonthReport = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT reading_date, time_slot, glucose_value
             FROM readings
             WHERE user_id = $1
             AND reading_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
             AND reading_date < DATE_TRUNC('month', CURRENT_DATE)
             ORDER BY reading_date ASC,
                CASE time_slot
                    WHEN 'Morning (fasting)' THEN 1
                    WHEN 'After breakfast' THEN 2
                    WHEN 'After lunch' THEN 3
                    WHEN 'After dinner' THEN 4
                END`,
            [userId]
        );

    const dates = await pool.query(`
    SELECT
        TO_CHAR(
            (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month')::date,
            'YYYY-MM-DD'
        ) AS start_date,
        TO_CHAR(
            (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::date,
            'YYYY-MM-DD'
        ) AS end_date
`);


       res.status(200).json({
    report: "Previous month",
    startDate: dates.rows[0].start_date,
    endDate: dates.rows[0].end_date,
    ...calculateStats(result.rows),
    readings: result.rows
});

    } catch (error) {
        console.error("Previous month report error:", error);

        res.status(500).json({
            message: "Failed to generate previous month report."
        });
    }
};


module.exports = {
    addReading,
    getReadings,
    updateReading,
    deleteReading,
    getDailyReport,
    getMonthToDateReport,
    getPreviousMonthReport
};
