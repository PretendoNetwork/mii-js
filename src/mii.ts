import { Buffer } from 'buffer';
import md5 from 'crypto-js/md5.js';
import ExtendedBitStream from './extendedBitStream';
import Util from './util';

const STUDIO_RENDER_URL_BASE = 'https://studio.mii.nintendo.com/miis/image.png';
const STUDIO_ASSET_URL_BASE = 'https://mii-studio.akamaized.net/editor/1';
const STUDIO_ASSET_FILE_TYPE = 'webp';

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
	instanceRotationMode: 'model'
};

const STUDIO_RENDER_TYPES = [
	'face',
	'face_only',
	'all_body'
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
	'frustrated'
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
	'black'
];

const STUDIO_RENDER_LIGHT_DIRECTION_MODS = [
	'none',
	'zerox',
	'flipx',
	'camera',
	'offset',
	'set'
];

const STUDIO_RENDER_INSTANCE_ROTATION_MODES = [
	'model',
	'camera',
	'both'
];

const STUDIO_BG_COLOR_REGEX = /^[0-9A-F]{8}$/; // Mii Studio does not allow lowercase

export default class Mii {
	public bitStream: ExtendedBitStream;

	// Mii data
	// can be sure that these are all initialized in decode()

	public version!: number;
	public allowCopying!: boolean;
	public profanityFlag!: boolean;
	public regionLock!: number;
	public characterSet!: number;
	public pageIndex!: number;
	public slotIndex!: number;
	public unknown1!: number;
	public deviceOrigin!: number;
	public systemId!: Buffer;
	public normalMii!: boolean;
	public dsMii!: boolean;
	public nonUserMii!: boolean;
	public isValid!: boolean;
	public creationTime!: number;
	public consoleMAC!: Buffer;
	public gender!: number;
	public birthMonth!: number;
	public birthDay!: number;
	public favoriteColor!: number;
	public favorite!: boolean;
	public miiName!: string;
	public height!: number;
	public build!: number;
	public disableSharing!: boolean;
	public faceType!: number;
	public skinColor!: number;
	public wrinklesType!: number;
	public makeupType!: number;
	public hairType!: number;
	public hairColor!: number;
	public flipHair!: boolean;
	public eyeType!: number;
	public eyeColor!: number;
	public eyeScale!: number;
	public eyeVerticalStretch!: number;
	public eyeRotation!: number;
	public eyeSpacing!: number;
	public eyeYPosition!: number;
	public eyebrowType!: number;
	public eyebrowColor!: number;
	public eyebrowScale!: number;
	public eyebrowVerticalStretch!: number;
	public eyebrowRotation!: number;
	public eyebrowSpacing!: number;
	public eyebrowYPosition!: number;
	public noseType!: number;
	public noseScale!: number;
	public noseYPosition!: number;
	public mouthType!: number;
	public mouthColor!: number;
	public mouthScale!: number;
	public mouthHorizontalStretch!: number;
	public mouthYPosition!: number;
	public mustacheType!: number;
	public unknown2!: number;
	public beardType!: number;
	public facialHairColor!: number;
	public mustacheScale!: number;
	public mustacheYPosition!: number;
	public glassesType!: number;
	public glassesColor!: number;
	public glassesScale!: number;
	public glassesYPosition!: number;
	public moleEnabled!: boolean;
	public moleScale!: number;
	public moleXPosition!: number;
	public moleYPosition!: number;
	public creatorName!: string;
	public checksum!: number;

	constructor(buffer: Buffer) {
		this.bitStream = new ExtendedBitStream(buffer);
		this.decode();
	}

