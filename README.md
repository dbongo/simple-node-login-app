# Simple-node-login-app
## Introduction
The aim of this application is to implement a simple Node.js / express / MongoDB application where one or more admin users can manage a set of users who are allowed access to the application. There are two roles implemented, 'admin' and 'user' (more can easily be added in the accounts model).

The application makes use of as many standard node modules as possible to reduce the amount of custom code. For a list of node modules see package.json, the main ones are the following:
* express (4)
* mongoose
* passport-local
* passport-local-mongoose
* ejs
* connect-roles

Bootstrap is used for the UI. The required js and css files are hosted on CDN.

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

    $ node server.js
The application will try to find an admin user in the database and will create a seed admin user when none exists according to the values in `config/seed.js`.

You should then be able to login to the application and create other users as required.

### Tests
There are a few tests included, implemented with Mocha, Chai & Should. They can be run via:

    $ make test

These tests are basically copied from the examples given by Michael Herman (see credits below) with a small update to test the two different user roles. More tests should be implemented (something I need to learn).

## Credits
This example builds on this [excellent tutorial by Michael Herman](http://mherman.org/blog/2013/11/11/user-authentication-with-passport-dot-js/#.U_4MAo2Sypc) and the [passport-local login example](https://github.com/jaredhanson/passport-local). It is modified to store user data in MongoDB using Mongoose and via [passport-local-mongoose](https://github.com/saintedlama/passport-local-mongoose). The examples have been updated to work with Express 4. The app also uses [connect-roles](https://github.com/ForbesLindesay/connect-roles) for authorisation by user role. The app has been restructured to place all the routes, models and views in an app subdirectory. A lot of comments have been added to help a new node developer work out what is going on. Some of the restructuring has been inspired by the excellent Node in Action book. I hope that you find this example useful as a starting point to develop an application.

## License
MIT license (http://opensource.org/licenses/MIT).
