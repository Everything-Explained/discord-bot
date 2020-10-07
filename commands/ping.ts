import Bot from '../bot';
import { Command } from '../command';

class PingCmd extends Command {

  get help() {
    return (
`**Pinging**
Returns the milliseconds it takes for the bot to
communicate with the Discord API. It requires no
arguments.
\`\`\`;ping\`\`\``
    );
  }

  constructor(public bot: Bot) {
    super(['ping', 'p'], Bot.Role.Admin);
  }


  _instruction() {
    const sock = this.bot.curMsg.client.ws;
    this.bot.sendLowMsg(`\u2002:clock3: ${sock.ping}ms`);
  }
}

export = PingCmd;