	public validate(): void {
		// Size check
		Util.assert(this.bitStream.length / 8 === 0x60, `Invalid Mii data size. Got ${this.bitStream.length / 8}, expected 96`);

		// Value range and type checks
		Util.assert(this.version === 0 || this.version === 3, `Invalid Mii version. Got ${this.version}, expected 0 or 3`);
		Util.assert(typeof this.allowCopying === 'boolean', `Invalid Mii allow copying. Got ${this.allowCopying}, expected true or false`);
		Util.assert(typeof this.profanityFlag === 'boolean', `Invalid Mii profanity flag. Got ${this.profanityFlag}, expected true or false`);
		Util.assert(Util.inRange(this.regionLock, Util.range(4)), `Invalid Mii region lock. Got ${this.regionLock}, expected 0-3`);
		Util.assert(Util.inRange(this.characterSet, Util.range(4)), `Invalid Mii region lock. Got ${this.characterSet}, expected 0-3`);
		Util.assert(Util.inRange(this.pageIndex, Util.range(10)), `Invalid Mii page index. Got ${this.pageIndex}, expected 0-9`);
		Util.assert(Util.inRange(this.slotIndex, Util.range(10)), `Invalid Mii slot index. Got ${this.slotIndex}, expected 0-9`);
		Util.assert(this.unknown1 === 0, `Invalid Mii unknown1. Got ${this.unknown1}, expected 0`);
		Util.assert(Util.inRange(this.deviceOrigin, Util.range(1, 5)), `Invalid Mii device origin. Got ${this.deviceOrigin}, expected 1-4`);
		Util.assert(this.systemId.length === 8, `Invalid Mii system ID size. Got ${this.systemId.length}, system IDs must be 8 bytes long`);
		Util.assert(typeof this.normalMii === 'boolean', `Invalid normal Mii flag. Got ${this.normalMii}, expected true or false`);
		Util.assert(typeof this.dsMii === 'boolean', `Invalid DS Mii flag. Got ${this.dsMii}, expected true or false`);
		Util.assert(typeof this.nonUserMii === 'boolean', `Invalid non-user Mii flag. Got ${this.nonUserMii}, expected true or false`);
		Util.assert(typeof this.isValid === 'boolean', `Invalid Mii valid flag. Got ${this.isValid}, expected true or false`);
		Util.assert(this.creationTime < 268435456, `Invalid Mii creation time. Got ${this.creationTime}, max value for 28 bit integer is 268,435,456`);
		Util.assert(this.consoleMAC.length === 6, `Invalid Mii console MAC address size. Got ${this.consoleMAC.length}, console MAC addresses must be 6 bytes long`);
		Util.assert(Util.inRange(this.gender, Util.range(2)), `Invalid Mii gender. Got ${this.gender}, expected 0 or 1`);
		Util.assert(Util.inRange(this.birthMonth, Util.range(13)), `Invalid Mii birth month. Got ${this.birthMonth}, expected 0-12`);
		Util.assert(Util.inRange(this.birthDay, Util.range(32)), `Invalid Mii birth day. Got ${this.birthDay}, expected 0-31`);
		Util.assert(Util.inRange(this.favoriteColor, Util.range(12)), `Invalid Mii favorite color. Got ${this.favoriteColor}, expected 0-11`);
		Util.assert(typeof this.favorite === 'boolean', `Invalid favorite Mii flag. Got ${this.favorite}, expected true or false`);
		Util.assert(Buffer.from(this.miiName, 'utf16le').length <= 0x14, `Invalid Mii name. Got ${this.miiName}, name may only be up to 10 characters`);
		Util.assert(Util.inRange(this.height, Util.range(128)), `Invalid Mii height. Got ${this.height}, expected 0-127`);
		Util.assert(Util.inRange(this.build, Util.range(128)), `Invalid Mii build. Got ${this.build}, expected 0-127`);
		Util.assert(typeof this.disableSharing === 'boolean', `Invalid disable sharing Mii flag. Got ${this.disableSharing}, expected true or false`);
		Util.assert(Util.inRange(this.faceType, Util.range(12)), `Invalid Mii face type. Got ${this.faceType}, expected 0-11`);
		Util.assert(Util.inRange(this.skinColor, Util.range(7)), `Invalid Mii skin color. Got ${this.skinColor}, expected 0-6`);
		Util.assert(Util.inRange(this.wrinklesType, Util.range(12)), `Invalid Mii wrinkles type. Got ${this.wrinklesType}, expected 0-11`);
		Util.assert(Util.inRange(this.makeupType, Util.range(12)), `Invalid Mii makeup type. Got ${this.makeupType}, expected 0-11`);
		Util.assert(Util.inRange(this.hairType, Util.range(132)), `Invalid Mii hair type. Got ${this.hairType}, expected 0-131`);
		Util.assert(Util.inRange(this.hairColor, Util.range(8)), `Invalid Mii hair color. Got ${this.hairColor}, expected 0-7`);
		Util.assert(typeof this.flipHair === 'boolean', `Invalid flip hair flag. Got ${this.flipHair}, expected true or false`);
		Util.assert(Util.inRange(this.eyeType, Util.range(60)), `Invalid Mii eye type. Got ${this.eyeType}, expected 0-59`);
		Util.assert(Util.inRange(this.eyeColor, Util.range(6)), `Invalid Mii eye color. Got ${this.eyeColor}, expected 0-5`);
		Util.assert(Util.inRange(this.eyeScale, Util.range(8)), `Invalid Mii eye scale. Got ${this.eyeScale}, expected 0-7`);
		Util.assert(Util.inRange(this.eyeVerticalStretch, Util.range(7)), `Invalid Mii eye vertical stretch. Got ${this.eyeVerticalStretch}, expected 0-6`);
		Util.assert(Util.inRange(this.eyeRotation, Util.range(8)), `Invalid Mii eye rotation. Got ${this.eyeRotation}, expected 0-7`);
		Util.assert(Util.inRange(this.eyeSpacing, Util.range(13)), `Invalid Mii eye spacing. Got ${this.eyeSpacing}, expected 0-12`);
		Util.assert(Util.inRange(this.eyeYPosition, Util.range(19)), `Invalid Mii eye Y position. Got ${this.eyeYPosition}, expected 0-18`);
		Util.assert(Util.inRange(this.eyebrowType, Util.range(25)), `Invalid Mii eyebrow type. Got ${this.eyebrowType}, expected 0-24`);
		Util.assert(Util.inRange(this.eyebrowColor, Util.range(8)), `Invalid Mii eyebrow color. Got ${this.eyebrowColor}, expected 0-7`);
		Util.assert(Util.inRange(this.eyebrowScale, Util.range(9)), `Invalid Mii eyebrow scale. Got ${this.eyebrowScale}, expected 0-8`);
		Util.assert(Util.inRange(this.eyebrowVerticalStretch, Util.range(7)), `Invalid Mii eyebrow vertical stretch. Got ${this.eyebrowVerticalStretch}, expected 0-6`);
		Util.assert(Util.inRange(this.eyebrowRotation, Util.range(12)), `Invalid Mii eyebrow rotation. Got ${this.eyebrowRotation}, expected 0-11`);
		Util.assert(Util.inRange(this.eyebrowSpacing, Util.range(13)), `Invalid Mii eyebrow spacing. Got ${this.eyebrowSpacing}, expected 0-12`);
		Util.assert(Util.inRange(this.eyebrowYPosition, Util.range(3, 19)), `Invalid Mii eyebrow Y position. Got ${this.eyebrowYPosition}, expected 3-18`);
		Util.assert(Util.inRange(this.noseType, Util.range(18)), `Invalid Mii nose type. Got ${this.noseType}, expected 0-17`);
		Util.assert(Util.inRange(this.noseScale, Util.range(9)), `Invalid Mii nose scale. Got ${this.noseScale}, expected 0-8`);
		Util.assert(Util.inRange(this.noseYPosition, Util.range(19)), `Invalid Mii nose Y position. Got ${this.noseYPosition}, expected 0-18`);
		Util.assert(Util.inRange(this.mouthType, Util.range(36)), `Invalid Mii mouth type. Got ${this.mouthType}, expected 0-35`);
		Util.assert(Util.inRange(this.mouthColor, Util.range(5)), `Invalid Mii mouth color. Got ${this.mouthColor}, expected 0-4`);
		Util.assert(Util.inRange(this.mouthScale, Util.range(9)), `Invalid Mii mouth scale. Got ${this.mouthScale}, expected 0-8`);
		Util.assert(Util.inRange(this.mouthHorizontalStretch, Util.range(7)), `Invalid Mii mouth stretch. Got ${this.mouthHorizontalStretch}, expected 0-6`);
		Util.assert(Util.inRange(this.mouthYPosition, Util.range(19)), `Invalid Mii mouth Y position. Got ${this.mouthYPosition}, expected 0-18`);
		Util.assert(Util.inRange(this.mustacheType, Util.range(6)), `Invalid Mii mustache type. Got ${this.mustacheType}, expected 0-5`);
		Util.assert(Util.inRange(this.beardType, Util.range(6)), `Invalid Mii beard type. Got ${this.beardType}, expected 0-5`);
		Util.assert(Util.inRange(this.facialHairColor, Util.range(8)), `Invalid Mii beard type. Got ${this.facialHairColor}, expected 0-7`);
		Util.assert(Util.inRange(this.mustacheScale, Util.range(9)), `Invalid Mii mustache scale. Got ${this.mustacheScale}, expected 0-8`);
		Util.assert(Util.inRange(this.mustacheYPosition, Util.range(17)), `Invalid Mii mustache Y position. Got ${this.mustacheYPosition}, expected 0-16`);
		Util.assert(Util.inRange(this.glassesType, Util.range(9)), `Invalid Mii glassess type. Got ${this.glassesType}, expected 0-8`);
		Util.assert(Util.inRange(this.glassesColor, Util.range(6)), `Invalid Mii glassess type. Got ${this.glassesColor}, expected 0-5`);
		Util.assert(Util.inRange(this.glassesScale, Util.range(8)), `Invalid Mii glassess type. Got ${this.glassesScale}, expected 0-7`);
		Util.assert(Util.inRange(this.glassesYPosition, Util.range(21)), `Invalid Mii glassess Y position. Got ${this.glassesYPosition}, expected 0-20`);
		Util.assert(typeof this.moleEnabled === 'boolean', `Invalid mole enabled flag. Got ${this.moleEnabled}, expected true or false`);
		Util.assert(Util.inRange(this.moleScale, Util.range(9)), `Invalid Mii mole scale. Got ${this.moleScale}, expected 0-8`);
		Util.assert(Util.inRange(this.moleXPosition, Util.range(17)), `Invalid Mii mole X position. Got ${this.moleXPosition}, expected 0-16`);
		Util.assert(Util.inRange(this.moleYPosition, Util.range(31)), `Invalid Mii mole Y position. Got ${this.moleYPosition}, expected 0-30`);

		// Sanity checks
		/*

        HEYimHeroic says this check must be true,
        but in my testing my Mii's have both these flags
        set and are valid

        Commenting out until we get more info

        if (this.dsMii && this.isValid) {
            Util.assert(false, 'If DS Mii flag is true, the is valid flag must be false');
        }
        */

		if (this.nonUserMii && (this.creationTime !== 0 || this.isValid || this.dsMii || this.normalMii)) {
			Util.assert(false, 'Non-user Mii\'s must have all other Mii ID bits set to 0');
		}

		if (!this.normalMii && !this.disableSharing) {
			Util.assert(false, 'Special Miis must have sharing disabled');
		}
	}

