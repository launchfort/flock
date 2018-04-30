const { replaceYoRc } = require('../../config')

function upgrade ({ cfgFileName }) {
  return replaceYoRc('.yo-rc-.json', { cfgFileName })
}

exports.upgrade = upgrade
