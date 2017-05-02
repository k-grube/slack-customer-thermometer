#!/usr/bin/env node

/**
 * Created by kgrube on 5/2/2017.
 */
if (process.env.NODE_ENV !== 'production') {
  if (!require('piping')({
      hook: true,
      ignore: /(\/\.|~$|\.json$)/i,
    })) {
    return;
  }
}
require('../server.babel'); // babel registration (runtime transpilation for node)
require('../app');
