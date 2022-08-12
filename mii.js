const bitBuffer = require('bit-buffer');
const assert = require('assert');

const STUDIO_RENDER_DEFAULTS = {
	type: 'face',
	expression: 'normal',
	width: 96,
	bgColor: 'FFFFFF00',
	clothesColor: 'default',
	cameraXRotate: 0,
	cameraYRotate: 0,
	cameraZRotate: 0,
	characterXRotate: 0,
	characterYRotate: 0,
	characterZRotate: 0,
	lightXDirection: 0,
	lightYDirection: 0,
	lightZDirection: 0,
	lightDirectionMode: 'none',
	instanceCount: 1,
	instanceRotationMode: 'model',
};

const STUDIO_RENDER_TYPES = [
	'face',
	'face_only',
	'all_body',
];

const STUDIO_RENDER_EXPRESSIONS = [
	'normal',
	'smile',
	'anger',
	'sorrow',
	'surprise',
	'blink',
	'normal_open_mouth',
	'smile_open_mouth',
	'anger_open_mouth',
	'surprise_open_mouth',
	'sorrow_open_mouth',
	'blink_open_mouth',
	'wink_left',
	'wink_right',
	'wink_left_open_mouth',
	'wink_right_open_mouth',
	'like_wink_left',
	'like_wink_right',
	'frustrated',
];

const STUDIO_RENDER_CLOTHES_COLORS = [
	'default',
	'red',
	'orange',
	'yellow',
	'yellowgreen',
	'green',
	'blue',
	'skyblue',
	'pink',
	'purple',
	'brown',
	'white',
	'black',
];

const STUDIO_RENDER_LIGHT_DIRECTION_MODS = [
	'none',
	'zerox',
	'flipx',
	'camera',
	'offset',
	'set',
];

const STUDIO_RENDER_INSTANCE_ROTATION_MODES = [
	'model',
	'camera',
	'both',
];

const STUDIO_BG_COLOR_REGEX = /^[0-9A-F]{8}$/; // Mii Studio does not allow lowercase

// This just felt nice to me
Number.prototype.inRange = function (range) {
	return range.includes(this.valueOf());
};

function clamp(number, lower, upper) {
	if (upper === undefined) {
		upper = lower;
		lower = 0;
	}

	return Math.max(lower, Math.min(number, upper));
};

// lazy Python style range function
function range(start, stop) {
	if (!stop) {
		stop = start;
		start = 0;
	}

	const result = [];

	for (let i = start; i < stop; i++) {
		result.push(i);
	}

	return result;
}

class Mii extends bitBuffer.BitStream {
	constructor(buffer) {
		super(buffer.buffer, buffer.byteOffset, buffer.byteLength);
		this.decode();
	}

	swapEndian() {
		this.bigEndian = !this.bigEndian;
	}

	alignByte() {
		const nextClosestByteIndex = 8 * Math.ceil(this._index / 8)
		const bitDistance = nextClosestByteIndex - this._index;

		this.skipBits(bitDistance);
	}

	bitSeek(bitPos) {
		this._index = bitPos;
	}

	skipBits(bits) {
		this.bitSeek(this._index + bits);
	}

	skipBytes(bytes) {
		const bits = bytes * 8;
		this.skipBits(bits);
	}

	skipBit() {
		this.skipBits(1);
	}

	skipInt8() {
		this.skipBytes(1);
	}

	skipInt16() {
		// Skipping a uint16 is the same as skipping 2 uint8's
		this.skipInt8();
		this.skipInt8();
	}

	readBit() {
		return this.readBits(1);
	}

	readBytes(length) {
		return Array(length).fill().map(() => this.readUint8());
	}

	readBuffer(length) {
		return Buffer.from(this.readBytes(length));
	}

	readUTF16String(length) {
		return this.readBuffer(length).toString('utf16le').replace(/\0.*$/, '');
	}

	writeBit(bit) {
		this.writeBits(bit, 1);
	}

	writeBuffer(buffer) {
		buffer.forEach(byte => this.writeUint8(byte));
	}

