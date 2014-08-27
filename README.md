# Simple-node-login-app
## Introduction
The aim of this application is to implement a simple Node.js / express / MongoDB application where one or more admin users can manage a set of users who are allowed access to the application. There are two roles, the 'admin' user and the 'user'. 

The application makes use of as many node modules as possible to reduce the amount of custom code. For a list of node modules see package.json, the main ones are the following:
* express
* mongoose
* passport-local
* passport-local-mongoose
* ejs
* connect-roles

Bootstrap is used for the UI. The required js and css files are included in the site directory. 

Of course, this application does nothing useful. It is intended to be an example to build upon to implement useful functionality. There are other node frameworks that give you similar things for less effort, but the aim of this development was to use recent standard node modules and keep things as simple as possible. 

Please feel free to suggest improvements.

## Installation
Install node.js, npm and MongoDB

Clone this git repository

Fetch the node modules
    $ cd simple-node-login-app
    $ npm install

## Usage

### Configure
There are two configuration files:

    $ config/database.js
This file should be updated with the connection information relative to your MongoDB instance.

    $ config/seed.js
This file should be configured with the username and password for the initial seed admin account that is created.

### Running
Start the server as follows:
    $ node app.js

The application will try to find an admin user in the database and will create a seed admin user when none exists according to the values in config/seed.js.

You should then be able to login to the application and create other users as required.

## License
MIT license (http://opensource.org/licenses/MIT).
