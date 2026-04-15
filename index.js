#!/bin/node

import { CONFIG } from './Config.js';
import { AltSolver } from './Modules/Altcha.js';
import { Codec } from './Modules/Network/Codec.js';

// DEPENDENCIES
import * as fs from 'fs';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { WebSocket } from 'ws';

process.on('uncaughtException', (e) => {
	console.log(e); // ignore all exceptions and just print them
});

const proxies = fs.readFileSync('proxies.txt', 'utf-8').split('\n');

class Bot {
	constructor(wsUrl) {
		this.wsUrl = wsUrl;
		this.altSolver = new AltSolver();
		this.codec = new Codec();
		this.ws = null;

		// we need headers so cloudflare is happy
		this.headers = {
        		'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:149.0) Gecko/20100101 Firefox/149.0',
    		};

	}

	startMessageInterval() {
		setInterval(() => {
			this.ws.send(this.codec.encodeSendChatMessage(
				CONFIG.message
			));
		}, 1000);
	}

	startRespawnInterval() {
		setInterval(() => {
			this.ws.send(this.codec.encodeJoinGame(
				CONFIG.name,
				CONFIG.skin
			));
		}, 1000);
	}

	onMessage(e) {
		const decoded = this.codec.decode(e.data);

		if (decoded.opcode === 'IO_INIT') {
			this.startRespawnInterval();
			this.startMessageInterval();
		}
	}

	async getCaptchaToken() {
		const cap = await this.altSolver.getCaptcha('https://api.moomoo.io/verify', {
			headers: this.headers
		});

		const token = await this.altSolver.solveCaptcha(cap);
		
		return token;
	}

	async sendBot(agent) {
		const token = await this.getCaptchaToken();

		this.ws = new WebSocket(`${this.wsUrl}/?token=alt:${token}`, {
			headers: this.headers,
			agent: agent
		});

		this.ws.addEventListener('message', this.onMessage.bind(this));
	}
}

for (let i = 0; i < 10; i++) {
	const proxy = proxies[i];

	const bot = new Bot('wss://gs-5v8rd-mktg2.miami.moomoo.io/');
	bot.sendBot(new SocksProxyAgent(proxy));
}

