// utils
import {
  getId,
  isValidMessage
} from './utils';

const SOLILOQUY_ID = Symbol.for('$$Soliloquy');

const PRIVATE_KEY = Symbol('$$SoliloquyPrivateKey');

window[SOLILOQUY_ID] = window.opener ? window.opener[SOLILOQUY_ID] : {};

export const createDispatcher = ({
  browserWindow,
  cache,
  handlers,
  key,
  receiveId,
  receiveWindow,
  sendId,
  sendWindow,
}) => {
  const dispatcher = {
    closeChild: () => browserWindow.close(),
    onReceive(fn) {
      const handler = (event) => {
        const isValid = isValidMessage({
          key,
          message: event.data,
          origin: sendWindow.origin,
          previousId: cache[receiveId],
          privateKey: PRIVATE_KEY,
        });

        if (isValid && typeof fn === 'function') {
          fn(event.data.message);
        }
      };

      handlers.push(handler);

      receiveWindow.addEventListener('message', handler);

      return dispatcher;
    },
    send(key, message = null) {
      const time = Date.now();

      sendWindow.postMessage(
        {
          id: getId({
            key,
            message,
            origin: receiveWindow.origin,
            previousId: cache[sendId],
            privateKey: PRIVATE_KEY,
            time,
          }),
          key,
          message,
          previousId: cache[sendId],
          time,
        },
        receiveWindow.origin
      );

      return dispatcher;
    },
  };

  return dispatcher;
};

export const createChannels = ({browserWindow, key}) => {
  const cache = {
    childHandlers: [],
    childPreviousId: getId({
      data: 'childDispatcher',
      key,
      previousId: 0,
      time: Date.now(),
    }),
    parentHandlers: [],
    parentPreviousId: getId({
      data: 'parentDispatcher',
      key,
      previousId: 0,
      time: Date.now(),
    }),
  };

  browserWindow.addEventListener('beforeunload', () => {
    cache.childHandlers.forEach((handler) => browserWindow.removeEventListener('message', handler));
  });

  browserWindow.opener.addEventListener('beforeunload', () => {
    cache.parentHandlers.forEach((handler) => browserWindow.opener.removeEventListener('message', handler));
  });

  return {
    child: createDispatcher({
      browserWindow,
      cache,
      handlers: cache.childHandlers,
      key,
      receiveId: 'parentPreviousId',
      receiveWindow: browserWindow,
      sendId: 'childPreviousId',
      sendWindow: browserWindow.opener,
    }),
    parent: createDispatcher({
      browserWindow,
      cache,
      handlers: cache.parentHandlers,
      key,
      receiveId: 'childPreviousId',
      receiveWindow: browserWindow.opener,
      sendId: 'parentPreviousId',
      sendWindow: browserWindow,
    }),
  };
};

export const getChannel = (browserWindow) =>
  window[SOLILOQUY_ID][browserWindow.name] ? window[SOLILOQUY_ID][browserWindow.name].child : null;

export const removeChannel = (browserWindow) => delete window[SOLILOQUY_ID][browserWindow.name];

export const setChannels = (browserWindow, channels) => (window[SOLILOQUY_ID][browserWindow.name] = channels);
