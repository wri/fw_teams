.PHONY:

up-and-build:
	docker-compose -f docker-compose-develop.yml up -d --build

up:
	docker-compose -f docker-compose-develop.yml up

down:
	docker-compose -f docker-compose-develop.yml down

lint:
	docker-compose -f docker-compose-develop.yml run develop yarn run lint

test:
	docker-compose -f docker-compose-test.yml up -d --build --abort-on-container-exit
