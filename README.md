# Mii JS
A JavaScript library used to interact with Mii data from the Wii U and 3DS

- [Mii JS](#mii-js)
	- [API](#api)
		- [new Mii(buffer);](#new-miibuffer)
			- [Usage](#usage)
		- [Updating `Mii` data](#updating-mii-data)
			- [Usage](#usage-1)
			- [Properties](#properties)
			- [Notes and special cases](#notes-and-special-cases)
			- [Clothes colors](#clothes-colors)
		- [mii.encode();](#miiencode)
			- [Usage](#usage-2)
		- [mii.encodeStudio();](#miiencodestudio)
			- [Usage](#usage-3)
		- [mii.studioUrl(renderOptions);](#miistudiourlrenderoptions)
			- [Usage](#usage-4)
		- [mii.studioAssetUrlBody();](#miistudioasseturlbody)
			- [Usage](#usage-5)
		- [mii.studioAssetUrlHead();](#miistudioasseturlhead)
			- [Usage](#usage-6)
		- [mii.studioAssetUrlFace();](#miistudioasseturlface)
			- [Usage](#usage-7)
		- [mii.studioAssetUrlEye();](#miistudioasseturleye)
			- [Usage](#usage-8)
		- [mii.studioAssetUrlEyebrow();](#miistudioasseturleyebrow)
			- [Usage](#usage-9)
		- [mii.studioAssetUrlNose();](#miistudioasseturlnose)
			- [Usage](#usage-10)
		- [mii.studioAssetUrlMouth();](#miistudioasseturlmouth)
			- [Usage](#usage-11)
		- [mii.studioAssetUrlHair();](#miistudioasseturlhair)
			- [Usage](#usage-12)
		- [mii.studioAssetUrlBeard();](#miistudioasseturlbeard)
			- [Usage](#usage-13)
		- [mii.studioAssetUrlMustache();](#miistudioasseturlmustache)
			- [Usage](#usage-14)
		- [mii.studioAssetUrlGlasses();](#miistudioasseturlglasses)
			- [Usage](#usage-15)
		- [mii.studioAssetUrlMole();](#miistudioasseturlmole)
			- [Usage](#usage-16)
		- [mii.decode();](#miidecode)
		- [mii.validate();](#miivalidate)
		- [mii.studioAssetUrl(assetPath);](#miistudioasseturlassetpath)
		- [mii.calculateCRC();](#miicalculatecrc)
	- [Render options](#render-options)
		- [type](#type)
		- [expression](#expression)
		- [width](#width)
		- [bgColor](#bgcolor)
		- [clothesColor](#clothescolor)
		- [cameraXRotate](#cameraxrotate)
		- [cameraYRotate](#camerayrotate)
		- [cameraZRotate](#camerazrotate)
		- [characterXRotate](#characterxrotate)
		- [characterYRotate](#characteryrotate)
		- [characterZRotate](#characterzrotate)
		- [lightXDirection](#lightxdirection)
		- [lightYDirection](#lightydirection)
		- [lightZDirection](#lightzdirection)
		- [lightDirectionMode](#lightdirectionmode)
		- [instanceCount](#instancecount)
		- [instanceRotationMode](#instancerotationmode)
	- [Examples](#examples)
		- [Error on invalid Mii data](#error-on-invalid-mii-data)
		- [Encode as Mii Studio Mii](#encode-as-mii-studio-mii)
		- [Get Mii Studio render URL (default)](#get-mii-studio-render-url-default)
		- [Get Mii Studio render URL (render options)](#get-mii-studio-render-url-render-options)


## API

### new Mii(buffer);
Instantiate a new Mii instance. Takes in a `Buffer` of Mii data

#### Usage
```js
const miiData = 'AwEAMLrDTIqIpLZhlH8Ps6TA4eK42QAAAFAOMHPgSQBtAG8AcgBhAHPgDzAAAGsrAgA5AQJoRBgm\r\nNEYUgRIWaA0AACmGAUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG7s';
const mii = new Mii(Buffer.from(miiData, 'base64'));
// ...
```

### Updating `Mii` data
All `Mii` data is stored as properties on the `Mii` class. To update a `Mii`'s data simply assign it a new value in the respective property.

#### Usage
```js
mii.height = 10;
mii.wrinklesType = 1;
// etc
```

#### Properties
| Name                     | Type    | Min | Max       | Description                                                                                                                                                                                                       |
| ------------------------ | ------- | --- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`                | Number  |     |           | 0 if Mii was made with the camera scan feature, otherwise 3                                                                                                                                                       |
| `allowCopying`           | Boolean |     |           | Should Mii be allowed to be copied by non-owners                                                                                                                                                                  |
| `profanityFlag`          | Boolean |     |           | Does the Mii name or creator name contain profanity. If true, Mii will render with nickname and creator name as "???"                                                                                             |
| `regionLock`             | Number  | 0   | 3         | QR code region lock ID. 0=region free, 1=JPN, 2=USA, 3=PAL/AUS                                                                                                                                                    |
| `characterSet`           | Number  | 0   | 3         | Character font region. 0=USA/PAL/AUS/JPN, 1=CHN, 2=KOR, 3=TWN                                                                                                                                                     |
| `pageIndex`              | Number  | 0   | 9         | Page number for 3DS Mii Maker                                                                                                                                                                                     |
| `slotIndex`              | Number  | 0   | 9         | Slot number for 3DS Mii Maker                                                                                                                                                                                     |
| `deviceOrigin`           | Number  | 1   | 4         | Device the Mii was creatd on. 1=Wii, 2=DS, 3=3DS, 4=WiiU/Switch                                                                                                                                                   |
| `systemId`               | Buffer  |     |           | Console-unique ID                                                                                                                                                                                                 |
| `normalMii`              | Boolean |     |           | Determines if a Mii is special (gold pants) or not. `true` means not special (Mii is "normal")                                                                                                                    |
| `dsMii`                  | Boolean |     |           | Mii was originally made on a DS/DSi system (`mii.deviceOrigin`=2)                                                                                                                                                 |
| `nonUserMii`             | Boolean |     |           | Mii was generated during run time and is only stored in memory (temporary Mii) or the Mii was made for the system/games by developers                                                                             |
| `isValid`                | Boolean |     |           | Denotes if a Mii is valid or not (setting this to `false` will flag the Mii as invalid in Mii Maker)                                                                                                              |
| `creationTime`           | Number  | 0   | 268435456 | Creation time in seconds since 01/01/2010 00:00:00, halved (multiply this number by 2 and add it to start date to get the real creation date). This number is stored as a 28 bit integer, hence the 268435456 max |
| `consoleMAC`             | Buffer  |     |           | Console MAC address                                                                                                                                                                                               |
| `gender`                 | Number  | 0   | 1         | 0=boy, 1=girl                                                                                                                                                                                                     |
| `birthMonth`             | Number  | 0   | 12        | Month the Mii was born on. 0 denotes no birthday set                                                                                                                                                              |
| `birthDay`               | Number  | 0   | 31        | Day of the month the Mii was born on. 0 denotes no birthday set                                                                                                                                                   |
| `favoriteColor`          | Number  | 0   | 11        | Determines shirt colors                                                                                                                                                                                           |
| `favorite`               | Boolean |     |           | Favorite Mii (red pants)                                                                                                                                                                                          |
| `miiName`                | String  |     |           | UTF16 Mii name. Up to 10 characters allowed                                                                                                                                                                       |
| `height`                 | Number  | 0   | 127       | Mii height                                                                                                                                                                                                        |
| `build`                  | Number  | 0   | 127       | Mii body build                                                                                                                                                                                                    |
| `disableSharing`         | Boolean |     |           | Mii has StreetPass sharing disabled                                                                                                                                                                               |
| `faceType`               | Number  | 0   | 11        | Shape of the head/face                                                                                                                                                                                            |
| `skinColor`              | Number  | 0   | 8         | Color of skin                                                                                                                                                                                                     |
| `wrinklesType`           | Number  | 0   | 11        | Type of wrinkles. 0 denotes no wrinkles                                                                                                                                                                           |
| `makeupType`             | Number  | 0   | 11        | Type of makeup. 0 denotes no makeup                                                                                                                                                                               |
| `hairType`               | Number  | 0   | 131       | Hair style. Values 34 and 57 are hats                                                                                                                                                                             |
| `hairColor`              | Number  | 0   | 7         | Color of hair                                                                                                                                                                                                     |
| `flipHair`               | Boolean |     |           | Should the hair be mirrored                                                                                                                                                                                       |
| `eyeType`                | Number  | 0   | 59        | Eye style                                                                                                                                                                                                         |
| `eyeColor`               | Number  | 0   | 5         | Color of eyes                                                                                                                                                                                                     |
| `eyeScale`               | Number  | 0   | 7         | How big the eyes are                                                                                                                                                                                              |
| `eyeVerticalStretch`     | Number  | 0   | 6         | How much the eyes are stretched in the Y direction                                                                                                                                                                |
| `eyeRotation`            | Number  | 0   | 7         | Eye rotation                                                                                                                                                                                                      |
| `eyeSpacing`             | Number  | 0   | 12        | Distance between the eyes                                                                                                                                                                                         |
| `eyeYPosition`           | Number  | 0   | 18        | Eyes Y position                                                                                                                                                                                                   |
| `eyebrowType`            | Number  | 0   | 24        | eyebrow style                                                                                                                                                                                                     |
| `eyebrowColor`           | Number  | 0   | 7         | Color of eyebrows                                                                                                                                                                                                 |
| `eyebrowScale`           | Number  | 0   | 8         | How big the eyebrows are                                                                                                                                                                                          |
| `eyebrowVerticalStretch` | Number  | 0   | 6         | How much the eyebrows are stretched in the Y direction                                                                                                                                                            |
| `eyebrowRotation`        | Number  | 0   | 11        | eyebrow rotation                                                                                                                                                                                                  |
| `eyebrowSpacing`         | Number  | 0   | 12        | Distance between the eyebrows                                                                                                                                                                                     |
| `eyebrowYPosition`       | Number  | 3   | 18        | eyebrows Y position                                                                                                                                                                                               |
| `noseType`               | Number  | 0   | 17        | Nose typw                                                                                                                                                                                                         |
| `noseScale`              | Number  | 0   | 8         | How big the nose is                                                                                                                                                                                               |
| `noseYPosition`          | Number  | 0   | 18        | Nose Y position                                                                                                                                                                                                   |
| `mouthType`              | Number  | 0   | 35        | Mouth/lip type                                                                                                                                                                                                    |
| `mouthColor`             | Number  | 0   | 4         | Color of lips                                                                                                                                                                                                     |
| `mouthScale`             | Number  | 0   | 8         | How big the mouth is                                                                                                                                                                                              |
| `mouthHorizontalStretch` | Number  | 0   | 6         | How much the mouth is stretched in the Y direction                                                                                                                                                                |
| `mouthYPosition`         | Number  | 0   | 18        | Mouth Y position                                                                                                                                                                                                  |
| `mustacheType`           | Number  | 0   | 5         | Mustache type. 0 denotes no mustache                                                                                                                                                                              |
| `beardType`              | Number  | 0   | 5         | Beard type. 0 denotes no beard                                                                                                                                                                                    |
| `facialHairColor`        | Number  | 0   | 7         | Color of the mustache and beard                                                                                                                                                                                   |
| `mustacheScale`          | Number  | 0   | 8         | How big the mustache is                                                                                                                                                                                           |
| `mustacheYPosition`      | Number  | 0   | 16        | Mustache Y position                                                                                                                                                                                               |
| `glassesType`            | Number  | 0   | 8         | Glasses type                                                                                                                                                                                                      |
| `glassesColor`           | Number  | 0   | 5         | Glasses frame/lens color                                                                                                                                                                                          |
| `glassesScale`           | Number  | 0   | 7         | How big the glasses are                                                                                                                                                                                           |
| `glassesYPosition`       | Number  | 0   | 20        | Glasses Y position                                                                                                                                                                                                |
| `moleEnabled`            | Boolean |     |           | Denotes if the mole shows                                                                                                                                                                                         |
| `moleScale`              | Number  | 0   | 8         | How big the mole is                                                                                                                                                                                               |
| `moleXPosition`          | Number  | 0   | 16        | Mole X position                                                                                                                                                                                                   |
| `moleYPosition`          | Number  | 0   | 30        | Mole Y position                                                                                                                                                                                                   |
| `creatorName`            | String  |     |           | UTF16 creator name. Up to 10 characters allowed                                                                                                                                                                   |

#### Notes and special cases
There are special cases where sometimes some data affects the validity of other data in the Mii. these cases will be noted here

- If `mii.normalMii` is set to `false` (Mii is special), then `mii.deviceOrigin` determines the minimum device type the Mii  QR code can be scanned on. For example, a Mii with `mii.normalMii` to to `false` and `mii.deviceOrigin` set to 3 can be scanned on a 3DS, WiiU and Switch. But if the `mii.deviceOrigin` is set to 4, the Mii cannot be scanned on a 3DS. Setting this value to 4 essentially locks the Mii to the WiiU though this is not intended usage
- If `mii.nonUserMii` is set to `true` then `mii.creationTime` _**must**_ be set to 0 and `mii.normalMii`, `mii.dsMii`, and `mii.isValid` _**must**_ all be set to `false`
- If `mii.normalMii` is set to `false` (Mii is special), then `mii.disableSharing` _**must**_ be set to true (all special Mii's have sharing disabled)
- According to HEYimHeroic if `mii.dsMii` is `true`, then `mii.isValid` _**must**_ be false. However in my testing, all Mii's created on the Wii U have both `mii.dsMii` and `mii.isValid` set to true. Therefore this check is not performed here, and this case is being looked into
- It appears that if a Mii has `mii.deviceOrigin` set to 1 (Wii), then `mii.isValid` is set to false. This has not been confirmed, however

#### Clothes colors

- 0 = red
- 1 = orange
- 2 = yellow
- 3 = light green
- 4 = dark green
- 5 = blue
- 6 = light blue
- 7 = pink
- 8 = purple
- 9 = brown
- 10 = white
- 11 = black


### mii.encode();
Encodes a `Mii`'s data as a Wii U/3DS format Mii. Returns a `Buffer`

#### Usage
```js
const encoded = mii.encode();
console.log(encoded.toString('base64'));
```

### mii.encodeStudio();
Encodes a `Mii`'s data as a Mii Studio format Mii. Returns a `Buffer`

#### Usage
```js
const encoded = mii.encodeStudio();
console.log(encoded.toString('hex'));
```

### mii.studioUrl(renderOptions);
Encodes a `Mii`'s data as a Mii Studio format Mii and returns it's render URL. See [Render options](#render-options) for more information

#### Usage
```js
const url = mii.studioUrl({
	width: 512,
	type: 'all_body'
});
console.log(url);
```

### mii.studioAssetUrlBody();
Returns the `Mii`'s individual body asset URL as used on Mii Studio

#### Usage
```js
console.log(mii.studioAssetUrlBody());
```

### mii.studioAssetUrlHead();
Returns the `Mii`'s individual head asset URL as used on Mii Studio

#### Usage
```js
console.log(mii.studioAssetUrlHead());
```

### mii.studioAssetUrlFace();
Alias of [mii.studioAssetUrlHead();](#miistudioasseturlhead)

#### Usage
```js
console.log(mii.studioAssetUrlFace());
```

### mii.studioAssetUrlEye();
Returns the `Mii`'s individual Eye asset URL as used on Mii Studio

#### Usage
```js
console.log(mii.studioAssetUrlEye());
```

### mii.studioAssetUrlEyebrow();
Returns the `Mii`'s individual Eyebrow asset URL as used on Mii Studio

#### Usage
```js
console.log(mii.studioAssetUrlEyebrow());
```

### mii.studioAssetUrlNose();
Returns the `Mii`'s individual Nose asset URL as used on Mii Studio

#### Usage
```js
console.log(mii.studioAssetUrlNose());
```

### mii.studioAssetUrlMouth();
Returns the `Mii`'s individual Mouth asset URL as used on Mii Studio

#### Usage
```js
console.log(mii.studioAssetUrlMouth());
```

### mii.studioAssetUrlHair();
Returns the `Mii`'s individual Hair asset URL as used on Mii Studio

#### Usage
```js
console.log(mii.studioAssetUrlHair());
```

### mii.studioAssetUrlBeard();
Returns the `Mii`'s individual Beard asset URL as used on Mii Studio

#### Usage
```js
console.log(mii.studioAssetUrlBeard());
```

### mii.studioAssetUrlMustache();
Returns the `Mii`'s individual Mustache asset URL as used on Mii Studio

#### Usage
```js
console.log(mii.studioAssetUrlMustache());
```

### mii.studioAssetUrlGlasses();
Returns the `Mii`'s individual Glasses asset URL as used on Mii Studio

#### Usage
```js
console.log(mii.studioAssetUrlGlasses());
```

### mii.studioAssetUrlMole();
Returns the `Mii`'s individual Mole asset URL as used on Mii Studio

#### Usage
```js
console.log(mii.studioAssetUrlMole());
```


### mii.decode();
Decodes a `Mii`'s data and populates it's fields. Used internally, does not need to be called manually

### mii.validate();
Validates a `Mii`'s data and throws an error if invalid data is found. Used internally, does not need to be called manually

### mii.studioAssetUrl(assetPath);
Calculates the Mii's individual asset URL based on the provided asset path. Used internally, does not need to be called manually

### mii.calculateCRC();
Calculates a `Mii`'s CRC checksum. Used internally, does not need to be called manually

## Render options
Mii Studio accepts various render options. These options are passed as an object to [mii.studioUrl(renderOptions)](#miistudiourlrenderoptions). If a value is not passed or is deemed invalid, the library will instead use a default value

### type
Render type

Default: `face`

| Value       | Description                               |
| ----------- | ----------------------------------------- |
| `face`      | Renders the head and shoulders of the Mii |
| `face_only` | Renders only the head of the Mii          |
| `all_body`  | Renders entire body of the Mii            |

### expression
Mii expression

Default: `normal`
| Value                   | Description                                                             |
| ----------------------- | ----------------------------------------------------------------------- |
| `normal`                | Do not change expression                                                |
| `smile`                 | Changes eyes to closed in a happy expression                            |
| `anger`                 | Changes eyes to a scowl and mouth to a frown                            |
| `sorrow`                | Changes eyes and eyebrows to a sad expressiona and mouth to small frown |
| `surprise`              | Changes eyes to wide eyed                                               |
| `blink`                 | Changes eyes to flat closed                                             |
| `normal_open_mouth`     | Same as `normal` but with an open mouth                                 |
| `smile_open_mouth`      | Same as `smile` but with an open mouth                                  |
| `anger_open_mouth`      | Same as `anger` but with an open mouth                                  |
| `surprise_open_mouth`   | Same as `surprise` but with an open mouth                               |
| `sorrow_open_mouth`     | Same as `sorrow` but with an open mouth                                 |
| `blink_open_mouth`      | Same as `blink` but with an open mouth                                  |
| `wink_left`             | Same as `normal` but with left eye changed to wink                      |
| `wink_right`            | Same as `normal` but with right eye changed to wink                     |
| `wink_left_open_mouth`  | Same as `normal_open_mouth` but with left eye changed to wink           |
| `wink_right_open_mouth` | Same as `normal_open_mouth` but with right eye changed to wink          |
| `like_wink_left`        | Seemingly the same as `wink_left`?                                      |
| `like_wink_right`       | Seemingly the same as `wink_right`?                                     |
| `frustrated`            | Changes both eyes to wink eyes and mouth to `sorrow` mouth              |

### width
Image width (height cannot be changed)

Default: `96`

| Min | Max |
| --- | --- |
| 0   | 512 |

### bgColor
Background color. Must be uppercase HEX encoded RGBA

Default: `FFFFFF00`

### clothesColor
Color of the Mii's clothes. Overrides the color in the Mii data

Default: `default`

| Value         | Description                          |
| ------------- | ------------------------------------ |
| `default`     | Do not change color                  |
| `red`         | Changes clothes color to red         |
| `orange`      | Changes clothes color to orange      |
| `yellow`      | Changes clothes color to yellow      |
| `yellowgreen` | Changes clothes color to light green |
| `green`       | Changes clothes color to dakr green  |
| `blue`        | Changes clothes color to dark blue   |
| `skyblue`     | Changes clothes color to light blue  |
| `pink`        | Changes clothes color to pink        |
| `purple`      | Changes clothes color to purple      |
| `brown`       | Changes clothes color to brown       |
| `white`       | Changes clothes color to white       |
| `black`       | Changes clothes color to black       |

### cameraXRotate
Rotate the camera in the X axis

Default: `0`

| Min | Max |
| --- | --- |
| 0   | 359 |

### cameraYRotate
Rotate the camera in the Y axis

Default: `0`

| Min | Max |
| --- | --- |
| 0   | 359 |

### cameraZRotate
Rotate the camera in the Z axis

Default: `0`

| Min | Max |
| --- | --- |
| 0   | 359 |

### characterXRotate
Rotate the character model in the X axis

Default: `0`

| Min | Max |
| --- | --- |
| 0   | 359 |

### characterYRotate
Rotate the character model in the Y axis

Default: `0`

| Min | Max |
| --- | --- |
| 0   | 359 |

### characterZRotate
Rotate the character model in the Z axis

Default: `0`

| Min | Max |
| --- | --- |
| 0   | 359 |

### lightXDirection
Rotate the light source position/direction in the X axis

Default: `0`

| Min | Max |
| --- | --- |
| 0   | 359 |

### lightYDirection
Rotate the light source position/direction in the Y axis

Default: `0`

| Min | Max |
| --- | --- |
| 0   | 359 |

### lightZDirection
Rotate the light source position/direction in the Z axis

Default: `0`

| Min | Max |
| --- | --- |
| 0   | 359 |

### lightDirectionMode
Changes the light direction mode

**When this is set to the default of none, the light direction parameters are not sent at all.**

Default: `none`

| Value    | Description     |
| -------- | --------------- |
| `none`   | Unknown change? |
| `zerox`  | Unknown change? |
| `flipx`  | Unknown change? |
| `camera` | Unknown change? |
| `offset` | Unknown change? |
| `set`    | Unknown change? |

### instanceCount
How many renders are returned.

After the first render the following renders are rotated depending on the number of instances from 0 degrees to 180 degrees

Default: `1`

| Min | Max |
| --- | --- |
| 1   | 16  |


### instanceRotationMode
Changes the rotation mode for each render following the first

Default: `model`

| Value    | Description                                 |
| -------- | ------------------------------------------- |
| `model`  | Sets rotation mode to rotate model          |
| `camera` | Sets rotation mode to rotate camera         |
| `both`   | Seen in the wild but causes a broken image? |

## Examples

### Error on invalid Mii data
```js
mii.hairColor = 9999;

const encoded = mii.encode(); // AssertionError [ERR_ASSERTION]: Invalid Mii hair color. Got 9999, expected 0-7
```

### Encode as Mii Studio Mii
```js
const encoded = mii.encodeStudio();

console.log(encoded).toString('base64');
```

### Get Mii Studio render URL (default)
```js
const studioUrl = mii.studioUrl();

console.log(studioUrl);
```

### Get Mii Studio render URL (render options)
```js
const studioUrl = mii.studioUrl({
	width: 512,
	bgColor: '131733FF'
});

console.log(studioUrl);
```
