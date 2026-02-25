import { and, ilike, or, sql, eq, getTableColumns, desc } from 'drizzle-orm';
import express from 'express';
import { departments, subjects } from '../db/schema';
import { db } from '../db/db';

const router = express.Router();

// get all subjects with optional search, filtering and pagination
router.get("/", async (req, res) => {
  try{
    const {search, department, page = 1, limit = 10} = req.query;
  
    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);
    // min page is always 1 for current page & limit per page

    const offset = (currentPage - 1) * limitPerPage;
    // Page 1 -> skip 0 | (1 - 1) * 10 = 0 records skip
    // Page 2 -> skip 10 | (2 - 1) * 10 = 10 records skip
    // Page 3 -> skip 20 | (3 - 1) * 10 = 20 records skip

    const filterConditions = [];
    // this will collect the dynamic filters

    if(search) {
      // if user provides search, we add a condition
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          // push if subjects.name is equal to search query
          ilike(subjects.code, `%${search}%`)
          // push if subjects.code is equal to search query
        )
        // push the search data in filter array
      );
    }

    // if department filter exists, match department name
    if(department) {
      filterConditions.push(ilike(departments.name, `%${department}%`));
      // push if department.name is equal to department query
    }

    // combine all filters using AND if any exist
    const whereClause = filterConditions.length > 0
    // filter array length is > 0
    ? and(...filterConditions)
    // then combine all conditions with AND clause
    : undefined
    // if array < 0 then undefined

    const countResult = await db.select({count: sql<number>`count(*)`})
    // raw SQL inside drizzle, return count as nummber
    .from(subjects)
    // from subjects database
    .leftJoin(departments, eq(subjects.departmentId, departments.id))
    // join subject with department table where subjects.departmentId is equal to departments.id
    .where(whereClause);
    // where apply filter if they exist

    const totalCount = countResult[0]?.count ?? 0;
    // first row, crash undefined, fallback to 0
    // even if DB returns nothing, app won't crash

    const subjectsList = await db.select({
      ...getTableColumns(subjects),
      // select all column from subjects
      department: { ...getTableColumns(departments) }
      // nested department object within the subjects data
    })
    .from(subjects)
    // from subjects table
    .leftJoin(departments, eq(subjects.departmentId, departments.id))
    // join subject with their department that equals the subject.departmentId to departments.id
    .where(whereClause)
    // where apply filter if they exist
    .orderBy(desc(subjects.created_at))
    // order in desc order -> subjects by created at
    .limit(limitPerPage)
    // limitation per page is min = 1 or limit by req.query
    .offset(offset);
    // record skips currentPage - 1 * limitation per page

    res.json(200).json({
      data: subjectsList,
      total: totalCount,
      page: page
    });
  }
  catch(e) {
    console.error(`GET /subjects error: ${e}`);
    return res.status(500).json({ error: 'Failed to get subjects' });
  }
});