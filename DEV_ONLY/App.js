import * as src from '../src';

const KEY = 'special-key';

const openButton = document.createElement('button');

openButton.style.marginBottom = '15px';
openButton.style.marginRight = '15px';

openButton.textContent = 'Open window';
openButton.onclick = () => {
  const parent = src.openChannel({
    destination: 'http://localhost:3000',
    key: KEY,
    onChildLoaded() {
      console.log('loaded');
    },
  });

  parent.onReceive((data) => {
    console.log('received', data);
  });

  // eslint-disable-next-line no-magic-numbers
  setTimeout(() => parent.send(KEY, 'have you loaded?'), 2000);
};

const sendButton = document.createElement('button');

const channel = src.getChannel();

console.log(channel);

if (channel) {
  channel.onReceive((message) => console.log(message, 'Yes!'));
}

sendButton.textContent = 'Send stuff';
sendButton.onclick = () => {
  if (channel) {
    channel.send(KEY, {
      some: 'data',
      time: Date.now(),
    });
  }
};

document.body.appendChild(openButton);
document.body.appendChild(sendButton);
