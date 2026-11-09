

const pool = require("./config/db");
const bcrypt = require("bcrypt");

const seedDatabase = async () => {
    try {
        // Create demo user
        const name = "Demo User";
        const email = "demo@sweety.com";
        const password = "Demo@123";

        const hashedPassword = await bcrypt.hash(password, 10);

        const userResult = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             ON CONFLICT (email)
             DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [name, email, hashedPassword]
        );

        const userId = userResult.rows[0].id;

        // Sample readings for today
        const sampleReadings = [
            ["Morning (fasting)", 95],
            ["After breakfast", 125],
            ["After lunch", 140],
            ["After dinner", 120]
        ];

        for (const [timeSlot, glucoseValue] of sampleReadings) {
            await pool.query(
                `INSERT INTO readings
                 (user_id, reading_date, time_slot, glucose_value)
                 VALUES ($1, CURRENT_DATE, $2, $3)
                 ON CONFLICT (user_id, reading_date, time_slot)
                 DO NOTHING`,
                [userId, timeSlot, glucoseValue]
            );
        }

        console.log("Database seeded successfully!");
        console.log("Demo email:", email);
        console.log("Demo password:", password);

    } catch (error) {
        console.error("Seeding error:", error);
    } finally {
        await pool.end();
    }
};

seedDatabase();
