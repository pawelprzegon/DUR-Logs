docker-compose up -d

update nextval in db after importing data
use adminer "Zapytanie SQL"
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"impala_Filters_Repl"', 'id')), (SELECT (MAX("id") + 1) FROM "impala_Filters_Repl"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"impala_Bearings_Repl"', 'id')), (SELECT (MAX("id") + 1) FROM "impala_Bearings_Repl"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"impala_Settings"', 'id')), (SELECT (MAX("id") + 1) FROM "impala_Settings"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"impala_Details"', 'id')), (SELECT (MAX("id") + 1) FROM "impala_Details"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"impala"', 'id')), (SELECT (MAX("id") + 1) FROM "impala"), FALSE);

SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"mutoh"', 'id')), (SELECT (MAX("id") + 1) FROM "mutoh"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"mutoh_Details"', 'id')), (SELECT (MAX("id") + 1) FROM "mutoh_Details"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"mutoh_Settings"', 'id')), (SELECT (MAX("id") + 1) FROM "mutoh_Settings"), FALSE);

SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"xeikon"', 'id')), (SELECT (MAX("id") + 1) FROM "xeikon"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"xeikon_Printed"', 'id')), (SELECT (MAX("id") + 1) FROM "xeikon_Printed"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"xeikon_Printed_Details"', 'id')), (SELECT (MAX("id") + 1) FROM "xeikon_Printed_Details"), FALSE);
<!-- SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"xeikon_Toner"', 'id')), (SELECT (MAX("id") + 1) FROM "xeikon_Toner"), FALSE); -->
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"xeikon_Toner_Details"', 'id')), (SELECT (MAX("id") + 1) FROM "xeikon_Toner_Details"), FALSE);
<!-- SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"xeikon_DVL"', 'xeikon_unit, color')), (SELECT (MAX("xeikon_unit, color") + 1) FROM "xeikon_DVL"), FALSE); -->
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"xeikon_DVL_Repl"', 'id')), (SELECT (MAX("id") + 1) FROM "xeikon_DVL_Repl"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"xeikon_Fuser"', 'id')), (SELECT (MAX("id") + 1) FROM "xeikon_Fuser"), FALSE);
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"xeikon_Fuser_Repl"', 'id')), (SELECT (MAX("id") + 1) FROM "xeikon_Fuser_Repl"), FALSE);