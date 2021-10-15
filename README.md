# intersecting-moving-averages

project to test tracking when two moving averages cross each other.

simple prototype, no db, just keep things in memory and write to disk a log of intersects.

## setup

1. `cp .env.sample .env` and fill in values
	- `ORACLE_URL` should be where you have the oracle service running eg 'http://www.oracleurl.net'
2. build base container: `docker-compose build app`
3. install container/project's dependencies: `docker-compose run app yarn`

## run

`docker-compose run app yarn run track`