	writeUTF16String(string) {
		const stringBuffer = Buffer.from(string, 'utf16le');
		const terminatedBuffer = Buffer.alloc(0x14);

		stringBuffer.copy(terminatedBuffer);

		this.writeBuffer(terminatedBuffer);
	}

	validate() {
		// Size check
		assert.equal(this.length / 8, 0x60, `Invalid Mii data size. Got ${this.length / 8}, expected 96`);

		// Value range and type checks
		assert.ok(this.version === 0 || this.version === 3, `Invalid Mii version. Got ${this.version}, expected 0 or 3`);
		assert.equal(typeof this.allowCopying, 'boolean', `Invalid Mii allow copying. Got ${this.allowCopying}, expected true or false`);
		assert.equal(typeof this.profanityFlag, 'boolean', `Invalid Mii profanity flag. Got ${this.profanityFlag}, expected true or false`);
		assert.ok(this.regionLock.inRange(range(4)), `Invalid Mii region lock. Got ${this.regionLock}, expected 0-3`);
		assert.ok(this.characterSet.inRange(range(4)), `Invalid Mii region lock. Got ${this.characterSet}, expected 0-3`);
		assert.ok(this.pageIndex.inRange(range(10)), `Invalid Mii page index. Got ${this.pageIndex}, expected 0-9`);
		assert.ok(this.slotIndex.inRange(range(10)), `Invalid Mii slot index. Got ${this.slotIndex}, expected 0-9`);
		assert.equal(this.unknown1, 0, `Invalid Mii unknown1. Got ${this.unknown1}, expected 0`);
		assert.ok(this.deviceOrigin.inRange(range(1, 5)), `Invalid Mii device origin. Got ${this.deviceOrigin}, expected 1-4`);
		assert.equal(this.systemId.length, 8, `Invalid Mii system ID size. Got ${this.systemId.length}, system IDs must be 8 bytes long`);
		assert.equal(typeof this.normalMii, 'boolean', `Invalid normal Mii flag. Got ${this.normalMii}, expected true or false`);
		assert.equal(typeof this.dsMii, 'boolean', `Invalid DS Mii flag. Got ${this.dsMii}, expected true or false`);
		assert.equal(typeof this.nonUserMii, 'boolean', `Invalid non-user Mii flag. Got ${this.nonUserMii}, expected true or false`);
		assert.equal(typeof this.isValid, 'boolean', `Invalid Mii valid flag. Got ${this.isValid}, expected true or false`);
		assert.ok(this.creationTime < 268435456, `Invalid Mii creation time. Got ${this.creationTime}, max value for 28 bit integer is 268,435,456`);
		assert.equal(this.consoleMAC.length, 6, `Invalid Mii console MAC address size. Got ${this.consoleMAC.length}, console MAC addresses must be 6 bytes long`);
		assert.ok(this.gender.inRange(range(1)), `Invalid Mii gender. Got ${this.gender}, expected 0 or 1`);
		assert.ok(this.birthMonth.inRange(range(13)), `Invalid Mii birth month. Got ${this.birthMonth}, expected 0-12`);
		assert.ok(this.birthDay.inRange(range(32)), `Invalid Mii birth day. Got ${this.birthDay}, expected 0-31`);
		assert.ok(this.favoriteColor.inRange(range(12)), `Invalid Mii favorite color. Got ${this.favoriteColor}, expected 0-11`);
		assert.equal(typeof this.favorite, 'boolean', `Invalid favorite Mii flag. Got ${this.favorite}, expected true or false`);
		assert.ok(Buffer.from(this.miiName, 'utf16le').length <= 0x14, `Invalid Mii name. Got ${this.miiName}, name may only be up to 10 characters`);
		assert.ok(this.height.inRange(range(128)), `Invalid Mii height. Got ${this.height}, expected 0-127`);
		assert.ok(this.build.inRange(range(128)), `Invalid Mii build. Got ${this.build}, expected 0-127`);
		assert.equal(typeof this.disableSharing, 'boolean', `Invalid disable sharing Mii flag. Got ${this.disableSharing}, expected true or false`);
		assert.ok(this.faceType.inRange(range(12)), `Invalid Mii face type. Got ${this.faceType}, expected 0-11`);
		assert.ok(this.skinColor.inRange(range(6)), `Invalid Mii skin color. Got ${this.skinColor}, expected 0-6`);
		assert.ok(this.wrinklesType.inRange(range(12)), `Invalid Mii wrinkles type. Got ${this.wrinklesType}, expected 0-11`);
		assert.ok(this.makeupType.inRange(range(12)), `Invalid Mii makeup type. Got ${this.makeupType}, expected 0-11`);
		assert.ok(this.hairType.inRange(range(132)), `Invalid Mii hair type. Got ${this.hairType}, expected 0-131`);
		assert.ok(this.hairColor.inRange(range(8)), `Invalid Mii hair color. Got ${this.hairColor}, expected 0-7`);
		assert.equal(typeof this.flipHair, 'boolean', `Invalid flip hair flag. Got ${this.flipHair}, expected true or false`);
		assert.ok(this.eyeType.inRange(range(50)), `Invalid Mii eye type. Got ${this.eyeType}, expected 0-59`);
		assert.ok(this.eyeColor.inRange(range(6)), `Invalid Mii eye color. Got ${this.eyeColor}, expected 0-5`);
		assert.ok(this.eyeScale.inRange(range(8)), `Invalid Mii eye scale. Got ${this.eyeScale}, expected 0-7`);
		assert.ok(this.eyeVerticalStretch.inRange(range(7)), `Invalid Mii eye vertical stretch. Got ${this.eyeVerticalStretch}, expected 0-6`);
		assert.ok(this.eyeRotation.inRange(range(8)), `Invalid Mii eye rotation. Got ${this.eyeRotation}, expected 0-7`);
		assert.ok(this.eyeSpacing.inRange(range(13)), `Invalid Mii eye spacing. Got ${this.eyeSpacing}, expected 0-12`);
		assert.ok(this.eyeYPosition.inRange(range(19)), `Invalid Mii eye Y position. Got ${this.eyeYPosition}, expected 0-18`);
		assert.ok(this.noseType.inRange(range(18)), `Invalid Mii nose type. Got ${this.noseType}, expected 0-17`);
		assert.ok(this.noseScale.inRange(range(9)), `Invalid Mii nose scale. Got ${this.noseScale}, expected 0-8`);
		assert.ok(this.noseYPosition.inRange(range(19)), `Invalid Mii nose Y position. Got ${this.noseYPosition}, expected 0-18`);
		assert.ok(this.mouthType.inRange(range(36)), `Invalid Mii mouth type. Got ${this.mouthType}, expected 0-35`);
		assert.ok(this.mouthColor.inRange(range(5)), `Invalid Mii mouth color. Got ${this.mouthColor}, expected 0-4`);
		assert.ok(this.mouthScale.inRange(range(9)), `Invalid Mii mouth scale. Got ${this.mouthScale}, expected 0-8`);
		assert.ok(this.mouthHorizontalStretch.inRange(range(7)), `Invalid Mii mouth stretch. Got ${this.mouthHorizontalStretch}, expected 0-6`);
		assert.ok(this.mouthYPosition.inRange(range(19)), `Invalid Mii mouth Y position. Got ${this.mouthYPosition}, expected 0-18`);
		assert.ok(this.mustacheType.inRange(range(6)), `Invalid Mii mustache type. Got ${this.mustacheType}, expected 0-5`);
		assert.ok(this.beardType.inRange(range(6)), `Invalid Mii beard type. Got ${this.beardType}, expected 0-5`);
		assert.ok(this.facialHairColor.inRange(range(8)), `Invalid Mii beard type. Got ${this.facialHairColor}, expected 0-7`);
		assert.ok(this.mustacheScale.inRange(range(9)), `Invalid Mii mustache scale. Got ${this.mustacheScale}, expected 0-8`);
		assert.ok(this.mustacheYPosition.inRange(range(17)), `Invalid Mii mustache Y position. Got ${this.mustacheYPosition}, expected 0-16`);
		assert.ok(this.glassesType.inRange(range(9)), `Invalid Mii glassess type. Got ${this.glassesType}, expected 0-8`);
		assert.ok(this.glassesColor.inRange(range(6)), `Invalid Mii glassess type. Got ${this.glassesColor}, expected 0-5`);
		assert.ok(this.glassesScale.inRange(range(8)), `Invalid Mii glassess type. Got ${this.glassesScale}, expected 0-7`);
		assert.ok(this.glassesYPosition.inRange(range(21)), `Invalid Mii glassess Y position. Got ${this.glassesYPosition}, expected 0-20`);
		assert.equal(typeof this.moleEnabled, 'boolean', `Invalid mole enabled flag. Got ${this.moleEnabled}, expected true or false`);
		assert.ok(this.moleScale.inRange(range(9)), `Invalid Mii mole scale. Got ${this.moleScale}, expected 0-8`);
		assert.ok(this.moleXPosition.inRange(range(17)), `Invalid Mii mole X position. Got ${this.moleXPosition}, expected 0-16`);
		assert.ok(this.moleYPosition.inRange(range(31)), `Invalid Mii mole Y position. Got ${this.moleYPosition}, expected 0-30`);

		// Sanity checks
		/*

		HEYimHeroic says this check must be true,
		but in my testing my Mii's have both these flags
		set and are valid

		Commenting out until we get more info

		if (this.dsMii && this.isValid) {
			assert.fail('If DS Mii flag is true, the is valid flag must be false');
		}
		*/

		if (this.nonUserMii && (this.creationTime !== 0 || this.isValid || this.dsMii || this.normalMii)) {
			assert.fail('Non-user Mii\'s must have all other Mii ID bits set to 0');
		}

		if (!this.normalMii && !this.disableSharing) {
			assert.fail('Special Miis must have sharing disabled');
		}
	}

