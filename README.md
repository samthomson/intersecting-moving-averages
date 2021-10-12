# intersecting-moving-averages

project to test tracking when two moving averages cross each other.

simple prototype, no db, just keep things in memory and write to disk a log of intersects.

## setup

1. build base container: `docker-compose build app`
2. install container/project's dependencies: `docker-compose run app yarn`