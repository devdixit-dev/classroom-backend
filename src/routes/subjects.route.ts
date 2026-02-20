import express from 'express';

const router = express.Router();

// get all subjects with optional search, filtering and pagination
router.get("/", async (req, res) => {
  try{
    const {search, department, page = 1, limit = 10} = req.query;
    // at least 1 or page
    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);

    const offset = (currentPage - 1) * limitPerPage;
    // how many records skips

    const filterConditions = [];
  }
  catch(e) {
    console.error(`GET /subjects error: ${e}`);
    return res.status(500).json({ error: 'Failed to get subjects' });
  }
});