	decode() {
		this.version = this.readUint8();
		this.allowCopying = this.readBoolean();
		this.profanityFlag = this.readBoolean();
		this.regionLock = this.readBits(2);
		this.characterSet = this.readBits(2);
		this.alignByte();
		this.pageIndex = this.readBits(4);
		this.slotIndex = this.readBits(4);
		this.unknown1 = this.readBits(4);
		this.deviceOrigin = this.readBits(3);
		this.alignByte();
		this.systemId = this.readBuffer(8);
		this.swapEndian(); // * Mii ID data is BE
		this.normalMii = this.readBoolean();
		this.dsMii = this.readBoolean();
		this.nonUserMii = this.readBoolean();
		this.isValid = this.readBoolean();
		this.creationTime = this.readBits(28);
		this.swapEndian(); // * Swap back to LE
		this.consoleMAC = this.readBuffer(6);
		this.skipInt16(); // * 0x0000 padding
		this.gender = this.readBit();
		this.birthMonth = this.readBits(4);
		this.birthDay = this.readBits(5);
		this.favoriteColor = this.readBits(4);
		this.favorite = this.readBoolean();
		this.alignByte();
		this.miiName = this.readUTF16String(0x14);
		this.height = this.readUint8();
		this.build = this.readUint8();
		this.disableSharing = this.readBoolean();
		this.faceType = this.readBits(4);
		this.skinColor = this.readBits(3);
		this.wrinklesType = this.readBits(4);
		this.makeupType = this.readBits(4);
		this.hairType = this.readUint8();
		this.hairColor = this.readBits(3);
		this.flipHair = this.readBoolean();
		this.alignByte();
		this.eyeType = this.readBits(6);
		this.eyeColor = this.readBits(3);
		this.eyeScale = this.readBits(4);
		this.eyeVerticalStretch = this.readBits(3);
		this.eyeRotation = this.readBits(5);
		this.eyeSpacing = this.readBits(4);
		this.eyeYPosition = this.readBits(5);
		this.alignByte();
		this.eyebrowType = this.readBits(5);
		this.eyebrowColor = this.readBits(3);
		this.eyebrowScale = this.readBits(4);
		this.eyebrowVerticalStretch = this.readBits(3);
		this.skipBit();
		this.eyebrowRotation = this.readBits(4);
		this.skipBit();
		this.eyebrowSpacing = this.readBits(4);
		this.eyebrowYPosition = this.readBits(5);
		this.alignByte();
		this.noseType = this.readBits(5);
		this.noseScale = this.readBits(4);
		this.noseYPosition = this.readBits(5);
		this.alignByte();
		this.mouthType = this.readBits(6);
		this.mouthColor = this.readBits(3);
		this.mouthScale = this.readBits(4);
		this.mouthHorizontalStretch = this.readBits(3);
		this.mouthYPosition = this.readBits(5);
		this.mustacheType = this.readBits(3);
		this.unknown2 = this.readUint8();
		this.beardType = this.readBits(3);
		this.facialHairColor = this.readBits(3);
		this.mustacheScale = this.readBits(4);
		this.mustacheYPosition = this.readBits(5);
		this.alignByte();
		this.glassesType = this.readBits(4);
		this.glassesColor = this.readBits(3);
		this.glassesScale = this.readBits(4);
		this.glassesYPosition = this.readBits(5);
		this.moleEnabled = this.readBoolean();
		this.moleScale = this.readBits(4);
		this.moleXPosition = this.readBits(5);
		this.moleYPosition = this.readBits(5);
		this.alignByte();
		this.creatorName = this.readUTF16String(0x14);
		this.skipInt16(); // * 0x0000 padding
		this.swapEndian(); // * Swap to big endian because thats how checksum is calculated here
		this.checksum = this.readUint16();
		this.swapEndian(); // * Swap back to little endian

		this.validate();
		
		if (this.checksum !== this.CRC16XMODEM()) {
			throw new Error('Invalid Mii checksum');
		}
	}

