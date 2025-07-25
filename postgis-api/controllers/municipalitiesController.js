import pool from "../db/pool.js";

export const getMunicipalities = async (req, res) => {
  const { county } = req.query;

  try {
    let query;
    let params = [];

    if (county) {
      query = `
        SELECT m.*
        FROM municipality m
        JOIN municipality_county mc ON m.id = mc.municipality_id
        JOIN county c ON mc.county_id = c.id
        WHERE LOWER(c.name) = LOWER($1)
        ORDER BY m.id
      `;
      params = [county];
    } else {
      query = `
        SELECT m.*
        FROM municipality m
        ORDER BY m.name
      `;
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching municipalities:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMunicipalityById = async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid municipality ID" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM municipality WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Municipality not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching municipality by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getVpaDecileBreakpoints = async (req, res) => {
  const municipalityId = parseInt(req.params.id);

  if (isNaN(municipalityId)) {
    return res.status(400).json({ error: "Invalid municipality ID" });
  }

  try {
    const result = await pool.query(
      `SELECT decile, max_vpa 
       FROM vpa_decile_breakpoints 
       WHERE municipality_id = $1 
       ORDER BY decile`,
      [municipalityId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching decile breakpoints:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getVpaSubdecileBreakpoints = async (req, res) => {
  const municipalityId = parseInt(req.params.id);
  const decile = parseInt(req.params.decile);

  if (isNaN(municipalityId) || isNaN(decile)) {
    return res.status(400).json({ error: "Invalid municipality ID or decile" });
  }

  try {
    const result = await pool.query(
      `SELECT subdecile, max_vpa 
       FROM vpa_subdecile_breakpoints 
       WHERE municipality_id = $1 AND decile = $2 
       ORDER BY subdecile`,
      [municipalityId, decile]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching subdecile breakpoints:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};