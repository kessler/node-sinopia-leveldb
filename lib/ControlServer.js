'use strict'

const http = require('http')
const xn = require('xn')
const concatStream = require('concat-stream')
const packageJson = require('../package.json')

class ControlServer {
	constructor(api, port) {
		this._api = api
		this._port = port
	}

	start(cb) {
		this._rpcServer = new xn.RpcServer()
		this._rpcServer.addApi('sinopia', packageJson.version, this._api)

		http.createServer((req, res) => {
			if (req.method !== 'POST') return this._sendHttpError(res, 'method ' + req.method + ' is not supported')
	
			let bodyStream = concatStream((data) => {
				req.body = data
				this._httpHandler(req, res)
			})
		
			req.pipe(bodyStream).on('error', (err) => { 
				// TODO need any cleanup here? (mississipi)
				this._sendHttpError(res, err) 
			})
		}).listen(this._port, '127.0.0.1', cb) // always listen on local interface only
	}

	_httpHandler(req, res) {
		if (!req.body) {
			this._sendHttpError(res, 'missing data')
		}

		let message
		try {
			message = JSON.parse(req.body)
		} catch (e) {
			return this._sendHttpError(res, e)
		}

		this._rpcServer.dispatch(message, (error, result) => {
			res.end(JSON.stringify({ error, result }))
		})
	}

	_sendHttpError(res, error) {
		res.statusCode = 500

		if (!error) {
			error = 'unknown error'
		}

		res.end(error.toString())
	}
}

module.exports = ControlServer