	encode() {
		this.validate(); // * Don't write invalid Mii data
		
		// TODO - Maybe create a new stream instead of modifying the original?
		this.bitSeek(0);

		this.writeUint8(this.version);
		this.writeBoolean(this.allowCopying)
		this.writeBoolean(this.profanityFlag)
		this.writeBits(this.regionLock, 2);
		this.writeBits(this.characterSet, 2);
		this.alignByte();
		this.writeBits(this.pageIndex, 4);
		this.writeBits(this.slotIndex, 4);
		this.writeBits(this.unknown1, 4);
		this.writeBits(this.deviceOrigin, 3);
		this.alignByte();
		this.writeBuffer(this.systemId);
		this.swapEndian(); // * Mii ID data is BE
		this.writeBits(this.creationTime, 28); // TODO - Calculate this instead of carrying it over
		this.writeBoolean(this.isValid);
		this.writeBoolean(this.nonUserMii);
		this.writeBoolean(this.dsMii);
		this.writeBoolean(this.normalMii);
		this.swapEndian(); // * Swap back to LE
		this.writeBuffer(this.consoleMAC);
		this.writeUint16(0x0); // * 0x0000 padding
		this.writeBit(this.gender);
		this.writeBits(this.birthMonth, 4);
		this.writeBits(this.birthDay, 5);
		this.writeBits(this.favoriteColor, 4);
		this.writeBoolean(this.favorite);
		this.alignByte();
		this.writeUTF16String(this.miiName);
		this.writeUint8(this.height);
		this.writeUint8(this.build);
		this.writeBoolean(this.disableSharing);
		this.writeBits(this.faceType, 4);
		this.writeBits(this.skinColor, 3);
		this.writeBits(this.wrinklesType, 4);
		this.writeBits(this.makeupType, 4);
		this.writeUint8(this.hairType);
		this.writeBits(this.hairColor, 3);
		this.writeBoolean(this.flipHair);
		this.alignByte();
		this.writeBits(this.eyeType, 6);
		this.writeBits(this.eyeColor, 3);
		this.writeBits(this.eyeScale, 4);
		this.writeBits(this.eyeVerticalStretch, 3);
		this.writeBits(this.eyeRotation, 5);
		this.writeBits(this.eyeSpacing, 4);
		this.writeBits(this.eyeYPosition, 5);
		this.alignByte();
		this.writeBits(this.eyebrowType, 5);
		this.writeBits(this.eyebrowColor, 3);
		this.writeBits(this.eyebrowScale, 4);
		this.writeBits(this.eyebrowVerticalStretch, 3);
		this.skipBit();
		this.writeBits(this.eyebrowRotation, 4);
		this.skipBit();
		this.writeBits(this.eyebrowSpacing, 4);
		this.writeBits(this.eyebrowYPosition, 5);
		this.alignByte();
		this.writeBits(this.noseType, 5);
		this.writeBits(this.noseScale, 4);
		this.writeBits(this.noseYPosition, 5);
		this.alignByte();
		this.writeBits(this.mouthType, 6);
		this.writeBits(this.mouthColor, 3);
		this.writeBits(this.mouthScale, 4);
		this.writeBits(this.mouthHorizontalStretch, 3);
		this.writeBits(this.mouthYPosition, 5);
		this.writeBits(this.mustacheType, 3);
		this.writeUint8(this.unknown2);
		this.writeBits(this.beardType, 3);
		this.writeBits(this.facialHairColor, 3);
		this.writeBits(this.mustacheScale, 4);
		this.writeBits(this.mustacheYPosition, 5);
		this.alignByte();
		this.writeBits(this.glassesType, 4);
		this.writeBits(this.glassesColor, 3);
		this.writeBits(this.glassesScale, 4);
		this.writeBits(this.glassesYPosition, 5);
		this.writeBoolean(this.moleEnabled);
		this.writeBits(this.moleScale, 4);
		this.writeBits(this.moleXPosition, 5);
		this.writeBits(this.moleYPosition, 5);
		this.alignByte();
		this.writeUTF16String(this.creatorName);
		this.writeUint16(0x0); // * 0x0000 padding
		this.swapEndian();// * Swap to big endian because thats how checksum is calculated here
		this.writeUint16(this.CRC16XMODEM());
		this.swapEndian();// * Swap back to little endian

		return Buffer.from(this.view._view);
	}

