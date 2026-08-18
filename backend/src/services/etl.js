import { query } from '../config/database.js'

export const calculateMandatory2026 = async () => {
  await query(`
    INSERT INTO processed_mandatory_2026 (
      employee_id,
      employee_name,
      directorate,
      sub_directorate,
      log_plus_status,
      log_plus_completion,
      log_plus_last_updated,
      vr_learning_status,
      vr_learning_completion,
      vr_learning_last_updated,
      overall_status,
      overall_completion,
      last_processed
    )
    SELECT
      COALESCE(lp.employee_id, vr.employee_id) AS employee_id,
      COALESCE(lp.employee_name, vr.employee_name) AS employee_name,
      COALESCE(lp.directorate, vr.directorate) AS directorate,
      COALESCE(lp.sub_directorate, vr.sub_directorate) AS sub_directorate,
      lp.completion_status AS log_plus_status,
      lp.completion_percentage AS log_plus_completion,
      lp.completion_date AS log_plus_last_updated,
      vr.completion_status AS vr_learning_status,
      CASE
        WHEN vr.forward_30_score IS NULL THEN NULL
        ELSE LEAST(GREATEST(vr.forward_30_score, 0), 100)::DECIMAL(5,2)
      END AS vr_learning_completion,
      vr.created_at AS vr_learning_last_updated,
      CASE
        WHEN COALESCE(lp.completion_status, '') = 'Completed'
         AND COALESCE(vr.completion_status, '') = 'Completed'
        THEN 'Completed'
        ELSE 'Incompleted'
      END AS overall_status,
      ROUND((
        COALESCE(lp.completion_percentage, 0) +
        COALESCE(LEAST(GREATEST(vr.forward_30_score, 0), 100), 0)
      ) / 2.0, 2) AS overall_completion,
      CURRENT_TIMESTAMP AS last_processed
    FROM (
      SELECT DISTINCT ON (employee_id)
        employee_id,
        employee_name,
        directorate,
        sub_directorate,
        completion_status,
        completion_percentage,
        completion_date
      FROM raw_log_plus
      ORDER BY employee_id, completion_date DESC NULLS LAST, created_at DESC
    ) lp
    FULL OUTER JOIN (
      SELECT DISTINCT ON (employee_id)
        employee_id,
        employee_name,
        directorate,
        sub_directorate,
        completion_status,
        forward_30_score,
        created_at
      FROM raw_vr_learning
      ORDER BY employee_id, created_at DESC
    ) vr ON lp.employee_id = vr.employee_id
    WHERE COALESCE(lp.employee_id, vr.employee_id) IS NOT NULL
    ON CONFLICT (employee_id) DO UPDATE SET
      employee_name = EXCLUDED.employee_name,
      directorate = EXCLUDED.directorate,
      sub_directorate = EXCLUDED.sub_directorate,
      log_plus_status = EXCLUDED.log_plus_status,
      log_plus_completion = EXCLUDED.log_plus_completion,
      log_plus_last_updated = EXCLUDED.log_plus_last_updated,
      vr_learning_status = EXCLUDED.vr_learning_status,
      vr_learning_completion = EXCLUDED.vr_learning_completion,
      vr_learning_last_updated = EXCLUDED.vr_learning_last_updated,
      overall_status = EXCLUDED.overall_status,
      overall_completion = EXCLUDED.overall_completion,
      last_processed = CURRENT_TIMESTAMP
  `)
}

export const calculateSummaryAll = async () => {
  await query(`
    INSERT INTO processed_summary_all (
      directorate,
      total_employees,
      log_plus_completed,
      log_plus_incompleted,
      log_plus_completion_rate,
      vr_learning_completed,
      vr_learning_incompleted,
      vr_learning_completion_rate,
      combined_completed,
      combined_incompleted,
      combined_completion_rate,
      last_processed
    )
    SELECT
      COALESCE(directorate, 'Unknown') AS directorate,
      COUNT(*)::INT AS total_employees,
      COUNT(*) FILTER (WHERE log_plus_status = 'Completed')::INT AS log_plus_completed,
      COUNT(*) FILTER (WHERE log_plus_status IS DISTINCT FROM 'Completed')::INT AS log_plus_incompleted,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE log_plus_status = 'Completed') / NULLIF(COUNT(*), 0),
        2
      ) AS log_plus_completion_rate,
      COUNT(*) FILTER (WHERE vr_learning_status = 'Completed')::INT AS vr_learning_completed,
      COUNT(*) FILTER (WHERE vr_learning_status IS DISTINCT FROM 'Completed')::INT AS vr_learning_incompleted,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE vr_learning_status = 'Completed') / NULLIF(COUNT(*), 0),
        2
      ) AS vr_learning_completion_rate,
      COUNT(*) FILTER (WHERE overall_status = 'Completed')::INT AS combined_completed,
      COUNT(*) FILTER (WHERE overall_status IS DISTINCT FROM 'Completed')::INT AS combined_incompleted,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE overall_status = 'Completed') / NULLIF(COUNT(*), 0),
        2
      ) AS combined_completion_rate,
      CURRENT_TIMESTAMP AS last_processed
    FROM processed_mandatory_2026
    GROUP BY COALESCE(directorate, 'Unknown')
    ON CONFLICT (directorate) DO UPDATE SET
      total_employees = EXCLUDED.total_employees,
      log_plus_completed = EXCLUDED.log_plus_completed,
      log_plus_incompleted = EXCLUDED.log_plus_incompleted,
      log_plus_completion_rate = EXCLUDED.log_plus_completion_rate,
      vr_learning_completed = EXCLUDED.vr_learning_completed,
      vr_learning_incompleted = EXCLUDED.vr_learning_incompleted,
      vr_learning_completion_rate = EXCLUDED.vr_learning_completion_rate,
      combined_completed = EXCLUDED.combined_completed,
      combined_incompleted = EXCLUDED.combined_incompleted,
      combined_completion_rate = EXCLUDED.combined_completion_rate,
      last_processed = CURRENT_TIMESTAMP
  `)
}
