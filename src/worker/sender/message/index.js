import camel from 'lodash-es/camelCase';

export * from './transport';
import * as transport from './transport';

const map = Object.keys(transport).reduce((object, name) => {
  return Object.assign(object, {
    [camel(name)]: {
      object: transport[name]
    }
  });
}, {});

export {
  map
};
