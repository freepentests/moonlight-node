// for an explanation on how this code works, check my github gist: https://gist.github.com/freepentests/664a4c49f1a28048921d8ad4f5f2a0eb
import { createHash } from 'crypto';

export class AltSolver {
	async getCaptcha(apiUrl, ...optionalArgs) {
		const resp = await fetch(apiUrl, ...optionalArgs);

		if (resp.status !== 200) {
			throw new Error('API returned non-200 status code');
		} else {
			const json = await resp.json();
			return json;
		}
	}

	hashChallenge(salt, number, algorithm) {
		const hash = createHash(algorithm.toUpperCase())
			.update(salt + number)
			.digest('hex');

		return hash;
	}

	encodeSolution(solution) {
		return btoa(JSON.stringify(solution));
	}

	solveCaptcha(captcha) {
		const algorithm = captcha.algorithm;
		const challenge = captcha.challenge;
		const signature = captcha.signature;
		const salt = captcha.salt;

		const startTime = Date.now();

		const max = captcha.maxnumber;
		const start = 0;

		for (let number = start; number <= max; number++) {
			const hash = this.hashChallenge(salt, number, algorithm);

			if (hash === challenge) {
				const solution = {
					algorithm: algorithm,
					challenge: challenge,
					number: number,
					salt: salt,
					signature: signature,
					took: Date.now() - startTime
				};

				return this.encodeSolution(solution);
			}
		}
	}
}

