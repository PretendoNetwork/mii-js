# Mii JS
A JavaScript library used to interact with Mii data from the Wii U and 3DS

- [Mii JS](#mii-js)
	- [Examples](#examples)
		- [Encode as Wii U/3DS Mii](#encode-as-wii-u3ds-mii)
		- [Error on invalid Mii data](#error-on-invalid-mii-data)
		- [Encode as Mii Studio Mii](#encode-as-mii-studio-mii)
		- [Get Mii Studio render URL (default)](#get-mii-studio-render-url-default)
		- [Get Mii Studio render URL (render options)](#get-mii-studio-render-url-render-options)
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

## Examples

### Encode as Wii U/3DS Mii
```js
const Mii = require('mii-js');

const miiData = 'AwEAMLrDTIqIpLZhlH8Ps6TA4eK42QAAAFAOMHPgSQBtAG8AcgBhAHPgDzAAAGsrAgA5AQJoRBgm\r\nNEYUgRIWaA0AACmGAUhQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG7s';
const mii = new Mii(Buffer.from(miiData, 'base64'));

const encoded = mii.encode();

console.log(encoded.toString('base64'));
```

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

## Render options
Mii Studio accepts various render options. These options are passed as an object to `mii.studioUrl()`. If a value is not passed or is deemed invalid, mii-js will instead use a default value

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

Default: `359`

| Min | Max |
| --- | --- |
| 0   | 359 |

### lightZDirection
Rotate the light source position/direction in the Z axis

Default: `359`

| Min | Max |
| --- | --- |
| 0   | 359 |

### lightDirectionMode
Changes the light direction mode

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