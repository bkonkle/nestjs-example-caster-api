/* eslint-disable @typescript-eslint/no-var-requires */
const withNx = require('@nrwl/next/plugins/with-nx')

module.exports = withNx({
  nx: {
    // https://github.com/gregberge/svgr
    svgr: true,
  },
  env: {
    BASE_URL: process.env.BASE_URL,
  },
  webpack5: true,
})
