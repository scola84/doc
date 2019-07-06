export * from './transport';
import * as transport from './transport';

const token = Object.keys(transport).reduce((object, name) => {
  return Object.assign(object, {
    [name]: {
      object: transport[name]
    }
  });
}, {});

export {
  token
};
