// channels
import {
  createChannels,
  getChannel as getBrowserWindowChannel,
  removeChannel,
  setChannels
} from './channels';

// utils
import {getWindowFeatures} from './utils';

import {BEFORE_UNLOAD_DELAY} from './constants';

export const getChannel = () => getBrowserWindowChannel(window);

export const openChannel = (params) => {
  const {autoCloseChild = true, destination, key, name = `NewWindow-${Date.now()}`, onChildLoaded, ...options} = params;

  const browserWindow = window.open(destination, name, getWindowFeatures(options));

  if (!browserWindow) {
    return null;
  }

  const channels = createChannels({
    browserWindow,
    key,
  });

  setChannels(browserWindow, channels);

  browserWindow.addEventListener('load', () => onChildLoaded(browserWindow));

  browserWindow.addEventListener('beforeunload', () =>
    setTimeout(() => {
      const result = openChannel(
        Object.assign({}, params, {
          destination: '',
          name: browserWindow.name,
        })
      );

      if (!result) {
        removeChannel(browserWindow);
      }
    }, BEFORE_UNLOAD_DELAY)
  );

  return channels.parent;
};
