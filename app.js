const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const AWS = require('aws-sdk');

const app = express();
const PORT = 3500;

AWS.config.update({ region: 'us-east-1' });

// Create a new AWS Systems Manager client
const ssm = new AWS.SSM();

// Middleware
app.use(bodyParser.json());

//Cors
app.use(cors());

// Get connection string from parametar store
const parametarName = '/myapp/mongodb_uri'

async function connectToMongoDB() {
    try {
        const mongoURI = await getConnectionString(parametarName);
        await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

// Invoke the function to establish MongoDB connection
connectToMongoDB();

// MongoDB Model
const Book = mongoose.model('Book', {
  title: { type: String },
  author: { type: String },
  publicationYear: { type: String },
});


app.post('/books', async (req, res) => {
  try {
    const { title, author, publicationYear } = req.body;
    const newItem = new Book({ title, author, publicationYear });
    await newItem.save();
    res.json('Success!');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/books', async (req, res) => {
  try {
    const items = await Book.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.put('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedItem = await Book.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Book.findByIdAndDelete(id);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function getConnectionString(parameterName){
    try {
        const response = await ssm.getParameter({Name: parameterName, WithDecryption: true }).promise();
        return response.Parameter.Value;
    } catch (error) {
        console.error("Error ", error)
    }
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
