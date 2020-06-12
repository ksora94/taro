const PluginDummyApp = {}

function _getApp () { return PluginDummyApp }

// eslint-disable-next-line no-use-before-define
const getApp = getApp || _getApp

export default getApp
