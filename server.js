const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const cors = require('cors');

// Import routes and middleware
const authRoutes = require('./src/routes/authRoutes');
const eventRoutes = require('./src/routes/eventRoutes'); 
const swapRoutes = require('./src/routes/swapRoutes');
const { notFound, errorHandler } = require('./src/middleware/errorMiddleware'); 

// --- 1. Load Environment Variables ---
dotenv.config();

// --- 2. Connect to database ---
connectDB();

// --- 3. Initialize Express App ---
const app = express();

// Enable CORS for frontend connectivity
app.use(cors()); 

// Body parser middleware
app.use(express.json());

// --- 4. Routes ---

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes); 
app.use('/api/swaps', swapRoutes); 
// Welcome route 
app.get('/', (req, res) => {
  res.send('SlotSwapper API is running...');
});

// --- 5. Error Handling Middleware  ---
app.use(notFound);
app.use(errorHandler);


// --- 6. Port and Start Server ---
const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));