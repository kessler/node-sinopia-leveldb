#!/usr/bin/env node

'use strict'

const program = require('commander')
const packageJson = require('./package.json')
const xn = require('xn')
const unirest = require('unirest')
const hashPassword = require('./lib/hashPassword.js')
const read = require('read')
const isArray = require('util').isArray

let rpcClient = new xn.RpcClient({
	send: (message, callback) => {
		let url = 'http://127.0.0.1:' + (program.port || 4874)
		unirest.post(url)
			.type('json')
			.send(message)
			.end((response) => {
				if (response.error) {
					return console.error(response.error)
				}

				callback(response.body.error, response.body.result)
			})
	}
})

program
	.version(packageJson.version)
	.option('-p --port <controlPort>')
	.command('init [rootUser]')
	.action(initCommand)

program.command('list [user]')
	.action(listCommand)

program.command('delete [user]')
	.action(deleteCommand)

program.command('set-password [user] [password]')
	.action(setPasswordCommand)

program.command('add-group [user] [group]')
	.action(addGroupCommand)

function addGroupCommand(user, group) {
	start((rpc) => {
		rpc.sinopia.addUserGroups(user, group, (err, success) => {
			if (err) return fail(err)

			if (success) {
				return console.log('group added successfully')
			}

			console.log('failed to add user to group')
		})
	})
}

function setPasswordCommand(user) {
	start((rpc) => {
		readPassword((password) => {
			rpc.sinopia.changePassword(user, hashPassword(password),
				(err, success) => {
					if (err) return fail(err)

					if (success) {
						return console.log('password set successfully')
					}

					console.log('failed to set the password')
				})
		})
	})
}

function listCommand(user) {
	start((rpc) => {
		if (user) {
			rpc.sinopia.getUserEntry(user, (err, userEntry) => {
				if (err) return fail(err)
				console.log(`user ${user } is member of these groups: [${userEntry.groups}]`)
			})
		} else {
			rpc.sinopia.listUsers((err, result) => {
				if (err) return fail(err)

				if (isArray(result)) {
					result.forEach((entry) => {
						console.log(`user: ${entry.name} - groups: ${entry.groups}`)
					})
				} else {
					console.log('no results')
				}
			})
		}
	})
}

function initCommand(rootUser) {
	start((rpc) => {
		let confirmOpts = {
			prompt: 'this will delete the current database, are you sure (y/N)?'
		}

		read(confirmOpts, confirm)

		function confirm(err, answer, isDefault) {
			if (answer === 'y') {
				readPassword((password) => {
					rpc.sinopia.initUserDb(rootUser, hashPassword(password), initDone)
				})
			} else {
				console.log('operation cancelled.')
			}
		}

		function initDone(err) {
			if (err) return console.error(err)
			console.log('initialized successfully')
		}
	})
}

function deleteCommand(user) {
	start((rpc) => {
		rpc.sinopia.deleteUser(user, (err, success) => {
			if (err) return fail(err)

			if (success) {
				return console.log('user deleted successfully')
			}

			console.log('failed to delete user')
		})
	})
}

function readPassword(cb) {
	let passwordOpts = {
		prompt: 'password:',
		silent: true,
		replace: '*'
	}

	read(passwordOpts, (err, password, isDefault) => {
		if (err) {
			return fail(err)
		}

		if (isDefault) {
			return fail('must provide a password')
		}

		if (!password) {
			return fail('must provide a password')
		}

		cb(password)
	})
}

function start(cb) {
	rpcClient.refresh((err, rpc) => {
		if (err) {
			return fail(err)
		}

		cb(rpc)
	})
}

function fail(err) {
	console.error(err)
	process.exit(1)
}
program.parse(process.argv)
