import Bot from '../bot';
import { Command } from '../command';

class PingCmd extends Command {
  constructor(public bot: Bot) {
    super(['ping', 'p'], Bot.Role.Admin);
  }

  _help() {
    this.bot.sendLowMsg(
`**Aliases**
\`\`\`${this.aliases.join(', ')}\`\`\`
**Pinging**
Returns the milliseconds it takes for the bot to
communicate with the Discord API. It requires no
arguments.
\`\`\`;ping\`\`\`
${this._helpFooter()}
`,
      'Ping Command Help'
    );
  }

  _instruction() {
    const sock = this.bot.curMsg.client.ws;
    this.bot.sendLowMsg(`\u2002:clock3: ${sock.ping}ms`);
  }
}

export = PingCmd;