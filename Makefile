default:

build:
	docker-compose -f docker-compose-develop.yml build
	docker-compose -f docker-compose-test.yml build

develop:
	docker-compose -f docker-compose-develop.yml up

test:
	docker-compose -f docker-compose-test.yml up --abort-on-container-exit