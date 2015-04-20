#Sailfish-CI Server

*This project is under heavy development and is not ready for production*

## Dependencies

* [NodeJS](https://nodejs.org/) >= 0.10.36
* [PM2](https://github.com/Unitech/PM2)

### Development dependencies

* JSHint

## Installation

Install the NPM dependencies:

    npm install
   
## Configuration
    
Configure the server through the configuration.js file on the project root

    module.exports = {
    
        app_root: __dirname,
        port: 13800,
        sailfish_host: 'http://127.0.0.1:13800',
        mongo: 'mongodb://172.17.0.18/sailfish',
        
        //ssh key generation
        ssh: {
            bits: 1024
        }
    
    }
    
### Configuration keys
    
####port

The port used by the server for the frontend and the runner's connection can be configured with this option

####sailfish_host

Public address of the Sailfish CI Server

####mongo

Mongo connection string for database

####ssh

All the configurations related with the SSH usage are contained in this object

**bits**: Bits used to generate the random keys for the new projects

###About
* Sailfish logo : Image courtesy of vectorolie at FreeDigitalPhotos.net
