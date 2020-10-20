import Bot from '../bot';
import { Command } from '../command';
import axios from 'axios';
import config from '../config.json';



interface RNGData {
  jsonrpc: string;
  result: {
    random: {
      data: number[][],
      completionTime: string;
    }
    bitsUsed: number,
    bitsLeft: number,
    requestsLeft: number,
    advisoryDelay: number
  },
  id: number;
}



class CoinFlipCmd extends Command {

  private readonly _rngService = axios.create({
    baseURL: 'https://api.random.org/json-rpc/2/invoke',
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 5000
  });

  private readonly _rngReqData = {
    "jsonrpc": "2.0",
    "method": "generateIntegerSequences",
    "params": {
      "apiKey": config.apiKeys.rng,
      "n": 2,
      "length": [1, 1],
      "min": [1, 1],
      "max": [2, 1e6]
    },
    "id": 1337
  }

  get help() {
    return Strings.help();
  }


  constructor(bot: Bot) {
    super(['coin-flip', 'coinflip', 'flipcoin', 'flip'], Bot.Role.Everyone, bot);
  }


  async _instructions() {
    const numArry = await this._getRandomNumbers();
    if (!numArry) return
    ;
    const [n, n2] = numArry;
    // 1 in 1e6 chance
    if (n2 == 1e6) return this._bot.sendLowMsg(Strings.coinOnSide());
    // 1 in 2 chance
    this._bot.sendLowMsg(
      Strings.headsOrTails(n == 1 ? 'TAILS' : 'HEADS')
    );
  }


  private async _getRandomNumbers() {
    try {
      const resp = await this._rngService.post('', this._rngReqData);
      const data = resp.data as RNGData
      ;
      if (resp.status != 200) return this._bot.sendHighMsg(
        Strings.statusError(resp.status, resp.data)
      );
      return data.result.random.data.map(v => v[0]);
    }
    catch (err) {
      this._bot.sendException(Strings.exception(), err);
      return undefined;
    }
  }

}


namespace Strings {

  export const help = () => (
`**Heads or Tails?**
Generates a *Truly Random* coin flip, using an API which
provides numbers based on atmospheric noise.
\`\`\`;coinflip\`\`\`
**How it Works**
If you're interested in reading more about how it works,
head on over to https://www.random.org/ and check it out.`
  );

  export const coinOnSide = () => (
`Umm...:flushed:...the coin landed on.....it's SIDE!!`
  );

  export const headsOrTails = (val: string) => (
`The coin landed on...${val}!`
  );

  export const statusError = (status: number, data: any) => (
`The API responded with code: \`${status}\`

**Data**
\`\`\`${data}\`\`\``
  );

  export const exception = () => (
`Oops, I had a problem executing the RNG API...`
  );
}
export = CoinFlipCmd;