

import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard({ user, onLogout }) {
    const [readings, setReadings] = useState([]);
    const [readingDate, setReadingDate] = useState("");
    const [timeSlot, setTimeSlot] = useState("Morning (fasting)");
    const [glucoseValue, setGlucoseValue] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const [dailyReport, setDailyReport] = useState(null);
    const [monthReport, setMonthReport] = useState(null);
    const [previousMonthReport, setPreviousMonthReport] = useState(null);

    const config = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    };

    const fetchReadings = async () => {
        try {
            const response = await API.get("/readings", config);
            setReadings(response.data.readings);
        } catch (err) {
            setError("Unable to load readings.");
        }
    };

    const fetchReports = async () => {
        try {
            const daily = await API.get("/readings/daily-report", config);
            setDailyReport(daily.data);

            const monthly = await API.get(
                "/readings/month-to-date-report", config
            );
            setMonthReport(monthly.data);

            const previous = await API.get(
                "/readings/previous-month-report", config
            );
            setPreviousMonthReport(previous.data);
        } catch (err) {
            console.log(
                "Unable to load reports:",
                err.response?.data || err.message
            );
        }
    };

    useEffect(() => {
        fetchReadings();
        fetchReports();
    }, []);

    const handleAddReading = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        const data = {
            reading_date: readingDate,
            time_slot: timeSlot,
            glucose_value: Number(glucoseValue)
        };

        try {
            if (isEditing) {
                await API.put(`/readings/${editingId}`, data, config);
                setMessage("Reading updated successfully!");
            } else {
                await API.post("/readings", data, config);
                setMessage("Reading added successfully!");
            }

            setReadingDate("");
            setTimeSlot("Morning (fasting)");
            setGlucoseValue("");
            setEditingId(null);
            setIsEditing(false);

            await fetchReadings();
            await fetchReports();
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to save reading."
            );
        }
    };

    const handleEdit = (reading) => {
        setEditingId(reading.id);
        setIsEditing(true);
        setReadingDate(
            new Date(reading.reading_date).toISOString().slice(0, 10)
        );
        setTimeSlot(reading.time_slot);
        setGlucoseValue(reading.glucose_value);
        setMessage("");
        setError("");
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditingId(null);
        setReadingDate("");
        setTimeSlot("Morning (fasting)");
        setGlucoseValue("");
        setMessage("");
        setError("");
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/readings/${id}`, config);
            setMessage("Reading deleted successfully!");
            await fetchReadings();
            await fetchReports();
        } catch (err) {
            setError("Unable to delete reading.");
        }
    };
    const renderReport = (report, emptyMessage) => {
    if (!report) {
        return <p>Loading report...</p>;
    }

    if (report.totalReadings === 0) {
        return <p>{emptyMessage}</p>;
    }

    return (
        <div>
            <h2>{report.totalReadings}</h2>
            <p>Total readings</p>
            <p>Highest: {report.highestGlucose} mg/dL</p>
            <p>Lowest: {report.lowestGlucose} mg/dL</p>
            <p>Average: {report.averageGlucose} mg/dL</p>
        </div>
    );
};

    return (
        <div className="dashboard">
            <header>
                <h1>Sweety 💗</h1>
                <p>Welcome, {user.name}!</p>
                <button onClick={onLogout}>Logout</button>
            </header>

            <section className="reading-form">
                <h2>{isEditing ? "Edit Glucose Reading" : "Add Glucose Reading"}</h2>

                <form onSubmit={handleAddReading}>
                    <label>Date</label>
                    <input
                        type="date"
                        value={readingDate}
                        onChange={(e) => setReadingDate(e.target.value)}
                        required
                    />

                    <label>Time Slot</label>
                    <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                    >
                        <option>Morning (fasting)</option>
                        <option>After breakfast</option>
                        <option>After lunch</option>
                        <option>After dinner</option>
                    </select>

                    <label>Glucose Value (mg/dL)</label>
                    <input
                        type="number"
                        min="40"
                        max="600"
                        value={glucoseValue}
                        onChange={(e) => setGlucoseValue(e.target.value)}
                        placeholder="Enter glucose value"
                        required
                    />

                    <button type="submit">
                        {isEditing ? "Update Reading" : "Add Reading"}
                    </button>

                    {isEditing && (
                        <button type="button" onClick={handleCancel}>
                            Cancel
                        </button>
                    )}
                </form>

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </section>
<section className="reports-section">
    <h2>Glucose Reports 📊</h2>

    <div className="report-card">
        <h3>Daily Report</h3>
        {renderReport(dailyReport, "No readings available for today.")}
    </div>

    <div className="report-card">
        <h3>Month-to-Date Report</h3>
        {renderReport(monthReport, "No readings available this month.")}
    </div>

    <div className="report-card">
        <h3>Previous Month Report</h3>
        {renderReport(
            previousMonthReport,
            "No readings available last month."
        )}
    </div>
</section>
            <section className="reading-list">
                <h2>Your Glucose Readings</h2>

                {readings.length === 0 ? (
                    <p>No readings available yet.</p>
                ) : (
                    readings.map((reading) => (
                        <div className="reading-card" key={reading.id}>
                            <div>
                                <strong>{reading.glucose_value} mg/dL</strong>
                                <p>{reading.time_slot}</p>
                                <p>
                                    {new Date(reading.reading_date)
                                        .toLocaleDateString("en-IN", {
                                            timeZone: "UTC"
                                        })}
                                </p>
                            </div>

                            <div>
                                <button onClick={() => handleEdit(reading)}>
                                    Edit
                                </button>

                                <button onClick={() => handleDelete(reading.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}

export default Dashboard;
