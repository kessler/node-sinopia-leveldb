# sinopia-leveldb

**a leveldb backed auth plugin for sinopia private npm**

[![npm status](http://img.shields.io/npm/v/sinopia-leveldb.svg?style=flat-square)](https://www.npmjs.org/package/sinopia-leveldb) [![Travis build status](https://img.shields.io/travis/kessler/node-sinopia-leveldb.svg?style=flat-square&label=travis)](http://travis-ci.org/kessler/node-sinopia-leveldb) [![Dependency status](https://img.shields.io/david/kessler/node-sinopia-leveldb.svg?style=flat-square)](https://david-dm.org/kessler/node-sinopia-leveldb)

## example

```
npm install -g sinopia
npm install -g sinopia-leveldb
```

add this to config.yaml, in the auth section:
```yaml
auth:
  leveldb:
    file: ./userdb
```
The db path is relative to the location of sinopia's config.yaml
You should also remove ```htpasswd ``` plugin if it's there

## license

[MIT](http://opensource.org/licenses/MIT) © yaniv kessler
