'use strict'

const level = require('level-bytewise')
const path = require('path')
const crypto = require('crypto')

const hashPassword = require('./lib/hashPassword.js')
const createApi = require('./lib/api.js')
const ControlServer = require('./lib/ControlServer')

module.exports = (config, stuff) => {
	let log = stuff.logger

	let dbPath = path.resolve(path.dirname(config.self_path), config.file)
	log.warn('sinopia-leveldb - db is at ' + dbPath)
	
	let api = createApi(dbPath, log)	
	let controlServerPort = config.controlServerPort || 4874
	let controlServer = new ControlServer(api, controlServerPort)	
	controlServer.start((err) => {
		if (err) return log.error(err)
		log.warn('sinopia-leveldb - control server started on port %s', controlServerPort)
	})

	return new LevelDBAuth(api)
}

class LevelDBAuth {
	constructor(api) {
		this._api = api
	}

	authenticate(user, password, cb) {
		this._api.authenticate(user, hashPassword(password), cb)
	}

	adduser(user, password, cb) {
		this._api.addUser(user, hashPassword(password), cb)	
	}	
}