import msgpack from '@msgpack/msgpack';

export class Codec {
	decodePacket(data) {
		const deserialized = msgpack.decode(data);
	}
}

