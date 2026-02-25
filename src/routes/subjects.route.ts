import { and, ilike, or, sql, eq } from 'drizzle-orm';
import express from 'express';
import { departments, subjects } from '../db/schema';
import { db } from '../db/db';

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

    // if search query exists, filter by subject name or subject code
    if(search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`)
        )
      );
    }

    // if department filter exists, match department name
    if(department) {
      filterConditions.push(ilike(departments.name, `%${department}`));
    }

    // combine all filters using AND if any exist
    const whereClause = filterConditions.length > 0
    // filter array length is > 0
    ? and(...filterConditions)
    // then combine all conditions with and
    : undefined
    // or undefined

    const countResult = await db.select({count: sql<number>`count(*)`})
    .from(subjects).leftJoin(
      departments, eq(subjects.departmentId, departments.id)
    );
  }
  catch(e) {
    console.error(`GET /subjects error: ${e}`);
    return res.status(500).json({ error: 'Failed to get subjects' });
  }
});