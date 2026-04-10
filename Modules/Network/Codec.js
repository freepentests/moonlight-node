import { OPCODES } from './Opcodes.js';
import msgpack from '@msgpack/msgpack';

export class Codec {
	decode(data) {
		const deserializedData = msgpack.decode(data);
		if (!deserializedData instanceof Array) return;

		const opcode = deserializedData[0];

		switch (opcode) {
			case OPCODES.TEAMS:
				return this.decodeTeams('TEAMS', deserializedData);

			case OPCODES.IO_INIT:
				return { opcode: 'IO_INIT' };

			default:
				return { opcode: opcode };
		}
	}

	decodeTeams(opcode, deserializedData) {
		return {
			opcode: opcode,
			teams: deserializedData[1][0].teams
		};
	}

	encodePing() {
		const data = ['0', []];
		const serialized = msgpack.encode(data);

		return serialized;
	}

	encodeSendChatMessage(message) {
		const data = ['6', [message]];
		const serialized = msgpack.encode(data);

		return serialized;
	}

	encodeJoinGame(name, skin) {
		const data = ['M', [{
			name: name,
			moofoll: 100,
			skin: skin
		}]];
		const serialized = msgpack.encode(data);

		return serialized;
	}
}

