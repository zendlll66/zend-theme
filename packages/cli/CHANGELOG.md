# Changelog

## 0.1.0
### Added
- add command to install components via CLI
- add component dependency system (e.g. form automatically installs button, input)
- add overwrite confirmation when component already exists
- add auto-detect component directory (src/components, components, app/components)
- add zend-theme.config.json for user configuration
  - custom components directory
  - enable/disable auto dependencies
  - overwrite behavior
- improve CLI structure and internal utilities

### Changed
- component installation is now configurable and extensible
- CLI behavior is no longer hardcoded to src/

---

## 0.0.1
### Initial Release
- initialize project with `zend-theme init`
- generate default button component
