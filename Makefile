.PHONY:

up-and-build:
	docker-compose -f docker-compose-develop.yml up -d --build

up:
	docker-compose -f docker-compose-develop.yml up -d

logs:
	docker logs -f fw-teams-develop

ssh:
	docker exec -it fw-teams-develop /bin/bash

down:
	docker-compose -f docker-compose-develop.yml down

lint:
	docker exec -it fw-teams-develop yarn run lint

test-and-build:
	docker-compose -f docker-compose-test.yml up --build --abort-on-container-exit
