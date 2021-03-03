# MONOCLE-SOS-proxy

A lite authentication layer for remote SOS access for the Horizon 2020 project MONOCLE

## Requirements

* [Docker](https://docker.com)
* [Postgres](https://www.postgresql.org) database
* Existing [SOS](https://github.com/52North/SOS) server


## Installation

Once you've downloaded this repository, installation can commence.

### Create the database tables

This is supplied in [schema.sql](schema.sql)

Create a proxy user

```sql
INSERT INTO users (username, password) VALUES ('YOUR_USERNAME', 'YOUR_PASSWORD');
```

### Configure your proxy

Configure your particlar setup in the following files

#### Configure SOS

The direct SOS URL should be definied in the sos_service variable in the [~/auth_token_gen_app/app.js](/auth_token_gen_app/app.js) file

### Configure Database

Your postgres details should be added into the file [~/auth_token_gen_app/db/index.js](/auth_token_gen_app/db/index.js) in the Pool object parameters

### Build and run the docker

Build and run the docker in the usual way. Remember to forward port 80 from the container to an externale port

#### Examples

To build
```bash
docker build . --tag sos-proxy
```
To run
```bash
docker run -d -p 80:8080 --name sos-proxy-container sos-proxy
```

## Usage

### Authenticate

We first make a url call to authenticate our user and obtain our authentication key
```bash
http://yourserver:yourport/api/get_token/YOUR_SENSOR_NAME/YOUR_USER_NAME/YOUR_PASSWORD
```
The entry for the sensor will be created for you as long as the user and password are correct


### Submission


Submit your sos xml requests to the following url for passthrough
```bash
http://yourserver:yourport/api/sos_proxy/YOUR_TOKEN/xml/submit
```

You can register as many sensors as you like to create multiple valid keys

Delete keys from the database to lock out sensors from submitting further data
