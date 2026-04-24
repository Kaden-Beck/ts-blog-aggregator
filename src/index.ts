import { readConfig, setUser } from './config';

function main() {
  setUser('Kaden');

  console.log(readConfig())
}

main();