	CRC16XMODEM() {
		const view = this.view;
		const data = view._view.subarray(0, 0x5e);

		let crc = 0x0000;

		for (const byte of data) {
			for (let bit = 7; bit >= 0; bit--) {
				const flag = (crc & 0x8000) != 0;
				crc = (((crc << 1) | ((byte >> bit) & 0x1)) ^ (flag ? 0x1021 : 0));
			}
		}

		for (let i = 16; i > 0; i--) {
			const flag = ((crc & 0x8000) != 0);
			crc = ((crc << 1) ^ (flag ? 0x1021 : 0));
		}

		return (crc & 0xFFFF);
	}

	encodeStudio() {
		/*
			Can also disable randomization with:

			let miiStudioData = Buffer.alloc(0x2F);
			let next = 256;

			and removing "randomizer" and the "miiStudioData.writeUInt8(randomizer);" call
		*/
		const miiStudioData = Buffer.alloc(0x2F);
		const randomizer = Math.floor(256 * Math.random());
		let next = randomizer;
		let pos = 1;

		function encodeMiiPart(partValue) {
			const encoded = (7 + (partValue ^ next)) % 256;
			next = encoded;

			miiStudioData.writeUInt8(encoded, pos);
			pos++;
		}

		miiStudioData.writeUInt8(randomizer);

		if (this.facialHairColor === 0) {
			encodeMiiPart(8);
		} else {
			encodeMiiPart(this.facialHairColor);
		}

		encodeMiiPart(this.beardType);
		encodeMiiPart(this.build);
		encodeMiiPart(this.eyeVerticalStretch);
		encodeMiiPart(this.eyeColor + 8);
		encodeMiiPart(this.eyeRotation);
		encodeMiiPart(this.eyeScale);
		encodeMiiPart(this.eyeType);
		encodeMiiPart(this.eyeSpacing);
		encodeMiiPart(this.eyeYPosition);
		encodeMiiPart(this.eyebrowVerticalStretch);

		if (this.eyebrowColor === 0) {
			encodeMiiPart(8);
		} else {
			encodeMiiPart(this.eyebrowColor);
		}

		encodeMiiPart(this.eyebrowRotation);
		encodeMiiPart(this.eyebrowScale);
		encodeMiiPart(this.eyebrowType);
		encodeMiiPart(this.eyebrowSpacing);
		encodeMiiPart(this.eyebrowYPosition);
		encodeMiiPart(this.skinColor);
		encodeMiiPart(this.makeupType);
		encodeMiiPart(this.faceType);
		encodeMiiPart(this.wrinklesType);
		encodeMiiPart(this.favoriteColor);
		encodeMiiPart(this.gender);

		if (this.glassesColor == 0) {
			encodeMiiPart(8);
		} else if (this.glassesColor < 6) {
			encodeMiiPart(this.glassesColor + 13);
		} else {
			encodeMiiPart(0);
		}

		encodeMiiPart(this.glassesScale);
		encodeMiiPart(this.glassesType);
		encodeMiiPart(this.glassesYPosition);

		if (this.hairColor == 0) {
			encodeMiiPart(8);
		} else {
			encodeMiiPart(this.hairColor);
		}

		encodeMiiPart(this.flipHair ? 1 : 0);
		encodeMiiPart(this.hairType);
		encodeMiiPart(this.height);
		encodeMiiPart(this.moleScale);
		encodeMiiPart(this.moleEnabled);
		encodeMiiPart(this.moleXPosition);
		encodeMiiPart(this.moleYPosition);
		encodeMiiPart(this.mouthHorizontalStretch);

		if (this.mouthColor < 4) {
			encodeMiiPart(this.mouthColor + 19);
		} else {
			encodeMiiPart(0);
		}

		encodeMiiPart(this.mouthScale);
		encodeMiiPart(this.mouthType);
		encodeMiiPart(this.mouthYPosition);
		encodeMiiPart(this.mustacheScale);
		encodeMiiPart(this.mustacheType);
		encodeMiiPart(this.mustacheYPosition);
		encodeMiiPart(this.noseScale);
		encodeMiiPart(this.noseType);
		encodeMiiPart(this.noseYPosition);

		return miiStudioData;
	}

