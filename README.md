# FW teams Microservice
 
This repository is the node skeleton microservice to create node microservice for WRI API

## Dependencies

The FW teams microservice is built using [Node.js](https://nodejs.org/en/), and can be executed ~~either natively or~~ using Docker~~, each of which has its own set of requirements~~.

Execution using Docker requires:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

Dependencies on other Microservices:
- [GFW User](https://github.com/gfw-api/gfw-user-api/)

## Getting started

Start by cloning the repository from github to your execution environment

```
git clone https://github.com/wri/fw_teams.git && cd fw_teams
```

After that, follow one of the instructions below:

### Using Docker

1 - Execute the following command to run Docker:

```shell
make up-and-build   # First time building Docker or you've made changes to the Dockerfile
make up             # When Docker has already been built and you're starting from where you left off
```

The endpoints provided by this microservice should now be available: [localhost:3035](http://localhost:3035)

2 - Run the following command to lint the project:

```shell
make lint
```

3 - To close Docker:

```shell
make down
```

## Testing

### Using Docker

Follow the instruction above for setting up the runtime environment for Docker execution, then run:
```shell
make test-and-build
```

## Quick Overview

### Teams Entity

```

name: <String>
managers: <String>, // array
users: <String>, // array
confirmedUsers: <Object>, // array
areas: <Object> // array
createdAt: <Date>

```

### CRUD Team

```

GET: /team/user/:userId -> Return the teams from the user if it exists
GET: /teams/:id -> Return team with the id
POST: /teams -> Create an team and associate to the user. With body:

    #form data
    name: "my-team"
    managers: [{ id: "userId", email: user@email.com }]
    users: ["userId", "userId2", "userId3", ...]
    confirmedUsers: [{ id: "userId", email: "user@email.com" } , ...]
    areas: ["areaId", "areaId2", "areaId3", ...]

PATCH: /teams/:id -> Update the team with the id
DELETE: /teams/:id -> Delete the team with the id

```
