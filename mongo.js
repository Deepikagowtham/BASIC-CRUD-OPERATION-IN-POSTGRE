// Import required modules
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

// Create Express app
const app = express();
const port = 3000; // Port number for the server

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '20-Nov-04',
    port: 5432,
});

// Serve the HTML form file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Create the "user_details" table
pool.connect((err) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    pool.query(`CREATE TABLE IF NOT EXISTS user_details (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        rollno VARCHAR(255),
        email VARCHAR(255),
        phno VARCHAR(20)
    )`, (err, result) => {
        if (err) {
            return console.error("Error creating table 'user_details':", err);
        }
        console.log("Table 'user_details' created successfully");
    });
});

// Handle form submission and insert data into PostgreSQL
app.post('/login', async (req, res) => {
    console.log(req.body);  // Log the request body
    const { name, rollno, email, phno } = req.body;
    try {
        await pool.query("INSERT INTO user_details (name, rollno, email, phno) VALUES ($1, $2, $3, $4)", [name, rollno, email, phno]);
        console.log("Number of rows inserted: 1");
        res.redirect('/');
    } catch (err) {
        console.error('Error inserting data:', err.stack);
        res.status(500).send('Failed to insert data');
    }
});


// Handle updating data in PostgreSQL
app.post('/update', async (req, res) => {
    const { name, rollno, email, phno } = req.body;
    try {
        await pool.query("UPDATE user_details SET name = $1, email = $2, phno = $3 WHERE rollno = $4", [name, email, phno, rollno]);
        console.log("Document updated");
        res.redirect('/report');
    } catch (err) {
        console.error('Error updating data:', err.stack);
        res.status(500).send('Failed to update data');
    }
});

// Handle deleting data from PostgreSQL
app.post('/delete', async (req, res) => {
    const { rollno } = req.body;
    try {
        await pool.query("DELETE FROM user_details WHERE rollno = $1", [rollno]);
        console.log("Document deleted");
        res.redirect('/report');
    } catch (err) {
        console.error('Error deleting data:', err.stack);
        res.status(500).send('Failed to delete data');
    }
});

// Endpoint to retrieve and display a simple report from PostgreSQL
// Endpoint to retrieve and display a simple report from PostgreSQL
// Endpoint to retrieve and display a simple report from PostgreSQL
app.get('/report', async (req, res) => {
    try {
        const result = await pool.query("SELECT name, rollno, email, phno FROM user_details");
        const items = result.rows;

        // Create HTML content for the report
        let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>User Report</title>
            <style>
                html {
                    height: 100%;
                }
                body {
                    margin: 0;
                }
                .bg {
                    animation: slide 3s ease-in-out infinite alternate;
                    background-image: linear-gradient(-60deg, #6c3 50%, #09f 50%);
                    bottom: 0;
                    left: -50%;
                    opacity: .5;
                    position: fixed;
                    right: -50%;
                    top: 0;
                    z-index: -1;
                }
                .bg2 {
                    animation-direction: alternate-reverse;
                    animation-duration: 4s;
                }
                .bg3 {
                    animation-duration: 5s;
                }
                .content {
                    background-color: rgba(255, 255, 255, .8);
                    border-radius: .25em;
                    box-shadow: 0 0 .25em rgba(0, 0, 0, .25);
                    box-sizing: border-box;
                    left: 50%;
                    padding: 10vmin;
                    position: fixed;
                    text-align: center;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 1; /* Ensure content is above background */
                }
                h1 {
                    font-family: monospace;
                }
                @keyframes slide {
                    0% {
                        transform: translateX(-25%);
                    }
                    100% {
                        transform: translateX(25%);
                    }
                }
            </style>
        </head>
        <body>
            <div class="bg"></div>
            <div class="bg bg2"></div>
            <div class="bg bg3"></div>
            <div class="content">
                <h1>Report</h1>
                <table border="1">
                    <tr>
                        <th>Name</th>
                        <th>Roll No</th>
                        <th>Email ID</th>
                        <th>Phone Number</th>
                    </tr>`;

        htmlContent += items.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>${item.rollno}</td>
                        <td>${item.email}</td>
                        <td>${item.phno}</td>
                    </tr>`).join("");

        htmlContent += `</table>
                <a href='/' class="back-btn">Back to Form</a>
            </div>
        </body>
        </html>`;

        res.send(htmlContent); // Send the report HTML content as response
    } catch (err) {
        console.error('Error fetching data:', err.stack);
        res.status(500).send('Failed to fetch data');
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