	studioUrl(queryParams = {}) {
		queryParams = {
			...STUDIO_RENDER_DEFAULTS,
			...queryParams,
			data: this.encodeStudio().toString('hex')
		};

		// TODO - Assert and error out instead of setting defaults?
		
		queryParams.type = STUDIO_RENDER_TYPES.includes(queryParams.type) ? queryParams.type : STUDIO_RENDER_DEFAULTS.type;
		queryParams.expression = STUDIO_RENDER_EXPRESSIONS.includes(queryParams.expression) ? queryParams.expression : STUDIO_RENDER_DEFAULTS.expression;
		queryParams.width = clamp(queryParams.width, 512);
		queryParams.bgColor = STUDIO_BG_COLOR_REGEX.test(queryParams.bgColor) ? queryParams.bgColor : STUDIO_RENDER_DEFAULTS.bgColor;
		queryParams.clothesColor = STUDIO_RENDER_CLOTHES_COLORS.includes(queryParams.clothesColor) ? queryParams.clothesColor : STUDIO_RENDER_DEFAULTS.clothesColor;
		queryParams.cameraXRotate = clamp(queryParams.cameraXRotate, 359);
		queryParams.cameraYRotate = clamp(queryParams.cameraYRotate, 359);
		queryParams.cameraZRotate = clamp(queryParams.cameraZRotate, 359);
		queryParams.characterXRotate = clamp(queryParams.characterXRotate, 359);
		queryParams.characterYRotate = clamp(queryParams.characterYRotate, 359);
		queryParams.characterZRotate = clamp(queryParams.characterZRotate, 359);
		queryParams.lightXDirection = clamp(queryParams.lightXDirection, 359);
		queryParams.lightYDirection = clamp(queryParams.lightYDirection, 359);
		queryParams.lightZDirection = clamp(queryParams.lightZDirection, 359);
		queryParams.lightDirectionMode = STUDIO_RENDER_LIGHT_DIRECTION_MODS.includes(queryParams.lightDirectionMode) ? queryParams.lightDirectionMode : STUDIO_RENDER_DEFAULTS.lightDirectionMode;
		queryParams.instanceCount = clamp(queryParams.instanceCount, 1, 16);
		queryParams.instanceRotationMode = STUDIO_RENDER_INSTANCE_ROTATION_MODES.includes(queryParams.instanceRotationMode) ? queryParams.instanceRotationMode : STUDIO_RENDER_DEFAULTS.instanceRotationMode;

		const query = new URLSearchParams(queryParams).toString();

		return `https://studio.mii.nintendo.com/miis/image.png?${query}`;
	}
}

module.exports = Mii;