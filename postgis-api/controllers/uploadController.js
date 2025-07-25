import fs from 'fs';
import path from 'path';
import { cleanProperties } from "../utils/fileHelpers.js";
import pool from '../db/pool.js';

export const uploadSLRParcels = async (req, res) => {
  try {
    const { file } = req;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const rawData = JSON.parse(file.buffer.toString());
    const features = rawData.features;

    if (!features || !Array.isArray(features)) {
      return res.status(400).json({ error: "Invalid GeoJSON structure" });
    }

    const client = await pool.connect();

    await client.query(
      `INSERT INTO uploaded_files (filename, upload_type) VALUES ($1, 'slr')`,
      [file.originalname]
    );

    const insertQuery = `
      INSERT INTO slr_parcels (
        OBJECTID, MergeID, County, PIN, LU, YearBuilt, land_val, bldg_val, mrkt_val, 
        U3VAL, tax_val, CALC_AREA, VPA, acres, acres_new, acres_rat, bldgval_new, 
        landval_new, U3val_new, vpa_new, lulc_acres, LandUseU3, city, geom
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 
        $17, $18, $19, $20, $21, $22, $23,
        ST_SetSRID(ST_GeomFromGeoJSON($24), 4326)
      )
    `;

    for (const feature of features) {
      const p = feature.properties;
      const geom = JSON.stringify(feature.geometry);

      await client.query(insertQuery, [
        p.OBJECTID || null,
        p.MergeID || null,
        p.County || null,
        p.PIN || null,
        p.LU || null,
        p.YearBuilt || null,
        p.land_val || null,
        p.bldg_val || null,
        p.mrkt_val || null,
        p.U3VAL || null,
        p.tax_val || null,
        p.CALC_AREA || null,
        p.VPA || null,
        p.acres || null,
        p.acres_new || null,
        p.acres_rat || null,
        p.bldgval_new || null,
        p.landval_new || null,
        p.U3val_new || null,
        p.vpa_new || null,
        p.lulc_acres || null,
        p.LandUseU3 || null,
        p.city || null,
        geom,
      ]);
    }

    client.release();
    res.json({ message: "SLR Parcels uploaded successfully" });
  } catch (err) {
    console.error("Upload SLR Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadFoodAccessPoints = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "File is required" });

  try {
    const originalName = req.file.originalname;
    const fileBuffer = req.file.buffer;
    const geojson = JSON.parse(fileBuffer.toString());

    if (!geojson.features || !Array.isArray(geojson.features)) {
      return res.status(400).json({ error: "Invalid GeoJSON: missing or invalid features array" });
    }

    await pool.query(
      `INSERT INTO uploaded_files (filename, upload_type) VALUES ($1, 'foodaccesspoints')`,
      [originalName]
    );

    for (const feature of geojson.features) {
      if (!feature.geometry || !feature.properties) continue;

      const props = cleanProperties(feature.properties);
      const geom = JSON.stringify(feature.geometry);

      await pool.query(
        `INSERT INTO food_access_points (
          objectid, user_name, user_common_names, user_category,
          user_address, user_city, user_state, user_zip, user_phone,
          user_website, last_edited_date, user_latitude, user_longitude, geometry
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7, $8, $9,
          $10, $11, $12, $13, ST_SetSRID(ST_GeomFromGeoJSON($14), 4326)
        )`,
        [
          props.OBJECTID,
          props.USER_Name,
          props.USER_Common_Names,
          props.USER_Type,
          props.USER_Street,
          props.USER_City,
          props.USER_State,
          props.USER_Zip_Code,
          props.USER_Phone_Number,
          props.USER_Website_Link,
          props.EditDate,
          feature.geometry.coordinates[1] ?? null,
          feature.geometry.coordinates[0] ?? null,
          geom,
        ]
      );
    }

    res.status(200).json({ message: "Food Access Points uploaded and inserted successfully" });
  } catch (err) {
    console.error("Upload foodaccesspoints error:", err);
    res.status(500).json({ error: "Upload foodaccesspoints failed" });
  }
};

export const uploadLandVPA = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "File is required" });

  try {
    const municipalityRaw = req.body.municipality;
    if (!municipalityRaw)
      return res.status(400).json({ error: "Municipality is required" });

    const municipalityName = municipalityRaw.trim().toUpperCase().replace(/ /g, "_");
    const targetFileName = `${municipalityName}_VPA.geojson`;
    const fileBuffer = req.file.buffer;
    const geojson = JSON.parse(fileBuffer.toString());

    if (!geojson.features || !Array.isArray(geojson.features)) {
      return res.status(400).json({ error: "Invalid GeoJSON: missing or invalid features array" });
    }

    await pool.query(
      `INSERT INTO uploaded_files (filename, upload_type) VALUES ($1, 'landvpa')`,
      [targetFileName]
    );

    const muniResult = await pool.query(
      "SELECT id FROM municipality WHERE LOWER(name) = LOWER($1)",
      [municipalityRaw]
    );

    let municipalityId;
    if (muniResult.rows.length > 0) {
      municipalityId = muniResult.rows[0].id;
    } else {
      const insertResult = await pool.query(
        "INSERT INTO municipality (name) VALUES ($1) RETURNING id",
        [municipalityRaw]
      );
      municipalityId = insertResult.rows[0].id;
    }

    for (const feature of geojson.features) {
      if (!feature.geometry || !feature.properties) continue;

      const geom = JSON.stringify(feature.geometry);
      const props = feature.properties;

      await pool.query(
        `INSERT INTO parcel (
          municipality_id, objectid, mergeid, address, yearbuilt, calc_area, u3value, vpa,
          landvpa, txbl_val, jurscode, acctid, city, zipcode, ownname1, ownname2,
          landuseu3, lu, desclu, descstyl, descbldg, nfmlndvl, nfmimpvl, nfmttlvl,
          bldg_story, resident, merge_, new_merge, notes, downtown, fid1, cityname,
          insidecore, outsidecore, yearbuiltcat, impvalperacre, dt_easton, developed, geom,
          vpa_decile, vpa_subdecile
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24,
          $25, $26, $27, $28, $29, $30, $31, $32,
          $33, $34, $35, $36, $37, $38,
          ST_SetSRID(ST_GeomFromGeoJSON($39), 4326),
          NULL, NULL
        )`,
        [
          municipalityId,
          props.OBJECTID, props.MergeID, props.ADDRESS, props.YearBuilt, props.CALC_AREA, props.U3Value, props.VPA,
          props.LandVPA, props.Txbl_Val, props.JURSCODE, props.ACCTID, props.CITY, props.ZIPCODE, props.OWNNAME1, props.OWNNAME2,
          props.LandUseU3, props.LU, props.DESCLU, props.DESCSTYL, props.DESCBLDG, props.NFMLNDVL, props.NFMIMPVL, props.NFMTTLVL,
          props.BLDG_STORY, props.RESIDENT, props.Merge_, props.New_Merge, props.Notes, props.Downtown, props.FID1, props.CityName,
          props.InsideCore, props.OutsideCore, props.YearBuiltCat, props.ImpValPerAcre, props.DT_Easton, props.developed, geom,
        ]
      );
    }

    const topVpaQuery = `
      SELECT DISTINCT vpa FROM parcel
      WHERE municipality_id = $1 AND vpa > 0
      ORDER BY vpa ASC
    `;
    const vpaRows = (await pool.query(topVpaQuery, [municipalityId])).rows.map(r => Number(r.vpa));

    const total = vpaRows.length;
    if (total === 0) {
      return res.status(200).json({ message: `No VPA data > 0 for ${municipalityRaw}` });
    }

    let lowestDecileBreak = 1; // or 0.75 or any value you choose
    let totalDeciles = 10;
    let highestDecileBreak = (2 * 100 / totalDeciles) - lowestDecileBreak;
    let decrement = (highestDecileBreak - lowestDecileBreak) / (totalDeciles - 1);

    let currentPercent = highestDecileBreak;
    let cumulative = 0;
    const decileBreakpoints = [];

    for (let i = 1; i <= totalDeciles; i++) {
      cumulative += currentPercent;
      const index = Math.floor((cumulative / 100) * total) - 1;
      const rawValue = i === totalDeciles
        ? vpaRows[vpaRows.length - 1]
        : vpaRows[Math.max(0, Math.min(index, total - 1))];
      const rounded = Math.ceil(rawValue / 100) * 100;

      decileBreakpoints.push(rounded);

      await pool.query(
        `INSERT INTO vpa_decile_breakpoints (municipality_id, decile, max_vpa)
        VALUES ($1, $2, $3)
        ON CONFLICT (municipality_id, decile)
        DO UPDATE SET max_vpa = EXCLUDED.max_vpa`,
        [municipalityId, i, rounded]
      );

      if (i < totalDeciles) currentPercent -= decrement;
    }

    await pool.query(
      `UPDATE parcel SET vpa_decile = CASE
        ${decileBreakpoints.map((v, i) => {
          const lower = i === 0 ? 0 : decileBreakpoints[i - 1];
          return `WHEN vpa > ${lower} AND vpa <= ${v} THEN ${i + 1}`;
        }).join("\n")}
        ELSE 0
      END
      WHERE municipality_id = $1 AND vpa > 0`,
      [municipalityId]
    );

    await pool.query(
      `UPDATE parcel SET vpa_decile = 0 WHERE municipality_id = $1 AND vpa = 0`,
      [municipalityId]
    );

    for (let decile = 1; decile <= 10; decile++) {
      const lower = decile === 1 ? 0 : decileBreakpoints[decile - 2];
      const upper = decileBreakpoints[decile - 1];

      const subRows = (
        await pool.query(
          `SELECT vpa FROM parcel
          WHERE municipality_id = $1 AND vpa > $2 AND vpa <= $3
          ORDER BY vpa ASC`,
          [municipalityId, lower, upper]
        )
      ).rows.map(r => Number(r.vpa));

      const subTotal = subRows.length;
      if (subTotal === 0) continue;

      if (subTotal <= 10) {
        for (let i = 0; i < subTotal; i++) {
          const rounded = Math.ceil(subRows[i] / 100) * 100;
          await pool.query(
            `INSERT INTO vpa_subdecile_breakpoints (municipality_id, decile, subdecile, max_vpa)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (municipality_id, decile, subdecile)
            DO UPDATE SET max_vpa = EXCLUDED.max_vpa`,
            [municipalityId, decile, i + 1, rounded]
          );
        }

        await pool.query(
          `UPDATE parcel SET vpa_subdecile = CASE
            ${subRows.map((vpa, i) => `WHEN vpa = ${vpa} AND vpa_decile = ${decile} THEN ${i + 1}`).join('\n')}
            ELSE NULL
          END
          WHERE municipality_id = $1 AND vpa_decile = $2`,
          [municipalityId, decile]
        );

        continue;
      }

      const subdecileBreakpoints = [];

      if (decile < 10) {
        // Deciles 1-9: uniform 10% split
        let subCumulative = 0;
        const subCurrentPercent = 10;

        for (let subdecile = 1; subdecile <= 10; subdecile++) {
          subCumulative += subCurrentPercent;
          let index = Math.floor((subCumulative / 100) * subTotal) - 1;
          index = Math.max(0, Math.min(index, subTotal - 1));

          const rawValue = subdecile === 10
            ? subRows[subTotal - 1]
            : subRows[index];

          const rounded = Math.ceil(rawValue / 100) * 100;
          subdecileBreakpoints.push(rounded);

          await pool.query(
            `INSERT INTO vpa_subdecile_breakpoints (municipality_id, decile, subdecile, max_vpa)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (municipality_id, decile, subdecile)
            DO UPDATE SET max_vpa = EXCLUDED.max_vpa`,
            [municipalityId, decile, subdecile, rounded]
          );
        }
      } else {
        // Decil 10: progressive decrement from 17.5% to 2.5%
        const lowestSubdecileBreak = 2.5;
        const totalSubdeciles = 10;
        const highestSubdecileBreak = (2 * 100 / totalSubdeciles) - lowestSubdecileBreak;
        const decrement = (highestSubdecileBreak - lowestSubdecileBreak) / (totalSubdeciles - 1);

        let subCurrentPercent = highestSubdecileBreak;
        let subCumulative = 0;

        for (let subdecile = 1; subdecile <= 10; subdecile++) {
          subCumulative += subCurrentPercent;
          let index = Math.floor((subCumulative / 100) * subTotal) - 1;
          index = Math.max(0, Math.min(index, subTotal - 1));

          const rawValue = subdecile === 10
            ? subRows[subTotal - 1]
            : subRows[index];

          const rounded = Math.ceil(rawValue / 100) * 100;
          subdecileBreakpoints.push(rounded);

          await pool.query(
            `INSERT INTO vpa_subdecile_breakpoints (municipality_id, decile, subdecile, max_vpa)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (municipality_id, decile, subdecile)
            DO UPDATE SET max_vpa = EXCLUDED.max_vpa`,
            [municipalityId, decile, subdecile, rounded]
          );

          if (subdecile < 10) subCurrentPercent -= decrement;
        }
      }

      await pool.query(
        `UPDATE parcel SET vpa_subdecile = CASE
          ${subdecileBreakpoints.map((maxVpa, i) => {
            const lower = i === 0 ? 0 : subdecileBreakpoints[i - 1];
            return `WHEN vpa > ${lower} AND vpa <= ${maxVpa} AND vpa_decile = ${decile} THEN ${i + 1}`;
          }).join("\n")}
          ELSE NULL
        END
        WHERE municipality_id = $1 AND vpa_decile = $2`,
        [municipalityId, decile]
      );
    }

    res.status(200).json({ message: `LandVPA for ${municipalityRaw} uploaded and processed successfully` });

  } catch (err) {
    console.error("Upload landvpa error:", err);
    res.status(500).json({ error: "Upload landvpa failed" });
  }
};