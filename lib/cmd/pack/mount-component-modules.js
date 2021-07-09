/* eslint-env browser */
/* global __WORKING_DIR__:false */

'use strict';

/**
 * Find all Clay components---DOM elements whose `data-uri` attribute
 * contains "_components/"---
 *
 * @returns {Promise} - A Promise that resolves when Webpack has finished
 *    initializing Clay components.
 */
function mountComponentModules() {
  return Promise.resolve().then(() => {
    const componentSelector = '[data-uri*="_components/"]';
    const componentElements = Array.from(document.querySelectorAll(componentSelector));

    return componentElements;
  }).then(componentElements => {
    const componentPromises = componentElements.map(element => {
      const componentURI = element.dataset.uri;
      const [, name] = Array.from(/_components\/(.+?)(\/instances|$)/.exec(componentURI) || []);

      if (!name) {
        const err = new Error(`No component script found for ${ element } (at ${ componentURI }).`, {
          element,
          componentURI
        });

        console.error(err);

        return Promise.reject(err);
      };

      return import(`components/${name}/client.js`)
        .then(mod => mod && mod.default || mod)
        .then(mod => {
          if (typeof mod === 'function') {
            mod(element);
          }
        });
    });

    return Promise.allSettled(componentPromises);
  });
}

module.exports = mountComponentModules;
