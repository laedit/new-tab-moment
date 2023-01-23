# New tab Moment

[![Known Vulnerabilities](https://snyk.io/test/github/laedit/new-tab-moment/badge.svg)](https://snyk.io/test/github/laedit/new-tab-moment)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/laedit/new-tab-moment)](https://github.com/laedit/new-tab-moment/releases/latest)
[![Mozilla Add-on](https://img.shields.io/amo/v/new-tab-moment@laedit.net)](https://addons.mozilla.org/en-US/firefox/addon/new-tab-moment/)

Minimalist clock and weather on the new tab page, based on [Moment](https://github.com/alfredxing/moment) from [Alfred Xing](https://alfredxing.com/).

## Screenshots

### Light theme

![Light theme](./images/Light-theme.png)

### Light theme with icon

![Light theme - icon](./images/Light-theme-icon.png)

### Dark theme

![Dark theme](./images/Dark-theme.png)

### Dark theme with icon

![Dark theme - icon](./images/Dark-theme-icon.png)

### Custom CSS

![Custom css](./images/Custom-css.png)

### Options page

![Options](./images/Options.png)

## Contribute

All contributions are welcome :)

Require `yarn`.

### Install

Clone the repo and run `yarn install`.

## Build

run `yarn build`.

## Test

run `yarn test`.

By default it's Firefox Developer Edition which is used, you can change that in the `web-ext:run` scripts in `package.json`.

If necessary you can create a free account on [OpenWeatherMap](https://openweathermap.org/) and generate two api keys: one for current weather and the second for the geocoding and add them in the `secrets.ts`.

## Credits
Thanks to :
- [Alfred Xing](https://alfredxing.com/) for the original [Moment addon](https://github.com/alfredxing/moment)
- [OpenWeatherMap](https://openweathermap.org/) for the weather data
- [Dennis Tiensvold](https://thenounproject.com/dtiensvold/) for the [clock icon](https://thenounproject.com/term/clock/621519) from [the Noun Project](https://thenounproject.com)
- [Erik Flowers](http://www.helloerik.com/) for the [weather icons](https://erikflowers.github.io/weather-icons/)
