import Bot from '../bot';
import { Command } from '../command';

class WallCmd extends Command {

  get help() { return Strings.help(); }


  constructor(bot: Bot) {
    super(['wall'], Bot.Role.Everyone, bot);
  }


  _instructions(size: string) {
    const lines = +size;
    if (isNaN(lines)) return (
      this._bot.sendMedMsg(Strings.sizeNaN(size))
    );
    if (lines < 1) return (
      this._bot.sendMedMsg(Strings.sizeOutOfBounds())
    );
    this._sendWall(lines);
  }


  private _sendWall(lines: number) {
    let wall = '';
    while (lines--) wall += '‎‎\u200B\n';
    this._bot.curChannel.send(wall);
  }

}



namespace Strings {
  export const help = () => (
`**Making a Wall**
Sends a \`<size>\` amount of invisible lines, which when
large enough, creates the illusion of an invisible wall
of text. This is useful for giving the illusion of a *blank
channel*, *hiding off-topic content*, or *just having fun*.
\`\`\`;wall <size>\`\`\``
  );

  export const sizeNaN = (size: string) => (
`\`${size}\` is an invalid size for the wall.`
  );

  export const sizeOutOfBounds = () => (
'Wall size **must** be `greater than 0`'
  );
}
export = WallCmd;