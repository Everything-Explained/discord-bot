import Bot from '../bot';
import { Command } from '../command';
import axios from 'axios';
import config from '../config.json';

interface RNGData {
  jsonrpc: string;
  result: {
    random: {
      data: number[],
      completionTime: string;
    }
    bitsUsed: number,
    bitsLeft: number,
    requestsLeft: number,
    advisoryDelay: number
  },
  id: number;
}


class CoinflipCmd extends Command {

  rngService = axios.create({
    baseURL: 'https://api.random.org/json-rpc/2/invoke',
    headers: {
      'Content-Type': 'application/json'
    },
    timeout: 5000
  });

  private _rngData = {
    "jsonrpc": "2.0",
    "method": "generateIntegers",
    "params": {
      "apiKey": config.apiKeys.rng,
      "n": 1,
      "min": 1,
      "max": 2,
      "replacement": true,
      "base": 10
    },
    "id": 4077
  }


  constructor(public bot: Bot) {
    super(['coinflip', 'flipcoin', 'flip'], Bot.Role.Everyone);
  }



  _help() {
    this.bot.sendLowMsg(
`**Aliases**
\`\`\`${this.aliases.join(', ')}\`\`\`
**Heads or Tails?**
Generates a *Truly Random* coin flip, using an API which
provides numbers based on atmospheric noise.
\`\`\`;coinflip\`\`\`
**How it Works**
If you're interested in reading more about how it works,
head on over to https://www.random.org/ and check it out.

${this.helpFooter}`
    );
  }


  async _instruction() {
    const n = await this._get1or2();
    if (!n) return
    ;
    this.bot.sendLowMsg(
      `The coin landed on...${n == 1 ? 'TAILS' : 'HEADS'}!`
    );
  }


  private async _get1or2() {
    try {
      const resp = await this.rngService.post('', this._rngData);
      const data = resp.data as RNGData
      ;
      if (resp.status != 200) return this.bot.sendHighMsg(
`The API responded with code: \`${resp.status}\`

**Data**
\`\`\`${resp.data}\`\`\``
      );
      return data.result.random.data[0];
    }
    catch (err) {
      this.bot.sendException(
        'Oops, I had a problem executing the RNG API...',
        err.message,
        err.stack
      );
      return undefined;
    }
  }
}

export = CoinflipCmd;