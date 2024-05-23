// Import required modules
const express = require("express");
const { MongoClient } = require("mongodb"); // Import MongoClient from mongodb module
const bodyParser = require("body-parser");

// Create Express app
const app = express();
const port = 2222; // Change the port number to avoid conflicts

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection parameters
const mongoUrl = "mongodb://localhost:27017/";
const dbName = "mydatabase";
let db; // Variable to store the database connection

// Connect to MongoDB server
MongoClient.connect(mongoUrl)
    .then((client) => {
        db = client.db(dbName); // Store the database reference in the db variable
        console.log(`Connected to MongoDB: ${dbName}`);
    })
    .catch((err) => {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1); // Exit the process if unable to connect to MongoDB
    });

// Route to serve the HTML form
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// Route to handle form submission and insert data into MongoDB
app.post("/login", async (req, res) => {
    const { name, rollno, emailId, phno } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); // Check if db is initialized
        return;
    }
    try {
        await db.collection("items").insertOne({ name, rollno, emailId, phno });
        console.log("Number of documents inserted: 1");
        res.redirect("/"); // Redirect back to the form after successful insertion
    } catch (err) {
        console.error("Error inserting data:", err);
        res.status(500).send("Failed to insert data");
    }
});


// Route to handle updating data in MongoDB
app.post("/update", async (req, res) => {
    const { name, rollno, emailId, phno } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); // Check if db is initialized
        return;
    }
    try {
        await db.collection("items").updateOne(
            { rollno: rollno }, // Filter to find the document to update
            { $set: { name: name, emailId: emailId, phno: phno } } // Updated data
        );
        console.log("Document updated");
        res.redirect("/report"); // Redirect back to the report after successful update
    } catch (err) {
        console.error("Error updating data:", err);
        res.status(500).send("Failed to update data");
    }
});

// Route to handle deleting data from MongoDB
app.post("/delete", async (req, res) => {
    const { rollno } = req.body;
    if (!db) {
        res.status(500).send("Database not initialized"); // Check if db is initialized
        return;
    }
    try {
        await db.collection("items").deleteOne({ rollno: rollno }); // Delete document with matching rollno
        console.log("Document deleted");
        res.redirect("/report"); // Redirect back to the report after successful deletion
    } catch (err) {
        console.error("Error deleting data:", err);
        res.status(500).send("Failed to delete data");
    }
});


// Endpoint to retrieve and display a simple report from MongoDB
app.get("/report", async (req, res) => {
    try {
        const items = await db.collection("items").find().toArray(); // Fetch items from the 'items' collection

        // Create HTML content for the report
        let htmlContent = `
        <style>
        body {
            background-image: url('https://i.pinimg.com/564x/d2/3a/ef/d23aef5f1efba89b40a3a7269676bc9f.jpg');
            background-size: cover;
            padding: 20px;
        }
        .container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .report {
            flex: 1;
            color: white;
            padding: 20px;
            margin-right: 20px;
            margin-top: 100px;
        }
        .report table {
            border-collapse: collapse;
        }
        .report th,
        .report td {
            color: white;
            padding: 8px;
            text-align: left;
        }
        .report .back-btn {
            display: block;
            width: 120px;
            margin-top: 20px;
            padding: 10px;
            text-align: center;
            background-color: #f270dafa;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            text-decoration: none;
        }
        .report .back-btn:hover {
            background-color: #f93dc7;
        }
        .img-container {
            flex: 1;
        }
        .img-container img {
            border-radius: 50px;
        }
    </style>
            <div class="container">
                <div class="report">
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
                            <td>${item.emailId}</td>
                            <td>${item.phno}</td>
                        </tr>`).join("");
        
        htmlContent += `</table>
                    <a href='/' class="back-btn">Back to Form</a>
                </div>
                <div class="img-container">
                    <img src="https://i.pinimg.com/564x/00/05/c1/0005c17915d26d2a3a624510594e87a1.jpg" alt="Image" height="650px" width="500px">
                </div>
            </div>`; // Add link to go back to the form

        res.send(htmlContent); // Send the report HTML content as response
    } catch (err) {
        console.error("Error fetching data:", err);
        res.status(500).send("Failed to fetch data");
    }
});
// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});