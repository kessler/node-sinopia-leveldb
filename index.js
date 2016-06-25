'use strict'

const level = require('level-bytewise')
const path = require('path')
const crypto = require('crypto')

module.exports = (config, stuff) => {
	return new LevelDBAuth(config, stuff)
}

class LevelDBAuth {

	constructor(config, stuff) {
		this._log = stuff.logger
		this._config = config
		this._stuff = stuff
		this._dbPath = path.resolve(path.dirname(stuff.config.self_path), config.file)
		this._log.warn('leveldb is at ' + this._dbPath)
		this._db = level(this._dbPath)
	}

	authenticate(user, password, cb) {
		this._log.warn('authenticate %s', user)
		this._db.get([user], (err, userEntry) => {
			this._log.warn(err, userEntry)
			if (err) {
				if (err.notFound) {
					return cb(null, false)
				} else {
					return cb(err)
				}
			}

			if (userEntry.passwordHash !== this._hash(password))  {
				return cb(null, false)
			}

			cb(null, userEntry.groups)
		})
	}

	adduser(user, password, cb) {
		this._log.warn('adduser %s', user)
		let putUser = () => {
			this._db.put([user], {
				passwordHash: this._hash(password),
				groups: [user]
			}, (err) => {
				cb(null, true)
			})
		}

		this._db.get([user], (err) => {
			if (err) {
				if (err.notFound) return putUser()
				else return cb(err, false)
			}

			cb(null, false)
		})
	}

	_hash(password) {
		return crypto.createHash('sha1').update(password).digest('base64')
	}
}