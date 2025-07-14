export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomDelay(minSeconds, maxSeconds) {
  const ms = (Math.random() * (maxSeconds - minSeconds) + minSeconds) * 1000;
  return delay(ms);
}
