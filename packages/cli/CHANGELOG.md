# Changelog

## 1.0.0

### 🎉 Major Release - Production Ready

This release introduces a complete architecture overhaul with Meta Schema v1.0, type-based component system, and full template support.

### Added

#### Meta Schema v1.0
- **Central schema system** for all components/templates
- Required fields: `name`, `type`, `category`
- Optional fields: `dependencies`, `variants`, `slots`, `description`, `customizable`, `overwrite`
- Forward compatible design (supports unknown fields)

#### Validator System
- **Meta validation** before component installation
- Clear error messages for invalid meta.json
- Fail-fast approach for better UX

#### Type-based Component System
- **Three component types** with distinct behaviors:
  - `ui`: Single file components → `components/ui/`
  - `layout`: Folder components → `components/layout/`
  - `template`: Full page templates → `app/` or `src/app/`
- Smart path detection (finds existing `src/app` or `app` directory)

#### Component Categories
- **Four category levels** for better organization:
  - `primitive`: Basic reusable components (button, input)
  - `composite`: Composed components (card, form)
  - `section`: Page sections (hero-section) → `components/` (not `ui/`)
  - `page`: Full page templates (dashboard)

#### Template System
- **Full template support** for Next.js pages
- Dashboard template with page + layout
- Heavy confirmation for template overwrites
- Automatic dependency installation for templates

#### Section Components
- **Section category support** (e.g., hero-section)
- Sections install to `components/` directly (not `components/ui/`)
- Single file output (e.g., `hero-section.jsx`)

#### Enhanced Dependency System
- **Recursive dependency installation**
- Prevents infinite loops with Set tracking
- Prevents duplicate installations
- Works with all component types

#### Smart Path Detection
- **Intelligent directory detection**:
  - Checks config `componentsDir` first
  - Auto-detects from candidates: `src/components`, `components`, `app/components`
  - For templates: checks `src/app` then `app`
  - Uses existing structure (no duplicate creation)

#### Config System Enhancements
- **zend-theme.config.json** with full feature support:
  - `componentsDir`: Custom component directory
  - `style`: CSS preset/theme
  - `autoDependencies`: Enable/disable auto dependency installation
  - `overwrite`: Default overwrite behavior
- Auto-generate config during `init` with interactive prompts
- Backward compatible (works without config)

#### Overwrite System
- **Three-level overwrite check**:
  1. `meta.overwrite` (component-level)
  2. `config.overwrite` (global)
  3. User confirmation (interactive)
- Heavy confirmation for templates (multiple files)
- Skip existing components with clear messaging

### Changed

#### Breaking Changes
- **Meta schema is now required** - all components must have valid `meta.json` with `name`, `type`, and `category`
- **Component structure** - sections now go to `components/` instead of `components/ui/`
- **Template installation** - templates now install to `app/` or `src/app/` (not `components/`)

#### Improvements
- Better error messages with validation
- More intelligent path resolution
- Cleaner component organization
- Production-ready architecture

### Fixed
- Path duplication issues (no more nested paths)
- Component detection across different project structures
- Dependency installation edge cases

---

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
