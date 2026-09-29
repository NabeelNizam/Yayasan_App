import * as migration_20260928_094827 from './20260928_094827';
import * as migration_20260929_120527 from './20260929_120527';

export const migrations = [
  {
    up: migration_20260928_094827.up,
    down: migration_20260928_094827.down,
    name: '20260928_094827',
  },
  {
    up: migration_20260929_120527.up,
    down: migration_20260929_120527.down,
    name: '20260929_120527'
  },
];
