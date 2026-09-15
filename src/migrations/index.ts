import * as migration_20260520_041533_initial from './20260520_041533_initial';
import * as migration_20260520_052613 from './20260520_052613';
import * as migration_20260520_142502_header_nav_children from './20260520_142502_header_nav_children';
import * as migration_20260521_064532_url_parity_collections from './20260521_064532_url_parity_collections';
import * as migration_20260915_120058_remove_template_collections from './20260915_120058_remove_template_collections';
import * as migration_20260915_122520_localize_content from './20260915_122520_localize_content';

export const migrations = [
  {
    up: migration_20260520_041533_initial.up,
    down: migration_20260520_041533_initial.down,
    name: '20260520_041533_initial',
  },
  {
    up: migration_20260520_052613.up,
    down: migration_20260520_052613.down,
    name: '20260520_052613',
  },
  {
    up: migration_20260520_142502_header_nav_children.up,
    down: migration_20260520_142502_header_nav_children.down,
    name: '20260520_142502_header_nav_children',
  },
  {
    up: migration_20260521_064532_url_parity_collections.up,
    down: migration_20260521_064532_url_parity_collections.down,
    name: '20260521_064532_url_parity_collections',
  },
  {
    up: migration_20260915_120058_remove_template_collections.up,
    down: migration_20260915_120058_remove_template_collections.down,
    name: '20260915_120058_remove_template_collections',
  },
  {
    up: migration_20260915_122520_localize_content.up,
    down: migration_20260915_122520_localize_content.down,
    name: '20260915_122520_localize_content'
  },
];
