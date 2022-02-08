.PHONY:

up-and-build:
	docker-compose -f docker-compose-develop.yml up -d --build

up:
	docker-compose -f docker-compose-develop.yml up -d

attach:
	docker container attach fw-teams-develop --sig-proxy=false

cli:
	docker exec -it fw-teams-develop /bin/sh

down:
	docker-compose -f docker-compose-develop.yml down

lint:
	docker exec -it fw-teams-develop yarn run lint

test-and-build:
	docker-compose -f docker-compose-test.yml up --build --abort-on-container-exit