	public decode(): void {
		this.version = this.bitStream.readUint8();
		this.allowCopying = this.bitStream.readBoolean();
		this.profanityFlag = this.bitStream.readBoolean();
		this.regionLock = this.bitStream.readBits(2);
		this.characterSet = this.bitStream.readBits(2);
		this.bitStream.alignByte();
		this.pageIndex = this.bitStream.readBits(4);
		this.slotIndex = this.bitStream.readBits(4);
		this.unknown1 = this.bitStream.readBits(4);
		this.deviceOrigin = this.bitStream.readBits(3);
		this.bitStream.alignByte();
		this.systemId = this.bitStream.readBuffer(8);
		this.bitStream.swapEndian(); // * Mii ID data is BE
		this.normalMii = this.bitStream.readBoolean();
		this.dsMii = this.bitStream.readBoolean();
		this.nonUserMii = this.bitStream.readBoolean();
		this.isValid = this.bitStream.readBoolean();
		this.creationTime = this.bitStream.readBits(28);
		this.bitStream.swapEndian(); // * Swap back to LE
		this.consoleMAC = this.bitStream.readBuffer(6);
		this.bitStream.skipInt16(); // * 0x0000 padding
		this.gender = this.bitStream.readBit();
		this.birthMonth = this.bitStream.readBits(4);
		this.birthDay = this.bitStream.readBits(5);
		this.favoriteColor = this.bitStream.readBits(4);
		this.favorite = this.bitStream.readBoolean();
		this.bitStream.alignByte();
		this.miiName = this.bitStream.readUTF16String(0x14);
		this.height = this.bitStream.readUint8();
		this.build = this.bitStream.readUint8();
		this.disableSharing = this.bitStream.readBoolean();
		this.faceType = this.bitStream.readBits(4);
		this.skinColor = this.bitStream.readBits(3);
		this.wrinklesType = this.bitStream.readBits(4);
		this.makeupType = this.bitStream.readBits(4);
		this.hairType = this.bitStream.readUint8();
		this.hairColor = this.bitStream.readBits(3);
		this.flipHair = this.bitStream.readBoolean();
		this.bitStream.alignByte();
		this.eyeType = this.bitStream.readBits(6);
		this.eyeColor = this.bitStream.readBits(3);
		this.eyeScale = this.bitStream.readBits(4);
		this.eyeVerticalStretch = this.bitStream.readBits(3);
		this.eyeRotation = this.bitStream.readBits(5);
		this.eyeSpacing = this.bitStream.readBits(4);
		this.eyeYPosition = this.bitStream.readBits(5);
		this.bitStream.alignByte();
		this.eyebrowType = this.bitStream.readBits(5);
		this.eyebrowColor = this.bitStream.readBits(3);
		this.eyebrowScale = this.bitStream.readBits(4);
		this.eyebrowVerticalStretch = this.bitStream.readBits(3);
		this.bitStream.skipBit();
		this.eyebrowRotation = this.bitStream.readBits(4);
		this.bitStream.skipBit();
		this.eyebrowSpacing = this.bitStream.readBits(4);
		this.eyebrowYPosition = this.bitStream.readBits(5);
		this.bitStream.alignByte();
		this.noseType = this.bitStream.readBits(5);
		this.noseScale = this.bitStream.readBits(4);
		this.noseYPosition = this.bitStream.readBits(5);
		this.bitStream.alignByte();
		this.mouthType = this.bitStream.readBits(6);
		this.mouthColor = this.bitStream.readBits(3);
		this.mouthScale = this.bitStream.readBits(4);
		this.mouthHorizontalStretch = this.bitStream.readBits(3);
		this.mouthYPosition = this.bitStream.readBits(5);
		this.mustacheType = this.bitStream.readBits(3);
		this.unknown2 = this.bitStream.readUint8();
		this.beardType = this.bitStream.readBits(3);
		this.facialHairColor = this.bitStream.readBits(3);
		this.mustacheScale = this.bitStream.readBits(4);
		this.mustacheYPosition = this.bitStream.readBits(5);
		this.bitStream.alignByte();
		this.glassesType = this.bitStream.readBits(4);
		this.glassesColor = this.bitStream.readBits(3);
		this.glassesScale = this.bitStream.readBits(4);
		this.glassesYPosition = this.bitStream.readBits(5);
		this.moleEnabled = this.bitStream.readBoolean();
		this.moleScale = this.bitStream.readBits(4);
		this.moleXPosition = this.bitStream.readBits(5);
		this.moleYPosition = this.bitStream.readBits(5);
		this.bitStream.alignByte();
		this.creatorName = this.bitStream.readUTF16String(0x14);
		this.bitStream.skipInt16(); // * 0x0000 padding
		this.bitStream.swapEndian(); // * Swap to big endian because thats how checksum is calculated here
		this.checksum = this.bitStream.readUint16();
		this.bitStream.swapEndian(); // * Swap back to little endian

		this.validate();

		if (this.checksum !== this.calculateCRC()) {
			throw new Error('Invalid Mii checksum');
		}
	}

