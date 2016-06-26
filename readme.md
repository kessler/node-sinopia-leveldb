# sinopia-leveldb

**a leveldb backed auth plugin for sinopia private npm**

- This plugin saves only hashes of the password
- Plugin comes with an api tool to perform various operations (see below)
- Supports groups, groups can be used in sinopia's config.yaml to restrict access to packages

[![npm status](http://img.shields.io/npm/v/sinopia-leveldb.svg?style=flat-square)](https://www.npmjs.org/package/sinopia-leveldb) [![Dependency status](https://img.shields.io/david/kessler/node-sinopia-leveldb.svg?style=flat-square)](https://david-dm.org/kessler/node-sinopia-leveldb)

## set up

#### install sinopia and the plug in
```
npm install -g sinopia
npm install -g sinopia-leveldb
```

#### add this to config.yaml, in the auth section:
```yaml
auth:
  leveldb:
    file: ./userdb

    # replace the control port use to communicate 
    # between the cli and sinopia.
    # this configuration is optional
    # controlServerPort: 4874
```
The db path is relative to the location of sinopia's config.yaml
You should also remove ```htpasswd ``` plugin if it's there

#### fire up sinopia
```
sinopia
```
I usually use pm2 for this. 

#### use the cli tool to initialize the database
With a root user, pick any name
```
sinopia-leveldb init myuser
```

## other cli commands

#### set password
```
sinopia-leveldb set-password myuser
```

#### add user to groups
```
sinopia-leveldb add-group myuser somegroup
```

#### list user's groups
```
sinopia-leveldb list myuser
```

#### list all users with their groups
```
sinopia-leveldb list
```

## license

[MIT](http://opensource.org/licenses/MIT) © yaniv kessler
