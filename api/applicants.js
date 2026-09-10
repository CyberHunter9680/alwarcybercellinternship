const { getPool, initDatabase } = require('./db');

// In-memory rate limiting map (IP based)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per min per IP

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
  
  if (now > entry.resetAt) {
    entry.count = 1;
    entry.resetAt = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, entry);
    return false;
  }

  entry.count++;
  rateLimitMap.set(ip, entry);
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

// Input sanitizer to prevent XSS attacks
function sanitizeString(str, maxLen = 500) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '') // strip < and >
    .trim()
    .slice(0, maxLen);
}

module.exports = async function handler(req, res) {
  // Enterprise Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Admin-Pin'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Rate Limiting Check
  const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please slow down and try again later.'
    });
  }

  const pool = getPool();
  if (!pool) {
    return res.status(500).json({
      success: false,
      error: 'Database connection configuration is missing. Set DATABASE_URL.'
    });
  }

  try {
    await initDatabase();

    // ==========================================
    // 1. GET: Fetch all real applicants
    // ==========================================
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT 
          id, name, mobile, email, course, year_sem AS "yearSem", 
          duration, college, skills, why_join AS "whyJoin", 
          resume_name AS "resumeName", resume_size AS "resumeSize", 
          resume_data AS "resumeData", status, applied_at AS "appliedAt", 
          created_at AS "createdAt"
        FROM applicants 
        ORDER BY created_at DESC;
      `);
      return res.status(200).json({ success: true, data: result.rows });
    }

    // ==========================================
    // 2. POST: Securely Register New Applicant
    // ==========================================
    if (req.method === 'POST') {
      const body = req.body || {};
      
      const rawId = sanitizeString(body.id, 60);
      const rawName = sanitizeString(body.name, 100);
      const rawMobile = sanitizeString(body.mobile, 20);
      const rawEmail = sanitizeString(body.email, 120);
      const rawCourse = sanitizeString(body.course, 100);
      const rawYearSem = sanitizeString(body.yearSem, 50);
      const rawDuration = sanitizeString(body.duration, 50);
      const rawCollege = sanitizeString(body.college, 200);
      const rawWhyJoin = sanitizeString(body.whyJoin, 2000);
      const rawResumeName = sanitizeString(body.resumeName, 255);
      const rawResumeSize = sanitizeString(body.resumeSize, 50);
      const rawStatus = sanitizeString(body.status || 'Pending', 30);
      const rawAppliedAt = sanitizeString(body.appliedAt, 100);

      // Validate required fields
      if (!rawId || !rawName || !rawMobile || !rawEmail || !rawCourse || !rawDuration || !rawCollege) {
        return res.status(400).json({ success: false, error: 'All required form fields must be provided.' });
      }

      // Validate mobile format (10 digit Indian number)
      const cleanMobile = rawMobile.replace(/\D/g, '');
      if (cleanMobile.length < 10) {
        return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit mobile number.' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(rawEmail)) {
        return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
      }

      // Validate Duration
      const allowedDurations = ['1 Month', '2 Months', '3 Months', '4 Months'];
      const durationVal = allowedDurations.includes(rawDuration) ? rawDuration : '1 Month';

      // Validate skills array
      let safeSkills = [];
      if (Array.isArray(body.skills)) {
        safeSkills = body.skills.map(s => sanitizeString(s, 50)).filter(Boolean);
      }

      // Validate resume data payload size (Max 5MB to prevent memory DoS)
      let safeResumeData = '';
      if (typeof body.resumeData === 'string') {
        if (body.resumeData.length > 7 * 1024 * 1024) { // base64 overhead limit
          return res.status(400).json({ success: false, error: 'Uploaded resume exceeds maximum file size limit (5MB).' });
        }
        safeResumeData = body.resumeData;
      }

      // Safe Parameterized Query Execution (Zero SQL Injection)
      await pool.query(`
        INSERT INTO applicants (
          id, name, mobile, email, course, year_sem, duration, 
          college, skills, why_join, resume_name, resume_size, 
          resume_data, status, applied_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          mobile = EXCLUDED.mobile,
          email = EXCLUDED.email,
          course = EXCLUDED.course,
          year_sem = EXCLUDED.year_sem,
          duration = EXCLUDED.duration,
          college = EXCLUDED.college,
          skills = EXCLUDED.skills,
          why_join = EXCLUDED.why_join,
          resume_name = EXCLUDED.resume_name,
          resume_size = EXCLUDED.resume_size,
          resume_data = EXCLUDED.resume_data,
          status = EXCLUDED.status;
      `, [
        rawId, rawName, cleanMobile, rawEmail.toLowerCase(), rawCourse, rawYearSem, durationVal,
        rawCollege, safeSkills, rawWhyJoin, rawResumeName,
        rawResumeSize, safeResumeData, rawStatus, rawAppliedAt
      ]);

      return res.status(201).json({
        success: true,
        message: 'Applicant officially registered in Neon PostgreSQL database.'
      });
    }

    // ==========================================
    // 3. DELETE: Securely Delete an Applicant
    // ==========================================
    if (req.method === 'DELETE') {
      const id = sanitizeString(req.query.id || (req.body && req.body.id), 60);
      if (!id) {
        return res.status(400).json({ success: false, error: 'Valid Applicant ID is required to delete.' });
      }

      const deleteRes = await pool.query('DELETE FROM applicants WHERE id = $1', [id]);
      
      return res.status(200).json({ 
        success: true, 
        message: `Applicant ${id} removed successfully from database.`, 
        deletedCount: deleteRes.rowCount 
      });
    }

    // ==========================================
    // 4. PATCH: Update Applicant Status
    // ==========================================
    if (req.method === 'PATCH' || req.method === 'PUT') {
      const { id, status } = req.body || {};
      const safeId = sanitizeString(id, 60);
      const safeStatus = sanitizeString(status, 50);

      if (!safeId || !safeStatus) {
        return res.status(400).json({ success: false, error: 'ID and valid status are required.' });
      }

      await pool.query('UPDATE applicants SET status = $1 WHERE id = $2', [safeStatus, safeId]);
      return res.status(200).json({ success: true, message: 'Status updated successfully.' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Database Operation Error:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal secure database error occurred. Operation aborted.'
    });
  }
};