	public encode(): Buffer {
		this.validate(); // * Don't write invalid Mii data

		// TODO - Maybe create a new stream instead of modifying the original?
		this.bitStream.bitSeek(0);

		this.bitStream.writeUint8(this.version);
		this.bitStream.writeBoolean(this.allowCopying);
		this.bitStream.writeBoolean(this.profanityFlag);
		this.bitStream.writeBits(this.regionLock, 2);
		this.bitStream.writeBits(this.characterSet, 2);
		this.bitStream.alignByte();
		this.bitStream.writeBits(this.pageIndex, 4);
		this.bitStream.writeBits(this.slotIndex, 4);
		this.bitStream.writeBits(this.unknown1, 4);
		this.bitStream.writeBits(this.deviceOrigin, 3);
		this.bitStream.alignByte();
		this.bitStream.writeBuffer(this.systemId);
		this.bitStream.swapEndian(); // * Mii ID data is BE
		this.bitStream.writeBoolean(this.normalMii);
		this.bitStream.writeBoolean(this.dsMii);
		this.bitStream.writeBoolean(this.nonUserMii);
		this.bitStream.writeBoolean(this.isValid);
		this.bitStream.writeBits(this.creationTime, 28); // TODO - Calculate this instead of carrying it over
		this.bitStream.swapEndian(); // * Swap back to LE
		this.bitStream.writeBuffer(this.consoleMAC);
		this.bitStream.writeUint16(0x0); // * 0x0000 padding
		this.bitStream.writeBit(this.gender);
		this.bitStream.writeBits(this.birthMonth, 4);
		this.bitStream.writeBits(this.birthDay, 5);
		this.bitStream.writeBits(this.favoriteColor, 4);
		this.bitStream.writeBoolean(this.favorite);
		this.bitStream.alignByte();
		this.bitStream.writeUTF16String(this.miiName);
		this.bitStream.writeUint8(this.height);
		this.bitStream.writeUint8(this.build);
		this.bitStream.writeBoolean(this.disableSharing);
		this.bitStream.writeBits(this.faceType, 4);
		this.bitStream.writeBits(this.skinColor, 3);
		this.bitStream.writeBits(this.wrinklesType, 4);
		this.bitStream.writeBits(this.makeupType, 4);
		this.bitStream.writeUint8(this.hairType);
		this.bitStream.writeBits(this.hairColor, 3);
		this.bitStream.writeBoolean(this.flipHair);
		this.bitStream.alignByte();
		this.bitStream.writeBits(this.eyeType, 6);
		this.bitStream.writeBits(this.eyeColor, 3);
		this.bitStream.writeBits(this.eyeScale, 4);
		this.bitStream.writeBits(this.eyeVerticalStretch, 3);
		this.bitStream.writeBits(this.eyeRotation, 5);
		this.bitStream.writeBits(this.eyeSpacing, 4);
		this.bitStream.writeBits(this.eyeYPosition, 5);
		this.bitStream.alignByte();
		this.bitStream.writeBits(this.eyebrowType, 5);
		this.bitStream.writeBits(this.eyebrowColor, 3);
		this.bitStream.writeBits(this.eyebrowScale, 4);
		this.bitStream.writeBits(this.eyebrowVerticalStretch, 3);
		this.bitStream.skipBit();
		this.bitStream.writeBits(this.eyebrowRotation, 4);
		this.bitStream.skipBit();
		this.bitStream.writeBits(this.eyebrowSpacing, 4);
		this.bitStream.writeBits(this.eyebrowYPosition, 5);
		this.bitStream.alignByte();
		this.bitStream.writeBits(this.noseType, 5);
		this.bitStream.writeBits(this.noseScale, 4);
		this.bitStream.writeBits(this.noseYPosition, 5);
		this.bitStream.alignByte();
		this.bitStream.writeBits(this.mouthType, 6);
		this.bitStream.writeBits(this.mouthColor, 3);
		this.bitStream.writeBits(this.mouthScale, 4);
		this.bitStream.writeBits(this.mouthHorizontalStretch, 3);
		this.bitStream.writeBits(this.mouthYPosition, 5);
		this.bitStream.writeBits(this.mustacheType, 3);
		this.bitStream.writeUint8(this.unknown2);
		this.bitStream.writeBits(this.beardType, 3);
		this.bitStream.writeBits(this.facialHairColor, 3);
		this.bitStream.writeBits(this.mustacheScale, 4);
		this.bitStream.writeBits(this.mustacheYPosition, 5);
		this.bitStream.alignByte();
		this.bitStream.writeBits(this.glassesType, 4);
		this.bitStream.writeBits(this.glassesColor, 3);
		this.bitStream.writeBits(this.glassesScale, 4);
		this.bitStream.writeBits(this.glassesYPosition, 5);
		this.bitStream.writeBoolean(this.moleEnabled);
		this.bitStream.writeBits(this.moleScale, 4);
		this.bitStream.writeBits(this.moleXPosition, 5);
		this.bitStream.writeBits(this.moleYPosition, 5);
		this.bitStream.alignByte();
		this.bitStream.writeUTF16String(this.creatorName);
		this.bitStream.writeUint16(0x0); // * 0x0000 padding
		this.bitStream.swapEndian();// * Swap to big endian because thats how checksum is calculated here
		this.bitStream.writeUint16(this.calculateCRC());
		this.bitStream.swapEndian();// * Swap back to little endian

		// @ts-expect-error _view is private
		return Buffer.from(this.bitStream.view._view);
	}

