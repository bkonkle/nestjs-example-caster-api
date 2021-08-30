const nxPreset = require('@nrwl/jest/preset')

module.exports = {
  ...nxPreset,
  globals: {
    ...nxPreset.globals,
    'ts-jest': {
      diagnostics: {
        warnOnly: true,
      },
    },
  },
}
