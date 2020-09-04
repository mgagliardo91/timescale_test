WITH numerics as (
	SELECT
		time_bucket('2 minutes', time) AS fifteen_min,
		MAX((data->>'value')::float) AS max_temp,
	  AVG((data->>'value')::float) AS avg_temp,
		MIN((data->>'value')::float) AS min_temp
		FROM iot_data
		WHERE source_id = 113 AND label = 'SEN01'
		GROUP BY fifteen_min
), texts as (
	SELECT
		time_bucket('2 minutes', time) AS fifteen_min,
		FIRST((data->>'text'::text), time) as value
		FROM iot_data
		WHERE source_id = 113 AND label = 'SEN02'
		GROUP BY fifteen_min
)
SELECT *
from numerics n join texts t on n.fifteen_min = t.fifteen_min
ORDER BY n.fifteen_min DESC, max_temp DESC;

758