	public calculateCRC(): number {
		const view = this.bitStream.view;

		// @ts-expect-error _view is private
		const data = view._view.subarray(0, 0x5e);

		let crc = 0x0000;

		for (const byte of data) {
			for (let bit = 7; bit >= 0; bit--) {
				const flag = (crc & 0x8000) != 0;
				crc = ((crc << 1) | ((byte >> bit) & 0x1)) ^ (flag ? 0x1021 : 0);
			}
		}

		for (let i = 16; i > 0; i--) {
			const flag = (crc & 0x8000) != 0;
			crc = (crc << 1) ^ (flag ? 0x1021 : 0);
		}

		return crc & 0xffff;
	}

	public encodeStudio(): Buffer {
		this.validate();

		/*
                Can also disable randomization with:

                let miiStudioData = Buffer.alloc(0x2F);
                let next = 256;

                and removing "randomizer" and the "miiStudioData.writeUInt8(randomizer);" call
            */
		const miiStudioData = Buffer.alloc(0x2f);
		const randomizer = Math.floor(256 * Math.random());
		let next = randomizer;
		let pos = 1;

		function encodeMiiPart(partValue: number): void {
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
		encodeMiiPart(this.moleEnabled ? 1 : 0);
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

	public studioUrl(queryParams: {
		type?: string;
		expression?: string;
		width?: number;
		bgColor?: string;
		clothesColor?: string;
		cameraXRotate?: number;
		cameraYRotate?: number;
		cameraZRotate?: number;
		characterXRotate?: number;
		characterYRotate?: number;
		characterZRotate?: number;
		lightXDirection?: number;
		lightYDirection?: number;
		lightZDirection?: number;
		lightDirectionMode?: string;
		instanceCount?: number;
		instanceRotationMode?: string;
		data?: string;
	} = STUDIO_RENDER_DEFAULTS): string {
		const params = {
			...STUDIO_RENDER_DEFAULTS,
			...queryParams,
			data: this.encodeStudio().toString('hex')
		};

		// TODO - Assert and error out instead of setting defaults?

		params.type = STUDIO_RENDER_TYPES.includes(params.type as string)
			? params.type
			: STUDIO_RENDER_DEFAULTS.type;
		params.expression = STUDIO_RENDER_EXPRESSIONS.includes(params.expression as string)
			? params.expression
			: STUDIO_RENDER_DEFAULTS.expression;
		params.width = Util.clamp(params.width, 512);
		params.bgColor = STUDIO_BG_COLOR_REGEX.test(params.bgColor as string)
			? params.bgColor
			: STUDIO_RENDER_DEFAULTS.bgColor;
		params.clothesColor = STUDIO_RENDER_CLOTHES_COLORS.includes(params.clothesColor)
			? params.clothesColor
			: STUDIO_RENDER_DEFAULTS.clothesColor;
		params.cameraXRotate = Util.clamp(params.cameraXRotate, 359);
		params.cameraYRotate = Util.clamp(params.cameraYRotate, 359);
		params.cameraZRotate = Util.clamp(params.cameraZRotate, 359);
		params.characterXRotate = Util.clamp(params.characterXRotate, 359);
		params.characterYRotate = Util.clamp(params.characterYRotate, 359);
		params.characterZRotate = Util.clamp(params.characterZRotate, 359);
		params.lightXDirection = Util.clamp(params.lightXDirection, 359);
		params.lightYDirection = Util.clamp(params.lightYDirection, 359);
		params.lightZDirection = Util.clamp(params.lightZDirection, 359);
		params.lightDirectionMode = STUDIO_RENDER_LIGHT_DIRECTION_MODS.includes(
			params.lightDirectionMode
		)
			? params.lightDirectionMode
			: STUDIO_RENDER_DEFAULTS.lightDirectionMode;
		params.instanceCount = Util.clamp(params.instanceCount, 1, 16);
		params.instanceRotationMode = STUDIO_RENDER_INSTANCE_ROTATION_MODES.includes(
			params.instanceRotationMode
		)
			? params.instanceRotationMode
			: STUDIO_RENDER_DEFAULTS.instanceRotationMode;

		// converts non-string params to strings
		const query = new URLSearchParams(Object.fromEntries(Object.entries(params).map(([key, value]) => [key, value.toString()])));

		if (params.lightDirectionMode === 'none') {
			query.delete('lightDirectionMode');
			query.delete('lightXDirection');
			query.delete('lightYDirection');
			query.delete('lightZDirection');
		}

		return `${STUDIO_RENDER_URL_BASE}?${query.toString()}`;
	}

	public studioAssetUrlBody(): string {
		return this.studioAssetUrl(`body/${this.gender}/${this.favoriteColor}`);
	}

	public studioAssetUrlHead(): string {
		return this.studioAssetUrl(
			`face/${this.faceType}/${this.wrinklesType}/${this.makeupType}/${this.skinColor}`
		);
	}

	public studioAssetUrlFace(): string {
		// Alias
		return this.studioAssetUrlHead();
	}

	public studioAssetUrlEye(): string {
		return this.studioAssetUrl(`eye/${this.eyeType}/${this.eyeColor + 8}`);
	}

	public studioAssetUrlEyebrow(): string {
		let eyebrowColor = this.eyebrowColor;

		if (this.eyebrowColor === 0) {
			eyebrowColor = 8;
		}

		return this.studioAssetUrl(`eyebrow/${this.eyebrowType}/${eyebrowColor}`);
	}

	public studioAssetUrlNose(): string {
		return this.studioAssetUrl(`nose/${this.noseType}/${this.skinColor}`);
	}

	public studioAssetUrlMouth(): string {
		let mouthColor = 0;

		if (this.mouthColor < 4) {
			mouthColor = this.mouthColor + 19;
		}

		return this.studioAssetUrl(`mouth/${this.mouthType}/${mouthColor}`);
	}

	public studioAssetUrlHair(): string {
		let assetPath;
		let hairColor = this.hairColor;

		if (this.hairColor == 0) {
			hairColor = 8;
		}

		if (this.hairType === 34 || this.hairType === 57) {
			// Types 34 and 57 are hats
			// No flip and they use clothes color not hair color
			assetPath = `hair/${this.hairType}/${this.faceType}/${this.favoriteColor}`;
		} else {
			// Regular hair types
			assetPath = `${this.flipHair ? 'hairflip' : 'hair'}/${this.hairType}/${this.faceType}/${hairColor}`;
		}

		return this.studioAssetUrl(assetPath);
	}

	public studioAssetUrlBeard(): string {
		let facialHairColor = this.facialHairColor;

		if (this.facialHairColor === 0) {
			facialHairColor = 8;
		}

		return this.studioAssetUrl(`beard/${this.beardType}/${this.faceType}/${facialHairColor}`);
	}

	public studioAssetUrlMustache(): string {
		let facialHairColor = this.facialHairColor;

		if (this.facialHairColor === 0) {
			facialHairColor = 8;
		}

		return this.studioAssetUrl(`mustache/${this.mustacheType}/${facialHairColor}`);
	}

	public studioAssetUrlGlasses(): string {
		let glassesColor = 0;

		if (this.glassesColor == 0) {
			glassesColor = 8;
		} else if (this.glassesColor < 6) {
			glassesColor = this.glassesColor + 13;
		}

		return this.studioAssetUrl(`glass/${this.glassesType}/${glassesColor}`);
	}

	public studioAssetUrlMole(): string {
		return this.studioAssetUrl(`mole/${this.moleEnabled ? 1 : 0}`);
	}

	public studioAssetUrl(assetPath: string): string {
		this.validate();

		const assetPathHash = md5(assetPath).toString();
		const char0 = assetPathHash[0];
		const char1 = assetPathHash[1];
		const char2 = assetPathHash[2];
		const fileName = assetPathHash.substring(3, 12);

		return `${STUDIO_ASSET_URL_BASE}/${STUDIO_ASSET_FILE_TYPE}/1024/${char0}/${char1}/${char2}/${fileName}.${STUDIO_ASSET_FILE_TYPE}`;
	}
}
