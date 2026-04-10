import { AltSolver } from './Modules/Altcha.js';
import { Codec } from './Modules/Network/Codec.js';

// DEPENDENCIES
import { WebSocket } from 'ws';

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

	onMessage(e) {
		const decoded = this.codec.decode(e.data);
		console.log(decoded);
	}

	async getCaptchaToken() {
		const cap = await this.altSolver.getCaptcha('https://api.moomoo.io/verify', {
			headers: this.headers
		});

		const token = await this.altSolver.solveCaptcha(cap);
		
		return token;
	}

	async sendBot() {
		const token = await this.getCaptchaToken();
		console.log(token);

		this.ws = new WebSocket(`${this.wsUrl}/?token=alt:${token}`, {
			headers: this.headers
		});

		this.ws.addEventListener('message', this.onMessage.bind(this));
	}
}

const bot = new Bot('wss://gs-5v8rd-mktg2.miami.moomoo.io/');
bot.sendBot();

