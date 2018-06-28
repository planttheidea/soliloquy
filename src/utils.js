// external dependencies
import hash from 'hash-it';

export const getId = ({key, message, origin, previousId, privateKey, time}) =>
  hash({
    key,
    message,
    origin,
    previousId,
    privateKey,
    time,
  });

export const getNormalizedOptions = (options) =>
  Object.keys(options).reduce((coalescedOptions, option) => {
    // eslint-disable-next-line no-param-reassign
    coalescedOptions[option] = options[option] ? 'yes' : 'no';

    return coalescedOptions;
  }, {});

export const getWindowFeatures = (options) => {
  const normalizedOptions = getNormalizedOptions(options);

  return (
    Object.keys(normalizedOptions)
      .reduce((domString, feature) => `${domString}${feature}=${normalizedOptions[feature]},`, '')
      // eslint-disable-next-line no-magic-numbers
      .slice(0, -1) || void 0
  );
};

export const isValidMessage = ({key, message, origin, previousId, privateKey}) =>
  message.key === key
  && message.id ===
    getId(
      Object.assign({}, message, {
        origin,
        previousId,
        privateKey,
      })
    );

export const noop = () => {};
