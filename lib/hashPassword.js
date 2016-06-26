'use strict'

const crypto = require('crypto')

module.exports = (password) => {
	return crypto.createHash('sha1').update(password).digest('base64')
}