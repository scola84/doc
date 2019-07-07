import camel from 'lodash-es/camelCase';
import { Snippet } from '../snippet/snippet';

import funcBase from './func';
import infixBase from './infix';
import postfixBase from './postfix';
import prefixBase from './prefix';
import snippetBase from './snippet';

const custom = {
  from: {
    object: Snippet,
    options: {
      infix: '',
      name: 'from',
      prefix: 'FROM '
    }
  },
  string: {
    object: Snippet,
    options: {
      escape: 'value',
      infix: ' ',
      name: 'string'
    }
  },
  query: {
    object: Snippet,
    options: {
      infix: ' ',
      name: 'query'
    }
  }
};

const func = funcBase.reduce((object, name) => {
  return Object.assign(object, {
    [camel(name)]: {
      object: Snippet,
      options: {
        name,
        parens: true,
        prefix: name
      }
    }
  });
}, {});

const infix = infixBase.reduce((object, { name, token }) => {
  return Object.assign(object, {
    [camel(name)]: {
      object: Snippet,
      options: {
        infix: ` ${token} `,
        name
      }
    }
  });
}, {});

const postfix = postfixBase.reduce((object, name) => {
  return Object.assign(object, {
    [camel(name)]: {
      object: Snippet,
      options: {
        name,
        postfix: ` ${name}`
      }
    }
  });
}, {});

const prefix = prefixBase.reduce((object, name) => {
  return Object.assign(object, {
    [camel(name)]: {
      object: Snippet,
      options: {
        name,
        prefix: `${name} `
      }
    }
  });
}, {});

const snippet = Object.keys(snippetBase).reduce((master, group) => {
  return Object.keys(snippetBase[group]).reduce((object, name) => {
    return Object.assign(object, {
      [camel(name)]: {
        object: snippetBase[group][name]
      }
    });
  }, master);
}, {});

export {
  custom,
  snippet,
  infix,
  postfix,
  prefix,
  func
};
