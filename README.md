# Scheduler

This project's technology stack consists of React, GraphQL, Apollo, and Node.js

## General Job Scheduler

- Some service defines a task that needs to be repeatedly processed with a scheduled time frame.
- Send defined job with its API that can access and run the task to Scheduler service
- Scheduler service will receive the task from the service, and create add the task to the task queue (if the queue doesn’t exist, then the queue needs to be created)
- Process the queue
- If it is just a one-time scheduled task, the task will be removed from the queue once it’s done.

### Task Definitions
When services schedule tasks, they need to define the task that needs to be scheduled. Based on the task definition, the task will be triggered. Task definition is designed as two different types: GraphQL and RESTful API. Both types have the same JSON object structure, but values should be distinguished.

## Using Bull-Board: Job Queue Management UI
in app.js file, UI module is imported, and use express app to use it with assigned address.

```
{
	import { UI } from 'bull-board';

	// Make bullboard available at the base app route
	app.use('/admin', UI);
}

```

### Install Node.js

Go to the following link and download Node.js _(Recommended For Most Users)_
[Install Node.js](https://nodejs.org/en/)

> Once you installed Node.js, you can open terminal and type `npm -v`. If you see the version number, then you are all set!

## Setting up


You must go into the new `scheduler` directory for running the further commands.

```
cd scheduler
```

## Initialize Project

1. Clone scheduler repository

2. move to scheduler folder and

```sh
$ npm install
```

Step 2 will generate node_modules in each directory.

## .env File Setup

Duplicate sample.env file in ./configs/ and rename the copied file as .env

Fill out all the listed Key values.The values below are just examples.

```
REDIS_URL=10.55.34.70 //redis host ip
REDIS_PORT=3000 // redis port
```

### Run

```
$ npm start
```

## Extensions

We Recommend installing extensions listed below

- Prettier
- ESLint

## Notes

- Scheduler service runs with babel which means that you can use the latest Javascript syntax.
