'use strict';

/**
 * Deduplicate one addon's children addons recursively from hostAddons.
 *
 * @private
 * @param {Object} hostAddons
 * @param {EmberAddon} dedupedAddon
 * @param {String} treeName
 */
module.exports = function deeplyNonDuplicatedAddon(hostAddons, dedupedAddon, treeName, { _dedupedAddons = new Set() } = {}) {
  if (dedupedAddon.addons.length === 0) {
    return _dedupedAddons;
  }

  dedupedAddon.addons.filter(addon => {
    // nested lazy engine will have it's own deeplyNonDuplicatedAddon, just keep it here
    if (addon.lazyLoading && addon.lazyLoading.enabled) {
      return true;
    }

    let hostAddon = hostAddons[addon.name];

    if (hostAddon && hostAddon.cacheKeyForTree) {
      let innerCacheKey = addon.cacheKeyForTree(treeName);
      let hostAddonCacheKey = hostAddon.cacheKeyForTree(treeName);

      if (
        innerCacheKey != null &&
        innerCacheKey === hostAddonCacheKey
      ) {
        // the addon specifies cache key and it is the same as host instance of the addon, skip the tree
        return false;
      }
    }

    if (addon.addons.length > 0) {
      deeplyNonDuplicatedAddon(hostAddons, addon, treeName, { _dedupedAddons });
    }

    return true;
  }).forEach(addon => {
    _dedupedAddons.add(addon);
  })

  return _dedupedAddons;
}
