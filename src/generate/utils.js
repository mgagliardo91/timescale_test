const TEXT_VALUES = [
  'on',
  'off',
  'open',
  'closed',
  'ready',
  'waiting',
  'finished',
  'error'
];

export const randomFloat = (min = 0, max = 100) => () => {
  return (Math.random() * (max - min) + min);
}

const randomTextIndex = randomFloat(0, TEXT_VALUES.length);

export const randomText = () => {
  return TEXT_VALUES[Math.round(randomTextIndex())];
}