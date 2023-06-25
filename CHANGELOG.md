# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.12.1] - 2023-06-25

### Changed
- No need to click on the save options button anymore

### Fixed
- Options UI browser style deprecated in manifest v3; Option page can change slightly

## [0.11.1] - 2023-06-24

### Added

- Additional weather infos (pressure, humidity and wind)
- Option to display "feels like" temperature instead

### Changed

- Switch Units option from temperature only (celsius, fahrenheit) to system (metric, imperial)

### Fixed

- Cache missing language and unit

## [0.10.0] - 2023-03-23

### Added

- Options button and a setting to enable/disable it (#205)

## [0.9.7] - 2023-03-17

### Changed

- Upgrade dependencies: Typescript 4.9.5, web-ext 7.5.0, etc.
- Add images to ReadMe

### Fixed

- Options page width (#197)

## [0.8.0] - 2023-01-22

### Added

- Chromium support.

### Fixed

- Fix credits in options page.
- Fix OpenWeatherMap warnings on implicit geocoding.

## [0.7.0] - 2023-01-10

### Added

- Add background image url option

## 0.6.0 - 2023-01-08

### Added

- Color scheme by system, light, dark and custom (thanks Filip Mösner)
- Apply new settings on live (thanks Filip Mösner)
- Settings have a dark mode following the browser theme

## 0.5.6 - 2022-11-18

### Fixed

- Fix leading 0 added wrongly (thanks Alex Kulikov)

## 0.5.5 - 2022-11-12

### Fixed

- Fix weather translation (thanks Filip Mösner!)

## 0.5.4 - 2022-11-10

### Fixed

- Fix date for cultures for which month can vary based on his usage.

## 0.5.3 - 2021-04-15

### Added

- Add tips for custom css.

## 0.5.2 - 2020-02-06

### Fixed

- Better handling on weather and geolocation errors.

## 0.5.1 - 2020-01-26

### Added

- Add debug mode with more traces for geolocation and weather.

## 0.5.0 - 2018-08-08

### Added

- Homepage option.

[unreleased]: https://github.com/laedit/new-tab-moment/compare/0.12.1...HEAD
[0.11.1]: https://github.com/laedit/new-tab-moment/compare/0.11.1...0.12.1
[0.11.1]: https://github.com/laedit/new-tab-moment/compare/0.10.0...0.11.1
[0.10.0]: https://github.com/laedit/new-tab-moment/compare/0.9.7...0.10.0
[0.9.7]: https://github.com/laedit/new-tab-moment/compare/0.8.0...0.9.7
[0.8.0]: https://github.com/laedit/new-tab-moment/compare/0.7.0...0.8.0
[0.7.0]: https://github.com/laedit/new-tab-moment/releases/tag/0.7.0
[0.5.2]: https://github.com/laedit/new-tab-moment/releases/tag/0.5.2
