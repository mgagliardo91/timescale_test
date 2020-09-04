WITH numerics as (
	SELECT
		time_bucket('2 minutes', time) AS fifteen_min,
		MAX(value_numeric) AS max_temp,
    AVG(value_numeric) AS avg_temp,
		MIN(value_numeric) AS min_temp
		FROM iot_column_data
		WHERE source_id = 113 AND label = 'SEN01'
		GROUP BY fifteen_min
), texts as (
	SELECT
		time_bucket('2 minutes', time) AS fifteen_min,
		FIRST(value_text, time) as value
		FROM iot_column_data
		WHERE source_id = 113 and label = 'SEN02'
		GROUP BY fifteen_min
)
SELECT *
from numerics n join texts t on n.fifteen_min = t.fifteen_min
ORDER BY n.fifteen_min DESC, max_temp DESC;
