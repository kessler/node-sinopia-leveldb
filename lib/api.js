'use strict'

const level = require('level-bytewise')
const rimraf = require('rimraf')
const crypto = require('crypto')

const USERS = 'users'

module.exports = (dbPath, log) => {
	let db = level(dbPath)

	return {
		/**
		 *	recreate the sinopia user db, this must be done with a root user
		 *
		 */
		initUserDb: (rootUser, passwordHash, cb) => {
			db.close()
			rimraf(dbPath, (err) => {
				if (err) return cb(err)
				db = level(dbPath)

				let users = db.sublevel(USERS)
				users.put([rootUser], {
					passwordHash,
					groups: [rootUser, 'root']
				}, cb)
			})
		},

		/**
		 *	Change the user's password.
		 *
		 *	This is meant for root usage, so we don't require the 
		 *	old password to make the change.
		 *
		 */
		changePassword: (user, newPasswordHash, cb) => {
			let users = db.sublevel(USERS)
			users.get([user], (err, userEntry) => {
				if (err) {
					if (err.notFound) {
						return cb(null, false)
					} else {
						return cb(err)
					}
				}

				userEntry.passwordHash = newPasswordHash
				users.put([user], userEntry, (err) => {
					cb(err, true)
				})
			})
		},

		/**
		 *	add groups to a user
		 *
		 */
		addUserGroups: (user, groups, cb) => {
			let users = db.sublevel(USERS)
			users.get([user], (err, userEntry) => {
				if (err) {
					if (err.notFound) {
						return cb(null, false)
					} else {
						return cb(err)
					}
				}

				userEntry.groups = userEntry.groups.concat(groups)
				users.put([user], userEntry, (err) => {
					cb(err, true)
				})
			})
		},

		getUserEntry: (user, cb) => {
			let users = db.sublevel(USERS)
			users.get([user], cb)
		},

		authenticate: (user, passwordHash, cb) => {
			log.warn('sinopia-leveldb - authenticate %s', user)
			let users = db.sublevel(USERS)
			users.get([user], (err, userEntry) => {
				if (err) {
					return cb(err)
				}

				if (userEntry.passwordHash !== passwordHash) {
					return cb(null, false)
				}

				cb(null, userEntry.groups)
			})
		},

		addUser: (user, passwordHash, cb) => {
			log.warn('sinopia-leveldb - addUser %s', user)
			let users = db.sublevel(USERS)

			let putUser = () => {
				users.put([user], {
					passwordHash,
					groups: [user]
				}, (err) => {
					cb(null, true)
				})
			}

			users.get([user], (err) => {
				if (err) {
					if (err.notFound) return putUser()
					else return cb(err, false)
				}

				cb(null, false)
			})
		},

		listUsers: (cb) => {
			log.warn('sinopia-leveldb - listUsers')
			let users = db.sublevel(USERS)
			let result = [], errors = []

			users.createReadStream()
			.on('data', (userEntry) => {
				result.push({
					name: userEntry.key,
					groups: userEntry.value.groups
				})
			})
			.on('error', (err) => {
				errors.push(err)
			})
			.on('end', () => {
				if (errors.length > 0) {
					return cb(errors)
				}

				cb(null, result)
			})
		},

		deleteUser: (user, cb) => {
			log.warn('sinopia-leveldb - deleteUser')
			let users = db.sublevel(USERS)

			// kinda crappy code...
			users.get([user], (err, userEntry) => {
				if (err && err.notFound) return cb(null, false)
				if (err) return cb(err)

				users.del(user, (err) => {
					if (err) return cb(err)
					cb(null, true)
				})
			})
		}
	}
}
