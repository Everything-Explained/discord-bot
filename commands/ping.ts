import Bot from '../bot';
import { Command } from '../command';

class PingCmd extends Command {

  get help() { return Strings.help(); }

  constructor(bot: Bot) {
    super(['ping', 'p'], Bot.Role.Admin, bot);
  }


  _instructions() {
    const sock = this._bot.curMsg.client.ws;
    this._bot.sendLowMsg(Strings.ping(sock.ping));
  }

}


namespace Strings {
  export const help = () => (
`**Pinging**
Returns the milliseconds it takes for the bot to
communicate with the Discord API. It requires no
arguments.
\`\`\`;ping\`\`\``
  );

  export const ping = (ping: number) => (
`\u2002:clock3: ${ping}ms`
  );
}
export = PingCmd;