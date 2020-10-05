import Bot from '../bot';
import { Command } from '../command';

class WallCmd extends Command {

  constructor(public bot: Bot) {
    super(['wall'], Bot.Role.Everyone);
  }

  _help() {
    this.bot.sendLowMsg(
`**Aliases**
\`\`\`${this.aliases.join(', ')}\`\`\`
**Wall**
Sends a \`<size>\` amount of invisible lines, which when
large enough, creates the illusion of an invisible wall
of text. This is useful for giving the illusion of a *blank
channel*, *hiding off-topic content*, or *just having fun*.
\`\`\`;wall <size>\`\`\`
${this.helpFooter}`,
      'Wall Command Help'
    );
  }

  _instruction(size: string) {
    let lines = +size;
    if (isNaN(lines)) {
      return this.bot.sendMedMsg(
        `\`${size}\` is an invalid size for the wall.`
      );
    }
    if (lines < 1) return this.bot.sendMedMsg(
      'Wall size **must** be `greater than 0`'
    );
    let wall = '';
    while (lines--) {
      wall += '‎‎\u200B\n';
    }
    this.bot.curChannel.send(wall);
  }


}

export = WallCmd;